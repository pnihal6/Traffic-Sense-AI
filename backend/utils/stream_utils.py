import os
import time
import cv2
import yt_dlp

def try_open(cap_url):
    cap = None
    try:
        cap = cv2.VideoCapture(cap_url, cv2.CAP_FFMPEG)
        time.sleep(0.3)
        if not cap.isOpened():
            if cap is not None:
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
    # Local file?
    if os.path.exists(source):
        return try_open(source), "file"

    # direct HTTP/RTSP?
    cap = try_open(source)
    if cap:
        return cap, "direct"

    # YouTube?
    if "youtube.com" in source or "youtu.be" in source:
        direct = resolve_youtube_with_ytdlp(source)
        if direct:
            cap = try_open(direct)
            if cap:
                return cap, "ytdlp"

    return None, None
