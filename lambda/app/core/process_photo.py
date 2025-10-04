from dataclasses import dataclass
import os
from typing import Any

from PIL import Image
from PIL.ExifTags import TAGS
from PIL.ImageFile import ImageFile

from app.model.photo import PhotoMetadata, PhotoSize


@dataclass
class ResizeConfig:
    size: int
    label: str


def extract_exif(image: ImageFile) -> dict[str, Any]:
    exif_raw: dict[int, Any] = image._getexif()  # type: ignore
    exif_label = {TAGS.get(tag, str(tag)): value for tag, value in exif_raw.items()}
    return exif_label


def process(image_path: str, target_dir: str) -> PhotoMetadata:
    configs = [ResizeConfig(3840, 'large'), ResizeConfig(1920, 'medium'), ResizeConfig(240, 'thumbnail')]
    os.makedirs(target_dir, exist_ok=True)

    with Image.open(image_path) as image:
        exif = extract_exif(image)
        metadata = PhotoMetadata.from_exif(exif)

        original_size = PhotoSize(*image.size)
        for c in configs:
            resized = image.resize(original_size.resize(c.size).to_tuple())
            resized.save(f'{target_dir}/{c.label}.webp')

    return metadata
