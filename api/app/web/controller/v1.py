from datetime import date, datetime

from fastapi import HTTPException
from pydantic import BaseModel

from core.diary import DiaryCore


class _Location(BaseModel):
    location_id: int
    name: str


class GetDiaryResponse(BaseModel):
    diary_id: int
    date: date
    title: str | None = None
    content: str
    location: _Location | None = None
    created_at: datetime
    updated_at: datetime | None = None


class V1Controller:
    _diary_core: DiaryCore

    def __init__(self) -> None:
        self._diary_core = DiaryCore()

    def get_diary(self, diary_id: int) -> GetDiaryResponse:
        diary = self._diary_core.get_diary(diary_id)
        if diary:
            if l := diary.location:
                location = _Location(location_id=l.location_id, name=l.name)
            else:
                location = None
            return GetDiaryResponse(
                diary_id=diary.diary_id,
                date=diary.date,
                title=diary.title,
                content=diary.content,
                location=location,
                created_at=diary.created_at,
                updated_at=diary.updated_at,
            )
        else:
            raise HTTPException(status_code=404, detail='Diary not found')
