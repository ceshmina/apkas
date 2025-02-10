from abc import ABC, abstractmethod
from datetime import date

from model.blog import Blog
from model.diary import Diary, Location


class BlogClient(ABC):
    @abstractmethod
    def get_blog(self, blog_id: int) -> Blog | None: ...


class DiaryClient(ABC):
    @abstractmethod
    def get_diary(self, diary_id: int) -> Diary | None: ...

    @abstractmethod
    def get_location(self, location_id: int) -> Location | None: ...

    @abstractmethod
    def search_diaries_by_date(self, date: date) -> list[Diary]: ...

    @abstractmethod
    def search_diaries_by_month(self, month: date) -> list[Diary]: ...

    @abstractmethod
    def search_diaries_by_location(self, location_id: int) -> list[Diary]: ...
