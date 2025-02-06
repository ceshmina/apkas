from datetime import date, datetime

import pytest
from pytest_mock import MockerFixture

from core.diary import DiaryCore, diary_core
from model.diary import Diary, Location
from util.time import JST


class TestDiaryCore:
    @pytest.fixture
    def diary_core(self) -> DiaryCore:
        return diary_core

    def test_get_diary(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(
            diary_core._diary_client,
            'get_diary',
            return_value=Diary(
                diary_id=1,
                date=date(2025, 1, 1),
                title='Sample diary',
                content='This is a sample diary.',
                location=Location(location_id=1, name='Tokyo, Japan'),
                created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
                updated_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
            ),
        )

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

    def test_get_diary_not_found(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_diary', return_value=None)
        diary = diary_core.get_diary(999)
        assert diary is None

    def test_get_diary_error(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_diary', side_effect=Exception('Error'))
        with pytest.raises(Exception):
            diary_core.get_diary(-100)
