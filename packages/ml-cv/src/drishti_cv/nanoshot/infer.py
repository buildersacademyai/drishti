"""Classify a nano-shot image as false_positive / habitat_likely / larvae_confirmed."""
import json
from pathlib import Path
import torch
import torch.nn.functional as F
from torchvision import transforms
from PIL import Image
import timm

MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "nanoshot_classifier.pth"

_model = None
_class_names = None
_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])


def _load_model():
    global _model, _class_names
    if _model is None:
        checkpoint = torch.load(str(MODEL_PATH), weights_only=True)
        _class_names = checkpoint["class_names"]
        n = checkpoint["num_classes"]
        _model = timm.create_model("efficientnet_b0", pretrained=False, num_classes=n)
        _model.load_state_dict(checkpoint["model_state_dict"])
        _model.eval()
    return _model, _class_names


def classify_image(image_path: str) -> dict:
    if not MODEL_PATH.exists():
        return {
            "class": "unknown",
            "confidence": 0.0,
            "note": "Model not trained yet — run nanoshot/train.py first",
        }
    model, class_names = _load_model()
    img = Image.open(image_path).convert("RGB")
    tensor = _transform(img).unsqueeze(0)
    with torch.no_grad():
        probs = F.softmax(model(tensor), dim=1)[0]
    top_idx = int(probs.argmax())
    return {
        "class": class_names[top_idx],
        "confidence": float(probs[top_idx]),
        "probabilities": {class_names[i]: float(probs[i]) for i in range(len(class_names))},
    }


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python infer.py <image.jpg>")
        sys.exit(1)
    result = classify_image(sys.argv[1])
    print(json.dumps(result, indent=2))
