from datetime import date, datetime

import pytest

from core.diary import DiaryCore
from model.diary import Diary, Location
from util.time import JST


class TestDiaryCore:
    @pytest.fixture
    def diary_core(self) -> DiaryCore:
        return DiaryCore()

    def test_get_diary(self, diary_core: DiaryCore):
        diary = diary_core.get_diary(1)
        assert diary == Diary(
            diary_id=1,
            date=date(2025, 1, 1),
            title='Sample diary',
            content='This is a sample diary.',
            location=Location(location_id=1, name='Tokyo, Japan'),
            created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
            updated_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
        )

    def test_get_diary_not_found(self, diary_core: DiaryCore):
        diary = diary_core.get_diary(2)
        assert diary is None
