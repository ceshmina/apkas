from abc import ABC, abstractmethod
from datetime import date

from model.blog import Blog, Tag
from model.diary import Diary, Location


class BlogClient(ABC):
    @abstractmethod
    def get_blog(self, blog_id: int) -> Blog | None: ...

    @abstractmethod
    def get_all_blogs(self) -> list[Blog]: ...

    @abstractmethod
    def get_tag(self, tag_id: int) -> Tag | None: ...

    @abstractmethod
    def get_all_tags(self) -> list[Tag]: ...


class DiaryClient(ABC):
    @abstractmethod
    def get_diary(self, diary_id: int) -> Diary | None: ...

    @abstractmethod
    def get_all_diaries(self) -> list[Diary]: ...

    @abstractmethod
    def get_location(self, location_id: int) -> Location | None: ...

    @abstractmethod
    def get_all_locations(self) -> list[Location]: ...

    @abstractmethod
    def search_diaries_by_date(self, date: date) -> list[Diary]: ...

    @abstractmethod
    def search_diaries_by_month(self, month: date) -> list[Diary]: ...

    @abstractmethod
    def search_diaries_by_location(self, location_id: int) -> list[Diary]: ...
