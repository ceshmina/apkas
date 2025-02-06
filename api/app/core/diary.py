from model.diary import Diary
from store.client import DiaryClient
from store.impl.postgres import PostgresDiaryClient


class DiaryCore:
    _diary_client: DiaryClient

    def __init__(self, diary_client: DiaryClient) -> None:
        self._diary_client = diary_client

    def get_diary(self, diary_id: int) -> Diary | None:
        try:
            return self._diary_client.get_diary(diary_id)
        except Exception as e:
            raise Exception(f'Failed to get diary: {e}')


diary_core = DiaryCore(PostgresDiaryClient())
