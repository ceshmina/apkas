from datetime import date, datetime

from fastapi import HTTPException
from pydantic import BaseModel

from core.blog import BlogCore, blog_core
from core.diary import DiaryCore, diary_core
from model.blog import Blog
from model.diary import Diary


class TagResponse(BaseModel):
    tag_id: int
    name: str
    created_at: datetime
    updated_at: datetime | None = None


class BlogResponse(BaseModel):
    blog_id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime | None = None
    tags: list[TagResponse]


class LocationResponse(BaseModel):
    location_id: int
    name: str


class DiaryResponse(BaseModel):
    diary_id: int
    date: date
    title: str | None = None
    content: str
    location: LocationResponse | None = None
    created_at: datetime
    updated_at: datetime | None = None


class SearchDiariesResponse(BaseModel):
    location: LocationResponse | None = None
    diaries: list[DiaryResponse]


class V1Controller:
    _blog_core: BlogCore
    _diary_core: DiaryCore

    def __init__(self) -> None:
        self._blog_core = blog_core
        self._diary_core = diary_core

    def _to_blog_response(self, blog: Blog) -> BlogResponse:
        return BlogResponse(
            blog_id=blog.blog_id,
            title=blog.title,
            content=blog.content,
            created_at=blog.created_at,
            updated_at=blog.updated_at,
            tags=[
                TagResponse(tag_id=t.tag_id, name=t.name, created_at=t.created_at, updated_at=t.updated_at)
                for t in blog.tags
            ],
        )

    def get_blog(self, blog_id: int) -> BlogResponse:
        blog = blog_core.get_blog(blog_id)
        if blog:
            return self._to_blog_response(blog)
        else:
            raise HTTPException(status_code=404, detail='Blog not found')

    def _to_diary_response(self, diary: Diary) -> DiaryResponse:
        if l := diary.location:
            location = LocationResponse(location_id=l.location_id, name=l.name)
        else:
            location = None
        return DiaryResponse(
            diary_id=diary.diary_id,
            date=diary.date,
            title=diary.title,
            content=diary.content,
            location=location,
            created_at=diary.created_at,
            updated_at=diary.updated_at,
        )

    def get_diary(self, diary_id: int) -> DiaryResponse:
        diary = self._diary_core.get_diary(diary_id)
        if diary:
            return self._to_diary_response(diary)
        else:
            raise HTTPException(status_code=404, detail='Diary not found')

    def get_location(self, location_id: int) -> LocationResponse:
        location = self._diary_core.get_location(location_id)
        if location:
            return LocationResponse(location_id=location.location_id, name=location.name)
        else:
            raise HTTPException(status_code=404, detail='Location not found')

    def search_diaries(
        self, date: str | None = None, month: str | None = None, location_id: int | None = None
    ) -> SearchDiariesResponse:
        if [date, month, location_id].count(None) != 2:
            raise HTTPException(status_code=422, detail='One of date, month, or location_id must be specified')

        if date:
            try:
                date_obj = datetime.strptime(date, '%Y%m%d').date()
            except ValueError:
                raise HTTPException(status_code=422, detail='Invalid date format: date must be in YYYYMMDD')
            diaries = self._diary_core.search_diaries_by_date(date_obj)
            return SearchDiariesResponse(diaries=[self._to_diary_response(d) for d in diaries])

        elif month:
            try:
                month_obj = datetime.strptime(month, '%Y%m').date()
            except ValueError:
                raise HTTPException(status_code=422, detail='Invalid month format: month must be in YYYYMM')
            diaries = self._diary_core.search_diaries_by_month(month_obj)
            return SearchDiariesResponse(diaries=[self._to_diary_response(d) for d in diaries])

        elif location_id:
            if result := self._diary_core.search_diaries_by_location(location_id):
                location, diaries = result
                return SearchDiariesResponse(
                    location=LocationResponse(location_id=location.location_id, name=location.name),
                    diaries=[self._to_diary_response(d) for d in diaries],
                )
            else:
                raise HTTPException(status_code=404, detail='Location not found')

        else:
            raise HTTPException(status_code=500, detail='Unexpected error')
