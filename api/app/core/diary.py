from datetime import date

from model.diary import Diary, Location
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

    def get_location(self, location_id: int) -> Location | None:
        try:
            return self._diary_client.get_location(location_id)
        except Exception as e:
            raise Exception(f'Failed to get location: {e}')

    def search_diaries_by_date(self, date: date) -> list[Diary]:
        try:
            return self._diary_client.search_diaries_by_date(date)
        except Exception as e:
            raise Exception(f'Failed to search diaries by date: {e}')

    def search_diaries_by_month(self, month: date) -> list[Diary]:
        try:
            return self._diary_client.search_diaries_by_month(month)
        except Exception as e:
            raise Exception(f'Failed to search diaries by month: {e}')

    def search_diaries_by_location(self, location_id: int) -> tuple[Location, list[Diary]] | None:
        try:
            location = self.get_location(location_id)
            if location:
                diaries = self._diary_client.search_diaries_by_location(location_id)
                return (location, diaries)
            else:
                return None
        except Exception as e:
            raise Exception(f'Failed to search diaries by location: {e}')


diary_core = DiaryCore(PostgresDiaryClient())
