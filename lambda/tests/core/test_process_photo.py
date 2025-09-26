from PIL import Image

from app.core.process_photo import process


class TestProcessPhoto:
    def test_process(self):
        process('tests/data/input/sample.jpg', 'tests/data/output/')

        with Image.open('tests/data/output/large.webp') as large:
            assert large.size == (3840, 2560)
        with Image.open('tests/data/output/medium.webp') as medium:
            assert medium.size == (1920, 1280)
        with Image.open('tests/data/output/thumbnail.webp') as thumbnail:
            assert thumbnail.size == (240, 160)
