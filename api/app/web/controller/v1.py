from datetime import datetime

from fastapi import HTTPException
from pydantic import BaseModel

from core.blog import BlogCore, blog_core
from core.diary import DiaryCore, diary_core
from model.blog import Blog
from model.diary import Diary, Location


class BlogResponse(BaseModel):
    blog: Blog


class BlogsResponse(BaseModel):
    blogs: list[Blog]


class LocationResponse(BaseModel):
    location: Location


class LocationsResponse(BaseModel):
    locations: list[Location]


class DiaryResponse(BaseModel):
    diary: Diary


class DiariesResponse(BaseModel):
    diaries: list[Diary]


class SearchDiariesResponse(BaseModel):
    location: Location | None = None
    diaries: list[Diary]


class V1Controller:
    _blog_core: BlogCore
    _diary_core: DiaryCore

    def __init__(self) -> None:
        self._blog_core = blog_core
        self._diary_core = diary_core

    def get_blog(self, blog_id: int) -> BlogResponse:
        blog = blog_core.get_blog(blog_id)
        if blog:
            return BlogResponse(blog=blog)
        else:
            raise HTTPException(status_code=404, detail='Blog not found')

    def get_all_blogs(self) -> BlogsResponse:
        blogs = blog_core.get_all_blogs()
        return BlogsResponse(blogs=blogs)

    def get_diary(self, diary_id: int) -> DiaryResponse:
        diary = self._diary_core.get_diary(diary_id)
        if diary:
            return DiaryResponse(diary=diary)
        else:
            raise HTTPException(status_code=404, detail='Diary not found')

    def get_all_diaries(self) -> DiariesResponse:
        diaries = self._diary_core.get_all_diaries()
        return DiariesResponse(diaries=diaries)

    def get_location(self, location_id: int) -> LocationResponse:
        location = self._diary_core.get_location(location_id)
        if location:
            return LocationResponse(location=location)
        else:
            raise HTTPException(status_code=404, detail='Location not found')

    def get_all_locations(self) -> LocationsResponse:
        locations = self._diary_core.get_all_locations()
        return LocationsResponse(locations=locations)

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
            return SearchDiariesResponse(diaries=diaries)

        elif month:
            try:
                month_obj = datetime.strptime(month, '%Y%m').date()
            except ValueError:
                raise HTTPException(status_code=422, detail='Invalid month format: month must be in YYYYMM')
            diaries = self._diary_core.search_diaries_by_month(month_obj)
            return SearchDiariesResponse(diaries=diaries)

        elif location_id:
            if result := self._diary_core.search_diaries_by_location(location_id):
                location, diaries = result
                return SearchDiariesResponse(
                    location=location,
                    diaries=diaries,
                )
            else:
                raise HTTPException(status_code=404, detail='Location not found')

        else:
            raise HTTPException(status_code=500, detail='Unexpected error')
