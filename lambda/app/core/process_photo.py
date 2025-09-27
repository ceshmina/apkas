from dataclasses import dataclass
import os

from PIL import Image

from app.model.photo import PhotoSize


@dataclass
class ResizeConfig:
    size: int
    label: str


def process(image_path: str, target_dir: str) -> None:
    configs = [
        ResizeConfig(3840, 'large'),
        ResizeConfig(1920, 'medium'),
        ResizeConfig(240, 'thumbnail')
    ]
    os.makedirs(target_dir, exist_ok=True)

    with Image.open(image_path) as image:
        original_size = PhotoSize(*image.size)
        for c in configs:
            resized = image.resize(original_size.resize(c.size).to_tuple())
            resized.save(f'{target_dir}/{c.label}.webp')
