from image.resize import ImageResizer, InputConfig, OutputFormat


def main():
    input_config = InputConfig(path='sample/input/001.jpg')
    resizer = ImageResizer(input_config)
    resizer.add_output(OutputFormat.WEBP, 3840, 'sample/output/001/large.webp')
    resizer.add_output(OutputFormat.WEBP, 1600, 'sample/output/001/medium.webp')
    resizer.add_output(OutputFormat.WEBP, 256, 'sample/output/001/thumbnail.webp')
    resizer.run()


if __name__ == '__main__':
    main()
