from abc import ABC, abstractmethod
from datetime import date

from model.diary import Diary


class DiaryClient(ABC):
    @abstractmethod
    def get_diary(self, diary_id: int) -> Diary | None: ...

    @abstractmethod
    def search_diaries_by_date(self, date: date) -> list[Diary]: ...

    @abstractmethod
    def search_diaries_by_month(self, month: date) -> list[Diary]: ...
