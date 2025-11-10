import os
import time
import threading
import queue
import cv2
import subprocess
import yt_dlp

try:
    import streamlink
except Exception:
    streamlink = None

from ultralytics import YOLO
import supervision as sv  # ByteTrack, helpers

# Only these 4 classes count
COUNTABLE = ("car", "van", "truck", "bus")

# Map YOLO label names -> our canonical names
# (If your trained names differ, edit here)
NAME_MAP = {
    "car": "car",
    "van": "van",
    "truck": "truck",
    "bus": "bus",
}

def resolve_with_streamlink(url: str):
    if streamlink is None:
        return None
    try:
        streams = streamlink.streams(url)
        if not streams:
            return None
        best = streams.get("best") or next(iter(streams.values()))
        return best.to_url()
    except Exception as e:
        print("streamlink error:", e)
        return None

def try_open(cap_url):
    cap = None
    try:
        # MP4 focus; CAP_FFMPEG helps with container variance
        cap = cv2.VideoCapture(cap_url, cv2.CAP_FFMPEG)
        time.sleep(0.3)
        if not cap.isOpened():
            cap.release()
            return None
        return cap
    except Exception:
        try:
            if cap is not None:
                cap.release()
        except Exception:
            pass
        return None

def resolve_youtube_with_ytdlp(url: str):
    try:
        ydl_opts = {
            "format": "best[ext=mp4]/best",
            "quiet": True,
            "noplaylist": True,
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return info.get("url", None)
    except Exception as e:
        print("yt-dlp resolve error:", e)
        return None

def open_source(source: str):
    if os.path.exists(source):
        return try_open(source), "file"

    # direct attempt (HTTP/RTSP etc.)
    cap = try_open(source)
    if cap:
        return cap, "direct"

    # youtube links → use yt-dlp
    if "youtube.com" in source or "youtu.be" in source:
        print("Resolving YouTube link via yt-dlp…")
        direct = resolve_youtube_with_ytdlp(source)
        if direct:
            cap = try_open(direct)
            if cap:
                return cap, "ytdlp"
        print("yt-dlp failed to resolve YouTube stream")

    # fallback to streamlink if present
    resolved = resolve_with_streamlink(source)
    if resolved:
        cap = try_open(resolved)
        if cap:
            return cap, "streamlink"

    return None, None


class StreamSession:
    def __init__(self, sid: int, models_dir: str):
        self.sid = sid
        self.models_dir = models_dir
        self.thread = None
        self.stop_event = threading.Event()
        self.frame_q = queue.Queue(maxsize=2)

        # tracking + counting state
        self.tracker = sv.ByteTrack()  # ByteTrack instance
        self.seen_ids = {k: set() for k in COUNTABLE}         # cumulative identities per class
        self.cumulative = {k: 0 for k in COUNTABLE}           # cumulative counts
        self.current_visible = {k: 0 for k in COUNTABLE}      # per-frame visible

        self.stats_lock = threading.Lock()
        self.stats = {
            "sid": sid,
            "status": "idle",
            "model_file": None,
            "source": None,
            "resolved_via": None,
            "fps_in": 0.0,
            "fps_proc": 0.0,
            "counts": dict(self.cumulative),          # cumulative totals
            "current_visible": dict(self.current_visible),
            "frames": 0
        }

    def _reset_runtime(self):
        self.tracker = sv.ByteTrack()
        self.seen_ids = {k: set() for k in COUNTABLE}
        self.cumulative = {k: 0 for k in COUNTABLE}
        self.current_visible = {k: 0 for k in COUNTABLE}
        with self.stats_lock:
            self.stats["counts"] = dict(self.cumulative)
            self.stats["current_visible"] = dict(self.current_visible)

    def _update_counts_with_tracks(self, tracks: sv.Detections, class_names: dict):
        # Reset current visible
        current = {k: 0 for k in COUNTABLE}

        # tracks: sv.Detections with .tracker_id, .class_id
        if len(tracks) > 0:
            class_ids = tracks.class_id
            ids = tracks.tracker_id
            for i in range(len(tracks)):
                cls_id = int(class_ids[i])
                track_id = int(ids[i]) if ids is not None else None
                name = class_names.get(cls_id, str(cls_id)).lower()
                mapped = NAME_MAP.get(name)
                if mapped in COUNTABLE:
                    current[mapped] += 1
                    if track_id is not None and track_id not in self.seen_ids[mapped]:
                        self.seen_ids[mapped].add(track_id)
                        self.cumulative[mapped] += 1

        with self.stats_lock:
            self.stats["counts"] = dict(self.cumulative)
            self.stats["current_visible"] = dict(current)

    def run(self, model_file: str, source: str, conf: float, imgsz: int, interval: int):
        self.stop_event.clear()
        self._reset_runtime()

        self.stats.update({
            "status": "starting",
            "model_file": model_file,
            "source": source,
        })

        model_path = os.path.join(self.models_dir, model_file)
        model = YOLO(model_path)

        cap, resolved_via = open_source(source)
        if cap is None:
            with self.stats_lock:
                self.stats["status"] = "failed_open"
            return

        with self.stats_lock:
            self.stats["resolved_via"] = resolved_via
            self.stats["status"] = "running"

        input_fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        with self.stats_lock:
            self.stats["fps_in"] = float(input_fps)

        t0 = time.time()
        proc_frames = 0
        frame_idx = 0

        while not self.stop_event.is_set():
            ok, frame = cap.read()
            if not ok:
                break
            frame_idx += 1

            proc_frames += 1
            if proc_frames % 20 == 0:
                dt = time.time() - t0
                with self.stats_lock:
                    self.stats["fps_proc"] = proc_frames / dt if dt > 0 else 0.0

            # Skip N-1 frames if interval > 1 (still push latest raw for smoothness)
            if interval > 1 and (frame_idx % interval != 0):
                ok_raw, jpg_raw = cv2.imencode(".jpg", frame)
                if ok_raw and not self.frame_q.full():
                    self.frame_q.put(jpg_raw.tobytes())
                continue

            # ---------- DETECTION ----------
            res = model.predict(source=frame, conf=conf, imgsz=imgsz, verbose=False)[0]

            # ---------- TRACKING (ByteTrack) ----------
            dets = sv.Detections.from_ultralytics(res)
            # Ensure we carry class ids
            # (sv keeps .class_id, .confidence, .xyxy)
            tracks = self.tracker.update_with_detections(dets)

            # Update cumulative + current_visible based on tracks
            class_names = res.names if hasattr(res, "names") else {}
            self._update_counts_with_tracks(tracks, class_names)

            # ---------- DRAWING ----------
            # Use YOLO's plotted image (boxes), optional: could annotate IDs via supervision if desired
            plotted = res.plot()  # returns BGR image with boxes

            ok2, jpg = cv2.imencode(".jpg", plotted)
            if ok2 and not self.frame_q.full():
                self.frame_q.put(jpg.tobytes())

            with self.stats_lock:
                self.stats["frames"] += 1

        try:
            cap.release()
        except Exception:
            pass

        with self.stats_lock:
            self.stats["status"] = "stopped"

        del model

    def start(self, model_file, source, conf, imgsz, interval):
        if self.thread and self.thread.is_alive():
            return False, "session already running"
        self.thread = threading.Thread(
            target=self.run,
            args=(model_file, source, conf, imgsz, interval),
            daemon=True
        )
        self.thread.start()
        return True, "started"

    def stop(self):
        self.stop_event.set()
        if self.thread and self.thread.is_alive():
            self.thread.join(timeout=2.0)
        while not self.frame_q.empty():
            try:
                self.frame_q.get_nowait()
            except Exception:
                break

    def mjpeg_chunks(self):
        while not self.stop_event.is_set():
            try:
                frame = self.frame_q.get(timeout=1.0)
                yield frame
            except queue.Empty:
                continue

    def get_stats(self):
        with self.stats_lock:
            return dict(self.stats)


class StreamManager:
    def __init__(self, models_dir: str, max_sessions: int = 4):
        self.models_dir = models_dir
        self.max_sessions = max_sessions
        self.sessions = {sid: StreamSession(sid, models_dir) for sid in range(1, max_sessions + 1)}
        self.model_label_map = {
            "yolov8.pt": "YOLOv8",
            "yolov8-fdd.pt": "YOLOv8-FDD",
            "yolov8-fdidh-dysample.pt": "YOLOv8-FDIDH + Dysample",
            "yolov8-fdidh-dwr.pt": "YOLOv8-FDIDH + DWR",
            "yolofde.pt": "YOLO-FDE",
        }

    def get_model_choices(self):
        if not os.path.exists(self.models_dir):
            return []
        pts = [f for f in os.listdir(self.models_dir) if f.endswith(".pt")]
        return [{"file": f, "name": self.model_label_map.get(f, f)} for f in pts]

    def is_model_available(self, model_file: str) -> bool:
        return os.path.exists(os.path.join(self.models_dir, model_file))

    def start_session(self, sid: int, model_file: str, source: str, conf: float, imgsz: int, interval: int):
        if sid not in self.sessions:
            return False, "invalid sid"
        return self.sessions[sid].start(model_file, source, conf, imgsz, interval)

    def stop_session(self, sid: int):
        if sid in self.sessions:
            self.sessions[sid].stop()

    def has_session(self, sid: int) -> bool:
        s = self.sessions.get(sid)
        return s is not None and s.thread is not None and s.thread.is_alive()

    def mjpeg_generator(self, sid: int):
        s = self.sessions.get(sid)
        if not s:
            return
        yield from s.mjpeg_chunks()

    def get_stats(self, sid: int):
        s = self.sessions.get(sid)
        if not s:
            return None
        return s.get_stats()
