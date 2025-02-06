from datetime import date, datetime

import pytest

from model.diary import Diary, Location
from store.impl.postgres import PostgresDiaryClient


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
