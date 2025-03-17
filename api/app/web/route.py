from fastapi import APIRouter

from web.controller.index import IndexController, IndexResponse
from web.controller.v1 import (
    BlogResponse,
    BlogsResponse,
    DiariesResponse,
    DiaryResponse,
    LocationResponse,
    LocationsResponse,
    SearchBlogsResponse,
    SearchDiariesResponse,
    TagResponse,
    TagsResponse,
    V1Controller,
)

router = APIRouter()

index_controller = IndexController()
v1_controller = V1Controller()


@router.get('/', response_model=IndexResponse, tags=['healthcheck'])
def get_index() -> IndexResponse:
    return index_controller.get_index()


@router.get('/v1/blog/entry/{blog_id}', response_model=BlogResponse, tags=['v1'])
def get_blog(blog_id: int) -> BlogResponse:
    return v1_controller.get_blog(blog_id)


@router.get('/v1/blog/all', response_model=BlogsResponse, tags=['v1'])
def get_all_blogs() -> BlogsResponse:
    return v1_controller.get_all_blogs()


@router.get('/v1/tag/entry/{tag_id}', response_model=TagResponse, tags=['v1'])
def get_tag(tag_id: int) -> TagResponse:
    return v1_controller.get_tag(tag_id)


@router.get('/v1/tag/all', response_model=TagsResponse, tags=['v1'])
def get_all_tags() -> TagsResponse:
    return v1_controller.get_all_tags()


@router.get('/v1/blog/search', response_model=SearchBlogsResponse, response_model_exclude_unset=True, tags=['v1'])
def search_blogs(year: int | None = None, tag_id: int | None = None) -> SearchBlogsResponse:
    return v1_controller.search_blogs(year, tag_id)


@router.get('/v1/diary/entry/{diary_id}', response_model=DiaryResponse, tags=['v1'])
def get_diary(diary_id: int) -> DiaryResponse:
    return v1_controller.get_diary(diary_id)


@router.get('/v1/diary/all', response_model=DiariesResponse, tags=['v1'])
def get_all_diaries() -> DiariesResponse:
    return v1_controller.get_all_diaries()


@router.get('/v1/location/entry/{location_id}', response_model=LocationResponse, tags=['v1'])
def get_location(location_id: int) -> LocationResponse:
    return v1_controller.get_location(location_id)


@router.get('/v1/location/all', response_model=LocationsResponse, tags=['v1'])
def get_all_locations() -> LocationsResponse:
    return v1_controller.get_all_locations()


@router.get('/v1/diary/search', response_model=SearchDiariesResponse, response_model_exclude_unset=True, tags=['v1'])
def search_diaries(
    date: str | None = None, month: str | None = None, location_id: int | None = None
) -> SearchDiariesResponse:
    return v1_controller.search_diaries(date, month, location_id)
