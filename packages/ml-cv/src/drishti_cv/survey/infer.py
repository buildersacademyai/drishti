"""Run YOLOv8 survey detection on image files. Outputs detection dicts."""
import json
from pathlib import Path
from ultralytics import YOLO

MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "yolov8_survey.pt"
CLASS_NAMES = ["standing_water", "container", "drain", "pool"]


def infer_image(image_path: str, confidence_threshold: float = 0.4) -> list:
    if not MODEL_PATH.exists():
        raise FileNotFoundError(f"Model not found: {MODEL_PATH}. Run train.py first.")
    model = YOLO(str(MODEL_PATH))
    results = model(image_path, conf=confidence_threshold, verbose=False)
    detections = []
    for r in results:
        for box in r.boxes:
            detections.append({
                "detection_type": CLASS_NAMES[int(box.cls)],
                "confidence": float(box.conf),
                "bbox_xywhn": box.xywhn.tolist()[0],
            })
    return detections


def infer_directory(image_dir: str, confidence_threshold: float = 0.4) -> dict:
    results = {}
    for f in sorted(Path(image_dir).glob("*.jpg")):
        dets = infer_image(str(f), confidence_threshold)
        if dets:
            results[f.name] = dets
    return results


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python infer.py <image.jpg>")
        sys.exit(1)
    dets = infer_image(sys.argv[1])
    print(json.dumps(dets, indent=2))
