import os
import time
from flask import Blueprint, request, Response, jsonify
from werkzeug.utils import secure_filename
from inference.yolo_streamer import StreamManager

streams_bp = Blueprint("streams", __name__)

MANAGER = StreamManager(
    models_dir=os.path.join(os.getcwd(), "models"),
    max_sessions=4
)

UPLOAD_DIR = os.path.join(os.getcwd(), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Optional: simple cleanup of old files (> 12h)
def cleanup_uploads(max_age_hours=12):
    cutoff = time.time() - (max_age_hours * 3600)
    for name in os.listdir(UPLOAD_DIR):
        p = os.path.join(UPLOAD_DIR, name)
        try:
            if os.path.isfile(p) and os.path.getmtime(p) < cutoff:
                os.remove(p)
        except Exception:
            pass

@streams_bp.route("/model-list", methods=["GET"])
def model_list():
    """Return available .pt files with clean names for the dropdown."""
    return jsonify({"models": MANAGER.get_model_choices()})

@streams_bp.route("/upload-video", methods=["POST"])
def upload_video():
    """
    Accept a video file upload and save it to backend/uploads.
    Returns a server-side path to use as 'source' in /start.
    """
    cleanup_uploads()
    if 'file' not in request.files:
        return jsonify({"error": "no file field"}), 400

    f = request.files['file']
    if f.filename == '':
        return jsonify({"error": "empty filename"}), 400

    safe = secure_filename(f.filename)
    out_path = os.path.join(UPLOAD_DIR, f"{int(time.time())}_{safe}")
    f.save(out_path)

    # Return absolute path so backend can open it
    return jsonify({"path": out_path})

@streams_bp.route("/start", methods=["POST"])
def start_stream():
    """
    Start a stream session.
    Body (JSON or form): sid, model_file, source, conf, imgsz, interval
      - sid: 1..4
      - model_file: e.g. 'yolofde.pt'
      - source: local path or URL (YouTube/RTSP/HTTP)
      - conf: float, default 0.30
      - imgsz: int, default 640
      - interval: int, infer every N frames, default 1
    """
    data = request.get_json(silent=True) or request.form

    try:
        sid = int(data.get("sid", 1))
    except Exception:
        return jsonify({"error": "invalid sid"}), 400

    model_file = (data.get("model_file") or "").strip()
    source = (data.get("source") or "").strip()
    conf = float(data.get("conf", 0.30))
    imgsz = int(data.get("imgsz", 640))
    interval = max(1, int(data.get("interval", 1)))

    if not (1 <= sid <= MANAGER.max_sessions):
        return jsonify({"error": f"sid must be between 1 and {MANAGER.max_sessions}"}), 400

    if not MANAGER.is_model_available(model_file):
        return jsonify({"error": "model_file not found"}), 400

    if not source:
        return jsonify({"error": "source is required"}), 400

    ok, msg = MANAGER.start_session(
        sid=sid,
        model_file=model_file,
        source=source,
        conf=conf,
        imgsz=imgsz,
        interval=interval
    )
    if not ok:
        return jsonify({"error": msg}), 400

    return jsonify({"message": "stream started", "sid": sid})

@streams_bp.route("/stop", methods=["POST"])
def stop_stream():
    data = request.get_json(silent=True) or request.form
    try:
        sid = int(data.get("sid", 1))
    except Exception:
        return jsonify({"error": "invalid sid"}), 400

    MANAGER.stop_session(sid)
    return jsonify({"message": "stopped", "sid": sid})

@streams_bp.route("/mjpeg", methods=["GET"])
def mjpeg_feed():
    sid = int(request.args.get("sid", 1))
    if not MANAGER.has_session(sid):
        return jsonify({"error": "session not running"}), 404

    def gen():
        for chunk in MANAGER.mjpeg_generator(sid):
            yield (b"--frame\r\n"
                   b"Content-Type: image/jpeg\r\n\r\n" + chunk + b"\r\n")

    return Response(gen(), mimetype="multipart/x-mixed-replace; boundary=frame")

@streams_bp.route("/stats", methods=["GET"])
def get_stats():
    sid = int(request.args.get("sid", 1))
    stats = MANAGER.get_stats(sid)
    if stats is None:
        return jsonify({"error": "session not running"}), 404
    return jsonify(stats)
