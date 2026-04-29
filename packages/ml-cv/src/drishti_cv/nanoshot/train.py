"""Train EfficientNet-B0 nano-shot classifier. Saves state dict (.pth — not pickle)."""
import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from pathlib import Path
import timm

MODEL_PATH = Path(__file__).parent.parent.parent.parent / "models" / "nanoshot_classifier.pth"
CLASSES = ["false_positive", "habitat_likely", "larvae_confirmed"]


def _get_transforms(is_train: bool) -> transforms.Compose:
    if is_train:
        return transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.2),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
        ])
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
    ])


def train(
    data_dir: str = "data/nanoshot_dataset",
    epochs: int = 20,
    batch_size: int = 16,
    lr: float = 1e-4,
    device: str | None = None,
) -> str:
    """
    Train EfficientNet-B0 on nano-shot images.
    data_dir must contain train/{class}/ and val/{class}/ subdirectories.
    Saves state dict to MODEL_PATH — safe for redistribution (no pickle).
    """
    dev = device or ("cuda" if torch.cuda.is_available() else "cpu")
    train_ds = datasets.ImageFolder(f"{data_dir}/train", transform=_get_transforms(True))
    val_ds = datasets.ImageFolder(f"{data_dir}/val", transform=_get_transforms(False))
    train_dl = DataLoader(train_ds, batch_size=batch_size, shuffle=True, num_workers=2)
    val_dl = DataLoader(val_ds, batch_size=batch_size, shuffle=False, num_workers=2)

    model = timm.create_model("efficientnet_b0", pretrained=True, num_classes=len(train_ds.classes))
    model = model.to(dev)
    optimizer = torch.optim.AdamW(model.parameters(), lr=lr)
    criterion = nn.CrossEntropyLoss()
    best_val_acc = 0.0

    for epoch in range(epochs):
        model.train()
        for imgs, labels in train_dl:
            imgs, labels = imgs.to(dev), labels.to(dev)
            optimizer.zero_grad()
            loss = criterion(model(imgs), labels)
            loss.backward()
            optimizer.step()

        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for imgs, labels in val_dl:
                imgs, labels = imgs.to(dev), labels.to(dev)
                preds = model(imgs).argmax(dim=1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)
        val_acc = correct / total if total else 0.0
        print(f"Epoch {epoch + 1}/{epochs} — val_acc: {val_acc:.3f}")

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
            torch.save({
                "model_state_dict": model.state_dict(),
                "class_names": train_ds.classes,
                "val_acc": best_val_acc,
                "architecture": "efficientnet_b0",
                "num_classes": len(train_ds.classes),
            }, str(MODEL_PATH))

    print(f"Best val_acc: {best_val_acc:.3f} — saved to {MODEL_PATH}")
    return str(MODEL_PATH)


if __name__ == "__main__":
    train()
