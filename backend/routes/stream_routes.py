import os
from flask import Blueprint, request, jsonify, Response
from werkzeug.utils import secure_filename

from utils.video_worker import stream_manager

streams_bp = Blueprint("streams", __name__)

UPLOAD_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

@streams_bp.route("/start", methods=["POST"])
def start_stream():
    """
    JSON: { sid, model_file, source, conf, imgsz, interval }
    """
    data = request.get_json(silent=True) or {}
    sid = int(data.get("sid", 0))
    model_file = (data.get("model_file") or "").strip()
    source = (data.get("source") or "").strip()
    conf = float(data.get("conf") or 0.3)
    imgsz = int(data.get("imgsz") or 640)
    interval = int(data.get("interval") or 1)

    ok, msg = stream_manager.start_session(
        sid=sid, model_file=model_file, source=source,
        conf=conf, imgsz=imgsz, interval=interval
    )
    status = 200 if ok else 400
    return jsonify({"ok": ok, "message": msg}), status

@streams_bp.route("/stop", methods=["POST"])
def stop_stream():
    data = request.get_json(silent=True) or {}
    sid = int(data.get("sid", 0))
    stream_manager.stop_session(sid)
    return jsonify({"ok": True})

@streams_bp.route("/stats", methods=["GET"])
def stats():
    sid = int(request.args.get("sid", "0"))
    s = stream_manager.get_stats(sid)
    if not s:
        return jsonify({"error": "invalid sid or no stats"}), 404
    return jsonify(s)

@streams_bp.route("/mjpeg", methods=["GET"])
def mjpeg():
    sid = int(request.args.get("sid", "0"))
    if not stream_manager.has_session(sid):
        return Response(status=404)

    def gen():
        boundary = b"--frame"
        yield b""
        for jpg in stream_manager.mjpeg_generator(sid):
            yield b"--frame\r\nContent-Type: image/jpeg\r\n\r\n" + jpg + b"\r\n"
    return Response(gen(), mimetype="multipart/x-mixed-replace; boundary=frame")

@streams_bp.route("/upload", methods=["POST"])
def upload():
    """
    multipart/form-data with 'file'
    Returns: {"path": absolute_path}
    """
    if "file" not in request.files:
        return jsonify({"error": "no file"}), 400
    f = request.files["file"]
    if f.filename == "":
        return jsonify({"error": "empty filename"}), 400

    filename = secure_filename(f.filename)
    abs_path = os.path.join(UPLOAD_DIR, filename)
    f.save(abs_path)
    return jsonify({"path": abs_path})
