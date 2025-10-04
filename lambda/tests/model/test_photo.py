from datetime import datetime
from zoneinfo import ZoneInfo

import pytest

from app.model.photo import PhotoMetadata, PhotoSize


class TestPhotoSize:
    @pytest.mark.parametrize(
        'w, h, raise_exception',
        [
            pytest.param(100, 50, False, id='正常な場合'),
            pytest.param(0, 50, True, id='wが不正の場合'),
            pytest.param(100, -1, True, id='hが不正の場合'),
            pytest.param(0, -1, True, id='w、hがともに不正の場合'),
        ],
    )
    def test_init_photosize(self, w: int, h: int, raise_exception: bool):
        if raise_exception:
            with pytest.raises(ValueError):
                _ = PhotoSize(w, h)
        else:
            _ = PhotoSize(w, h)

    @pytest.mark.parametrize(
        'w, h, x, new_w, new_h, raise_exception',
        [
            pytest.param(100, 50, 200, 200, 100, False, id='正常に拡大できる'),
            pytest.param(100, 50, 50, 50, 25, False, id='正常に縮小できる'),
            pytest.param(100, 50, 75, 75, 37, False, id='結果が正数でない場合、切り捨てられる'),
            pytest.param(100, 100, 50, 50, 50, False, id='wとhが同じ場合'),
            pytest.param(30, 40, 20, 15, 20, False, id='wよりhが大きい場合、hを基準にリサイズされる'),
            pytest.param(100, 50, 0, 0, 0, True, id='xが不正の場合'),
        ],
    )
    def test_resize(self, w: int, h: int, x: int, new_w: int, new_h: int, raise_exception: bool):
        s = PhotoSize(w, h)
        if raise_exception:
            with pytest.raises(ValueError):
                s.resize(x)
        else:
            assert s.resize(x) == PhotoSize(new_w, new_h)


class TestPhotoMetadata:
    @pytest.mark.parametrize(
        'original, offset, expected',
        [
            pytest.param(
                '2025:09:01 17:00:00',
                '+09:00',
                datetime(2025, 9, 1, 17, 0, 0, tzinfo=ZoneInfo('Asia/Tokyo')),
                id='正常な場合',
            ),
            pytest.param(
                '2025:09:01 17:00:00',
                None,
                datetime(2025, 9, 1, 17, 0, 0),
                id='タイムゾーンがない場合',
            ),
            pytest.param(
                '2025-09-01 17:00:00',
                '+09:00',
                datetime(2025, 9, 1, 18, 0, 0, tzinfo=ZoneInfo('Asia/Tokyo')),
                id='時刻が不正な場合',
            ),
            pytest.param(
                None,
                None,
                datetime(2025, 9, 1, 18, 0, 0, tzinfo=ZoneInfo('Asia/Tokyo')),
                id='時刻がない場合',
            ),
            pytest.param(
                '2025:09:01 17:00:00',
                '+',
                datetime(2025, 9, 1, 18, 0, 0, tzinfo=ZoneInfo('Asia/Tokyo')),
                id='タイムゾーンが不正な場合',
            ),
        ],
    )
    def test_parse_created_at_from_exif(self, original: str | None, offset: str | None, expected: datetime):
        exif = {}
        if original:
            exif['DateTimeOriginal'] = original
        if offset:
            exif['OffsetTime'] = offset

        fallback_time = datetime(2025, 9, 1, 18, 0, 0, tzinfo=ZoneInfo('Asia/Tokyo'))
        created_at = PhotoMetadata.parse_created_at_from_exif(exif, fallback_time)
        assert created_at == expected

    def test_from_exif(self):
        exif = {
            'DateTimeOriginal': '2025:09:01 17:00:00',
            'OffsetTime': '+09:00',
            'Make': 'Make',
            'Model': 'Model',
            'LensModel': 'LensModel',
            'FocalLength': 50,
            'FocalLengthIn35mmFilm': 50,
            'FNumber': 5.6,
            'ExposureTime': 1 / 250,
            'ISOSpeedRatings': 100,
        }
        assert PhotoMetadata.from_exif(exif) == PhotoMetadata(
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
