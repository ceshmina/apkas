from datetime import date, datetime

from pydantic import BaseModel


class Location(BaseModel):
    location_id: int
    name: str


class Diary(BaseModel):
    diary_id: int
    date: date
    title: str | None = None
    content: str
    location: Location | None = None
    created_at: datetime
    updated_at: datetime | None = None
