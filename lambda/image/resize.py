from dataclasses import dataclass

from PIL import Image


@dataclass
class InputConfig:
    input_path: str


@dataclass
class OutputConfig:
    output_path: str


@dataclass
class ResizeConfig:
    input_config: InputConfig
    output_configs: list[OutputConfig]


def resize(resize_config: ResizeConfig) -> None:
    input_path = resize_config.input_config.input_path

    with Image.open(input_path) as i:
        for c in resize_config.output_configs:
            i.save(c.output_path)
