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

    def __repr__(self) -> str:
        return f'{self._w}x{self._h}'

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
        print(f'Input path: {self._input_config.path}')

    @staticmethod
    def _verify_output_config(format: OutputFormat, size: int, path: str) -> OutputConfig:
        if not isinstance(format, OutputFormat):
            raise ValueError(f'{format} is not valid OutputFormat')
        if not isinstance(size, int) or size <= 0:
            raise ValueError(f'{size} is not valid output size')
        if not isinstance(path, str):
            raise ValueError(f'{path} is not valid output path')
        if path.split('.')[-1] != format.value:
            raise ValueError(f'{path} must have extention .{format.value}')
        return OutputConfig(format, size, path)

    def add_output(self, format: OutputFormat, size: int, path: str) -> None:
        output_config = self._verify_output_config(format, size, path)
        self._output_configs.append(output_config)
        print(f'Added output config: {output_config}')

    @staticmethod
    def _prepare_directory(path: str) -> str:
        dir_path = os.path.dirname(path)
        if dir_path != '':
            os.makedirs(dir_path, exist_ok=True)
        return dir_path

    @staticmethod
    def _resize(image: ImageFile, output_config: OutputConfig) -> tuple[str, ImageSize]:
        old_size = ImageSize(*image.size)
        new_size = old_size.resize(output_config.size)
        new_image = image.resize(new_size.size)
        new_image.save(output_config.path, format=output_config.format.value)
        return output_config.path, new_size

    def run(self) -> None:
        print('Resizing...')
        with Image.open(self._input_config.path) as image:
            for output_config in self._output_configs:
                dir_path = self._prepare_directory(output_config.path)
                print(f'Prepared directory {dir_path}')
                output_path, output_size = self._resize(image, output_config)
                print(f'Resized to {output_path} ({output_size})')
        print('Resizing completed!')
