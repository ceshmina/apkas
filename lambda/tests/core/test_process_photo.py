from datetime import datetime
from zoneinfo import ZoneInfo

from PIL import Image

from app.core.process_photo import extract_exif, process
from app.model.photo import PhotoMetadata


class TestProcessPhoto:
    def test_extract_exif(self):
        with Image.open('tests/data/input/sample.jpg') as image:
            exif = extract_exif(image)

            assert exif['DateTimeOriginal'] == '2025:09:01 17:00:00'
            assert exif['OffsetTime'] == '+09:00'
            assert exif['Make'] == 'Make'
            assert exif['Model'] == 'Model'
            assert exif['LensModel'] == 'LensModel'
            assert exif['FocalLength'] == 50
            assert exif['FocalLengthIn35mmFilm'] == 50
            assert exif['FNumber'] == 5.6
            assert exif['ExposureTime'] == 1 / 250
            assert exif['ISOSpeedRatings'] == 100

    def test_process(self):
        metadata = process('tests/data/input/sample.jpg', 'tests/data/output/')

        with Image.open('tests/data/output/large.webp') as large:
            assert large.size == (3840, 2560)
        with Image.open('tests/data/output/medium.webp') as medium:
            assert medium.size == (1920, 1280)
        with Image.open('tests/data/output/thumbnail.webp') as thumbnail:
            assert thumbnail.size == (240, 160)

        assert metadata == PhotoMetadata(
            created_at=datetime(2025, 9, 1, 17, 0, 0, tzinfo=ZoneInfo('Asia/Tokyo')),
            make='Make',
            model='Model',
            lens_model='LensModel',
            focal_length=50,
            focal_length_in_35mm_film=50,
            f_number=5.6,
            exposure_time=1 / 250,
            iso_speed_ratings=100,
        )
