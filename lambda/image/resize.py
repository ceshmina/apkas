from dataclasses import dataclass
from enum import Enum
import os

from PIL import Image
from PIL.ImageFile import ImageFile


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


class ImageResizer:
    def __init__(self, input_config: InputConfig):
        self._input_config = input_config
        self._output_configs: list[OutputConfig] = []

    def add_output(self, format: OutputFormat, size: int, path: str) -> None:
        self._output_configs.append(OutputConfig(format, size, path))

    def _prepare_directory(self, path: str) -> None:
        dir_path = os.path.dirname(path)
        os.makedirs(dir_path, exist_ok=True)

    def _resize(self, image: ImageFile, output_config: OutputConfig) -> None:
        old_size = ImageSize(*image.size)
        new_size = old_size.resize(output_config.size)
        new_image = image.resize(new_size.size)
        new_image.save(output_config.path, format=output_config.format.value)

    def run(self) -> None:
        input_path = self._input_config.path
        with Image.open(input_path) as image:
            for output_config in self._output_configs:
                self._prepare_directory(output_config.path)
                self._resize(image, output_config)
