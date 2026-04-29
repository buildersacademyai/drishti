"""Tile survey imagery into 1024x1024 patches for YOLO annotation."""
import cv2
import os
from pathlib import Path


def tile_image(
    image_path: str,
    output_dir: str,
    tile_size: int = 1024,
    overlap: int = 128,
) -> list:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"Cannot read: {image_path}")
    h, w = img.shape[:2]
    Path(output_dir).mkdir(parents=True, exist_ok=True)
    tiles = []
    y = 0
    while y < h:
        x = 0
        while x < w:
            tile = img[y : y + tile_size, x : x + tile_size]
            if tile.shape[0] < 100 or tile.shape[1] < 100:
                x += tile_size - overlap
                continue
            name = f"tile_{y}_{x}.jpg"
            path = os.path.join(output_dir, name)
            cv2.imwrite(path, tile)
            tiles.append(path)
            x += tile_size - overlap
        y += tile_size - overlap
    return tiles


if __name__ == "__main__":
    import sys
    if len(sys.argv) < 3:
        print("Usage: python preprocess.py <image.jpg> <output_dir>")
        sys.exit(1)
    tiles = tile_image(sys.argv[1], sys.argv[2])
    print(f"Generated {len(tiles)} tiles → {sys.argv[2]}")
