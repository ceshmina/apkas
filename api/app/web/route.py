from fastapi import APIRouter

from web.controller.index import IndexController, IndexResponse
from web.controller.v1 import GetDiaryResponse, V1Controller

router = APIRouter()

index_controller = IndexController()
v1_controller = V1Controller()


@router.get('/', response_model=IndexResponse)
def get_index() -> IndexResponse:
    return index_controller.get_index()


@router.get('/v1/diary/{diary_id}', response_model=GetDiaryResponse)
def get_diary(diary_id: int) -> GetDiaryResponse:
    return v1_controller.get_diary(diary_id)
