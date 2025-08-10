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
    path: str


@dataclass
class ResizeConfig:
    input_config: InputConfig
    output_configs: list[OutputConfig]


def resize(resize_config: ResizeConfig) -> None:
    input_path = resize_config.input_config.path

    with Image.open(input_path) as i:
        for c in resize_config.output_configs:
            i.save(c.path, format=c.format.value)
