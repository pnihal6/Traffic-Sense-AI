import os
import time
import threading
import queue
import cv2
from ultralytics import YOLO
import supervision as sv

from .stream_utils import open_source

COUNTABLE = ("car", "van", "truck", "bus")
NAME_MAP = {"car":"car","van":"van","truck":"truck","bus":"bus"}

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))

class StreamSession:
    def __init__(self, sid: int):
        self.sid = sid
        self.thread = None
        self.stop_event = threading.Event()
        self.frame_q = queue.Queue(maxsize=2)

        self.tracker = sv.ByteTrack()
        self.seen_ids = {k: set() for k in COUNTABLE}
        self.cumulative = {k: 0 for k in COUNTABLE}
        self.current_visible = {k: 0 for k in COUNTABLE}
        self.stats_lock = threading.Lock()
        self.stats = {
            "sid": sid,
            "status": "idle",
            "model_file": None,
            "source": None,
            "resolved_via": None,
            "fps_in": 0.0,
            "fps_proc": 0.0,
            "counts": dict(self.cumulative),
            "current_visible": dict(self.current_visible),
            "frames": 0
        }
        self.local_upload_path = None  # for auto-delete

    def _reset(self):
        self.tracker = sv.ByteTrack()
        self.seen_ids = {k: set() for k in COUNTABLE}
        self.cumulative = {k: 0 for k in COUNTABLE}
        self.current_visible = {k: 0 for k in COUNTABLE}
        with self.stats_lock:
            self.stats["counts"] = dict(self.cumulative)
            self.stats["current_visible"] = dict(self.current_visible)

    def _update_counts(self, tracks: sv.Detections, class_names: dict):
        curr = {k: 0 for k in COUNTABLE}
        if len(tracks) > 0:
            ids = tracks.tracker_id
            class_ids = tracks.class_id
            for i in range(len(tracks)):
                tid = int(ids[i]) if ids is not None else None
                cid = int(class_ids[i])
                name = class_names.get(cid, str(cid)).lower()
                mapped = NAME_MAP.get(name)
                if mapped in COUNTABLE:
                    curr[mapped] += 1
                    if tid is not None and tid not in self.seen_ids[mapped]:
                        self.seen_ids[mapped].add(tid)
                        self.cumulative[mapped] += 1
        with self.stats_lock:
            self.stats["counts"] = dict(self.cumulative)
            self.stats["current_visible"] = dict(curr)

    def run(self, model_file: str, source: str, conf: float, imgsz: int, interval: int):
        self.stop_event.clear()
        self._reset()

        with self.stats_lock:
            self.stats.update({"status":"starting","model_file":model_file,"source":source})

        model_path = os.path.join(MODELS_DIR, model_file)
        model = YOLO(model_path)

        # detect if local upload
        if os.path.exists(source) and source.startswith(UPLOAD_DIR):
            self.local_upload_path = source
        else:
            self.local_upload_path = None

        cap, via = open_source(source)
        if cap is None:
            with self.stats_lock:
                self.stats["status"] = "failed_open"
            return

        with self.stats_lock:
            self.stats["resolved_via"] = via
            self.stats["status"] = "running"

        input_fps = cap.get(cv2.CAP_PROP_FPS) or 0.0
        with self.stats_lock:
            self.stats["fps_in"] = float(input_fps)

        t0 = time.time()
        proc = 0
        frame_idx = 0

        while not self.stop_event.is_set():
            ok, frame = cap.read()
            if not ok:
                break
            frame_idx += 1

            proc += 1
            if proc % 20 == 0:
                dt = time.time() - t0
                with self.stats_lock:
                    self.stats["fps_proc"] = proc / dt if dt > 0 else 0.0

            # skip frames if interval > 1
            if interval > 1 and (frame_idx % interval != 0):
                ok_raw, jpg_raw = cv2.imencode(".jpg", frame)
                if ok_raw and not self.frame_q.full():
                    self.frame_q.put(jpg_raw.tobytes())
                continue

            res = model.predict(source=frame, conf=conf, imgsz=imgsz, verbose=False)[0]
            dets = sv.Detections.from_ultralytics(res)
            tracks = self.tracker.update_with_detections(dets)
            class_names = res.names if hasattr(res, "names") else {}
            self._update_counts(tracks, class_names)

            plotted = res.plot()
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

        # Auto-delete uploaded local file (storage-friendly)
        if self.local_upload_path and os.path.exists(self.local_upload_path):
            try:
                os.remove(self.local_upload_path)
            except Exception as e:
                print("Auto-delete upload failed:", e)

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
    def __init__(self, max_sessions: int = 4):
        self.sessions = {sid: StreamSession(sid) for sid in range(1, max_sessions + 1)}

    def start_session(self, sid, model_file, source, conf, imgsz, interval):
        s = self.sessions.get(sid)
        if not s:
            return False, "invalid sid"
        return s.start(model_file, source, conf, imgsz, interval)

    def stop_session(self, sid):
        s = self.sessions.get(sid)
        if s:
            s.stop()

    def has_session(self, sid):
        s = self.sessions.get(sid)
        return s and s.thread and s.thread.is_alive()

    def mjpeg_generator(self, sid):
        s = self.sessions.get(sid)
        if not s:
            return
        yield from s.mjpeg_chunks()

    def get_stats(self, sid):
        s = self.sessions.get(sid)
        if not s:
            return None
        return s.get_stats()

# Singleton manager
stream_manager = StreamManager(max_sessions=4)
