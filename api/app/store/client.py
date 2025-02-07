from abc import ABC, abstractmethod

from model.diary import Diary


class DiaryClient(ABC):
    @abstractmethod
    def get_diary(self, diary_id: int) -> Diary | None: ...
