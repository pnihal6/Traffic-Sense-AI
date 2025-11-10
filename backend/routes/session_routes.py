from flask import Blueprint, request, jsonify
from session_model import save_session_record, fetch_all_sessions, delete_session

sessions_bp = Blueprint("sessions", __name__)

@sessions_bp.route("/sessions", methods=["GET"])
def list_sessions():
    return jsonify({"sessions": fetch_all_sessions()})

@sessions_bp.route("/sessions", methods=["POST"])
def save_session_route():
    """
    Expected JSON:
    {
      "model": "YOLO-FDE",
      "source": "YouTube - Mumbai Cam",
      "total": 523,
      "breakdown": {"car":410,"van":33,"truck":60,"bus":20},
      "avg_fps": 23.5
    }
    """
    data = request.get_json(silent=True) or {}
    model = (data.get("model") or "").strip()
    source = (data.get("source") or "").strip()
    total = int(data.get("total") or 0)
    breakdown = data.get("breakdown") or {}
    avg_fps = float(data.get("avg_fps") or 0)

    if not model or not source:
        return jsonify({"error": "model and source are required"}), 400

    save_session_record(model_used=model, source=source, total=total, breakdown=breakdown, avg_fps=avg_fps)
    return jsonify({"message": "saved"}), 201

@sessions_bp.route("/sessions/<int:session_id>", methods=["DELETE"])
def delete_session_route(session_id: int):
    ok = delete_session(session_id)
    if not ok:
        return jsonify({"error": "not found"}), 404
    return jsonify({"message": "deleted", "id": session_id})
