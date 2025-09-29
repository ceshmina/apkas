from dataclasses import dataclass
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo


@dataclass
class PhotoSize:
    w: int
    h: int

    def __init__(self, w: int, h: int):
        if w <= 0 or h <= 0:
            raise ValueError('写真のサイズが不正です: w、hはともに正である必要があります')
        self.w = w
        self.h = h

    def to_tuple(self) -> tuple[int, int]:
        return (self.w, self.h)

    def resize(self, x: int) -> 'PhotoSize':
        if x <= 0:
            raise ValueError('写真のサイズが不正です: リサイズ後のxは正である必要があります')
        if self.w >= self.h:
            new_w = x
            new_h = int(self.h * x / self.w)
        else:
            new_w = int(self.w * x / self.h)
            new_h = x
        return PhotoSize(new_w, new_h)


@dataclass
class PhotoMetadata:
    created_at: datetime
    make: str | None = None
    model: str | None = None
    lens_model: str | None = None
    focal_length: float | None = None
    focal_length_in_35mm_film: float | None = None
    f_number: float | None = None
    exposure_time: float | None = None
    iso_speed_ratings: float | None = None

    @classmethod
    def from_exif(cls, exif: dict[str, Any]) -> 'PhotoMetadata':
        created_at = PhotoMetadata.parse_created_at_from_exif(exif, datetime.now(ZoneInfo('Asia/Tokyo')))
        return PhotoMetadata(
            created_at=created_at,
            make=exif.get('Make'),
            model=exif.get('Model'),
            lens_model=exif.get('LensModel'),
            focal_length=exif.get('FocalLength'),
            focal_length_in_35mm_film=exif.get('FocalLengthIn35mmFilm'),
            f_number=exif.get('FNumber'),
            exposure_time=exif.get('ExposureTime'),
            iso_speed_ratings=exif.get('ISOSpeedRatings'),
        )

    @staticmethod
    def parse_created_at_from_exif(exif: dict[str, Any], fallback_time: datetime) -> datetime:
        try:
            datetime_original = datetime.strptime(exif['DateTimeOriginal'], '%Y:%m:%d %H:%M:%S')
            offset_time = exif.get('OffsetTime', '')
            return datetime.fromisoformat(datetime_original.isoformat() + offset_time)
        except (KeyError, ValueError):
            return fallback_time
