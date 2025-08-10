from image.resize import InputConfig, OutputConfig, OutputFormat, resize, ResizeConfig


resize_config = ResizeConfig(
    input_config=InputConfig(path='sample/input/001.jpg'),
    output_configs=[
        OutputConfig(format=OutputFormat.WEBP, path='sample/output/001.webp'),
    ],
)


def main():
    resize(resize_config)


if __name__ == '__main__':
    main()
