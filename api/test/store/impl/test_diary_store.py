from datetime import date, datetime

import pytest

from model.diary import Diary, Location
from store.impl.diary import PostgresDiaryClient


class TestPostgresDiaryClient:
    @pytest.fixture
    def client(self):
        return PostgresDiaryClient()

    def test_get_diary(self, client: PostgresDiaryClient):
        diary = client.get_diary(1)
        assert diary == Diary(
            diary_id=1,
            title='日記のテスト',
            date=date(2025, 1, 1),
            location=Location(location_id=1, name='Tokyo, Japan'),
            content='これは日記のテストです。',
            created_at=datetime(2025, 1, 1, 0, 0, 0),
            updated_at=None,
        )

    def test_get_diary_not_found(self, client: PostgresDiaryClient):
        diary = client.get_diary(999)
        assert diary is None

    def test_get_location(self, client: PostgresDiaryClient):
        location = client.get_location(1)
        assert location == Location(location_id=1, name='Tokyo, Japan')

    def test_get_location_not_found(self, client: PostgresDiaryClient):
        location = client.get_location(999)
        assert location is None

    def test_search_diaries_by_date(self, client: PostgresDiaryClient):
        diaries = client.search_diaries_by_date(date(2025, 1, 1))
        assert len(diaries) == 1
        assert diaries[0].date == date(2025, 1, 1)

    def test_search_diaries_by_date_not_found(self, client: PostgresDiaryClient):
        diaries = client.search_diaries_by_date(date(2025, 1, 4))
        assert len(diaries) == 0

    def test_search_diaries_by_month(self, client: PostgresDiaryClient):
        diaries = client.search_diaries_by_month(date(2025, 1, 1))
        assert len(diaries) == 3
        assert [d.date for d in diaries] == [date(2025, 1, 3), date(2025, 1, 2), date(2025, 1, 1)]

    def test_search_diaries_by_month_not_found(self, client: PostgresDiaryClient):
        diaries = client.search_diaries_by_month(date(2025, 3, 1))
        assert len(diaries) == 0

    def test_search_diaries_by_location(self, client: PostgresDiaryClient):
        diaries = client.search_diaries_by_location(1)
        assert len(diaries) == 3
        assert [d.location.location_id for d in diaries] == [1, 1, 1]
        assert [d.date for d in diaries] == [date(2025, 2, 1), date(2025, 1, 2), date(2025, 1, 1)]

    def test_search_diaries_by_location_not_found(self, client: PostgresDiaryClient):
        diaries = client.search_diaries_by_location(999)
        assert len(diaries) == 0
