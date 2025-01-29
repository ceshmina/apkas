from fastapi import APIRouter

from web.controller.v1 import GetDiaryResponse, V1Controller

router = APIRouter()

v1_controller = V1Controller()


@router.get('/v1/diary/{diary_id}', response_model=GetDiaryResponse)
def get_diary(diary_id: int) -> GetDiaryResponse:
    return v1_controller.get_diary(diary_id)
