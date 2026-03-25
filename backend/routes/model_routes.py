import os
from flask import Blueprint, jsonify

models_bp = Blueprint("models", __name__)

# --------------------------------------------------
# Pretty names shown in frontend
# --------------------------------------------------
MODEL_LABELS = {
    # Existing
    "yolov8.pt": "YOLOv8",
    "yolov8-fdd.pt": "YOLOv8-FDD",
    "yolov8-fdidh-dysample.pt": "YOLOv8-FDIDH + DySample",
    "yolov8-fdidh-dwr.pt": "YOLOv8-FDIDH + DWR",
    "yolofde.pt": "YOLO-FDE",

    # New TrafficSense models
    "bifpn.pt": "YOLO + BiFPN",
    "mhsa.pt": "YOLO + MHSA",
    "msn.pt": "YOLO + MSN",
    "fde+bifpn+bytetrack.pt": "YOLO-FDE + BiFPN + ByteTrack",
}

# --------------------------------------------------
# Optional metadata (safe for future UI upgrades)
# --------------------------------------------------
MODEL_META = {
    "bifpn.pt": {
        "type": "detector",
        "features": ["BiFPN"],
        "tracking": False,
    },
    "mhsa.pt": {
        "type": "detector",
        "features": ["MHSA"],
        "tracking": False,
    },
    "msn.pt": {
        "type": "detector",
        "features": ["MSN"],
        "tracking": False,
    },
    "fde+bifpn+bytetrack.pt": {
        "type": "detector+tracker",
        "features": ["FDE", "BiFPN"],
        "tracking": True,
        "tracker": "ByteTrack",
    },
}

# --------------------------------------------------
# Helper
# --------------------------------------------------
def list_pt(models_dir):
    try:
        files = sorted(f for f in os.listdir(models_dir) if f.endswith(".pt"))
    except Exception:
        return []

    out = []
    for f in files:
        out.append({
            "file": f,
            "name": MODEL_LABELS.get(f, f),
            "meta": MODEL_META.get(f, {})
        })
    return out

# --------------------------------------------------
# Legacy endpoint (do NOT remove)
# --------------------------------------------------
@models_bp.route("/get-model-list", methods=["GET"])
def get_model_list_legacy():
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    models_dir = os.path.abspath(models_dir)

    names = [m["file"] for m in list_pt(models_dir)]
    return jsonify({"models": names})

# --------------------------------------------------
# Preferred endpoint (used by new frontend)
# --------------------------------------------------
@models_bp.route("/models", methods=["GET"])
def get_model_list_pretty():
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    models_dir = os.path.abspath(models_dir)

    return jsonify(list_pt(models_dir))
