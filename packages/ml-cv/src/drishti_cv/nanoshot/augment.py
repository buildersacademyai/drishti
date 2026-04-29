"""Augment small nano-shot class directories to reach target image count."""
import cv2
import numpy as np
from pathlib import Path


def augment_image(img: np.ndarray) -> list:
    return [
        img.copy(),
        cv2.flip(img, 1),
        cv2.flip(img, 0),
        cv2.convertScaleAbs(img, alpha=1.2, beta=10),
        cv2.convertScaleAbs(img, alpha=0.8, beta=-10),
        cv2.GaussianBlur(img, (5, 5), 0),
        cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE),
        cv2.rotate(img, cv2.ROTATE_180),
    ]


def augment_class_dir(input_dir: str, output_dir: str, target_count: int = 120) -> int:
    src = Path(input_dir)
    dst = Path(output_dir)
    dst.mkdir(parents=True, exist_ok=True)
    images = list(src.glob("*.jpg")) + list(src.glob("*.png"))
    if not images:
        raise ValueError(f"No images in {input_dir}")
    count = 0
    for img_path in images:
        img = cv2.imread(str(img_path))
        if img is None:
            continue
        for i, aug in enumerate(augment_image(img)):
            out_path = dst / f"{img_path.stem}_aug{i}.jpg"
            cv2.imwrite(str(out_path), aug)
            count += 1
            if count >= target_count:
                return count
    return count


if __name__ == "__main__":
    import sys
    n = augment_class_dir(sys.argv[1], sys.argv[2], target_count=120)
    print(f"Generated {n} augmented images")
