from dataclasses import dataclass
from enum import Enum

from PIL import Image


@dataclass
class InputConfig:
    path: str


class OutputFormat(Enum):
    WEBP = 'webp'


@dataclass
class OutputConfig:
    format: OutputFormat
    size: int
    path: str


@dataclass
class ResizeConfig:
    input_config: InputConfig
    output_configs: list[OutputConfig]


class ImageSize:
    def __init__(self, w: int, h: int):
        self._w = w
        self._h = h

    @property
    def size(self) -> tuple[int, int]:
        return (self._w, self._h)

    def resize(self, new_size: int) -> 'ImageSize':
        w, h = self._w, self._h
        if w >= h:
            nw = new_size
            nh = h * new_size // w
        else:
            nh = new_size
            nw = w * new_size // h
        return self.__class__(nw, nh)


def resize(resize_config: ResizeConfig) -> None:
    input_path = resize_config.input_config.path

    with Image.open(input_path) as image:
        for output_config in resize_config.output_configs:
            old_size = ImageSize(*image.size)
            new_size = old_size.resize(output_config.size)
            new_image = image.resize(new_size.size)
            new_image.save(output_config.path, format=output_config.format.value)
