from fastapi import APIRouter

from web.controller.index import IndexController, IndexResponse
from web.controller.v1 import BlogResponse, DiaryResponse, LocationResponse, SearchDiariesResponse, V1Controller

router = APIRouter()

index_controller = IndexController()
v1_controller = V1Controller()


@router.get('/', response_model=IndexResponse, tags=['healthcheck'])
def get_index() -> IndexResponse:
    return index_controller.get_index()


@router.get('/v1/blog/{blog_id}', response_model=BlogResponse, tags=['v1'])
def get_blog(blog_id: int) -> BlogResponse:
    return v1_controller.get_blog(blog_id)


@router.get('/v1/diary/{diary_id}', response_model=DiaryResponse, tags=['v1'])
def get_diary(diary_id: int) -> DiaryResponse:
    return v1_controller.get_diary(diary_id)


@router.get('/v1/location/{location_id}', response_model=LocationResponse, tags=['v1'])
def get_location(location_id: int) -> LocationResponse:
    return v1_controller.get_location(location_id)


@router.get('/v1/diaries/search', response_model=SearchDiariesResponse, response_model_exclude_unset=True, tags=['v1'])
def search_diaries(
    date: str | None = None, month: str | None = None, location_id: int | None = None
) -> SearchDiariesResponse:
    return v1_controller.search_diaries(date, month, location_id)
