import os
from flask import Blueprint, jsonify

models_bp = Blueprint("models", __name__)

# Map filenames -> pretty names (edit if you like)
MODEL_LABELS = {
    "yolov8.pt": "YOLOv8",
    "yolov8-fdd.pt": "YOLOv8-FDD",
    "yolov8-fdidh-dysample.pt": "YOLOv8-FDIDH + Dysample",
    "yolov8-fdidh-dwr.pt": "YOLOv8-FDIDH + DWR",
    "yolofde.pt": "YOLO-FDE",
}

def list_pt(models_dir):
    try:
        files = [f for f in os.listdir(models_dir) if f.endswith(".pt")]
    except Exception:
        return []
    out = []
    for f in files:
        out.append({"file": f, "name": MODEL_LABELS.get(f, f)})
    return out

@models_bp.route("/get-model-list", methods=["GET"])
def get_model_list_legacy():
    # legacy path for your earlier frontend call
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    models_dir = os.path.abspath(models_dir)
    names = [m["file"] for m in list_pt(models_dir)]
    return jsonify({"models": names})

@models_bp.route("/models", methods=["GET"])
def get_model_list_pretty():
    models_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    models_dir = os.path.abspath(models_dir)
    return jsonify(list_pt(models_dir))
