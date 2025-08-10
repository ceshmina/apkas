from image.resize import InputConfig, OutputConfig, resize, ResizeConfig


resize_config = ResizeConfig(
    input_config=InputConfig(input_path='sample/input/001.jpg'),
    output_configs=[
        OutputConfig(output_path='sample/output/001.jpg'),
    ],
)


def main():
    resize(resize_config)


if __name__ == '__main__':
    main()
