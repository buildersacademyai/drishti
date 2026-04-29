"""Fine-tune YOLOv8 on Nepal drone imagery for habitat detection."""
import shutil
from pathlib import Path
from ultralytics import YOLO

DATA_YAML = Path(__file__).parent.parent.parent.parent / "data" / "yolo_dataset" / "data.yaml"
MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "yolov8_survey.pt"


def train(
    base_model: str = "yolov8s.pt",
    epochs: int = 50,
    img_size: int = 1024,
    batch: int = 8,
    device: str = "cpu",
) -> str:
    model = YOLO(base_model)
    model.train(
        data=str(DATA_YAML),
        epochs=epochs,
        imgsz=img_size,
        batch=batch,
        device=device,
        project="runs/survey",
        name="drishti_v1",
        pretrained=True,
        patience=15,
        save=True,
        exist_ok=True,
    )
    best = Path("runs/survey/drishti_v1/weights/best.pt")
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(best, MODEL_PATH)
    print(f"Model saved to {MODEL_PATH}")
    return str(MODEL_PATH)


if __name__ == "__main__":
    import torch
    device = "0" if torch.cuda.is_available() else "cpu"
    train(device=device)
