from image.resize import ImageResizer, InputConfig, OutputConfig, OutputFormat


def main():
    input_config = InputConfig(path='sample/input/001.jpg')
    resizer = ImageResizer(input_config)
    resizer.add_output(OutputFormat.WEBP, 3840, 'sample/output/large.webp')
    resizer.add_output(OutputFormat.WEBP, 1600, 'sample/output/medium.webp')
    resizer.add_output(OutputFormat.WEBP, 256, 'sample/output/thumbnail.webp')
    resizer.run()


if __name__ == '__main__':
    main()
