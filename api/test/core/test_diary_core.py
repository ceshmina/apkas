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

    @pytest.fixture
    def sample_location(self) -> Location:
        return Location(location_id=1, name='Tokyo, Japan')

    @pytest.fixture
    def sample_diary(self, sample_location: Location) -> Diary:
        return Diary(
            diary_id=1,
            date=date(2025, 1, 1),
            title='Sample diary',
            content='This is a sample diary.',
            location=sample_location,
            created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
            updated_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
        )

    def test_get_diary(self, diary_core: DiaryCore, sample_diary: Diary, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_diary', return_value=sample_diary)
        diary = diary_core.get_diary(1)
        assert diary == sample_diary

    def test_get_diary_not_found(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_diary', return_value=None)
        diary = diary_core.get_diary(999)
        assert diary is None

    def test_get_diary_error(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_diary', side_effect=Exception('Error'))
        with pytest.raises(Exception):
            diary_core.get_diary(-100)

    def test_get_all_diaries(self, diary_core: DiaryCore, sample_diary: Diary, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_all_diaries', return_value=[sample_diary])
        diaries = diary_core.get_all_diaries()
        assert diaries == [sample_diary]

    def test_get_all_diaries_not_found(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_all_diaries', return_value=[])
        diaries = diary_core.get_all_diaries()
        assert diaries == []

    def test_get_all_diaries_error(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(diary_core._diary_client, 'get_all_diaries', side_effect=Exception('Error'))
        with pytest.raises(Exception):
            diary_core.get_all_diaries()

    def test_search_diaries_by_location(
        self, diary_core: DiaryCore, sample_diary: Diary, sample_location: Location, mocker: MockerFixture
    ):
        mocker.patch.object(diary_core, 'get_location', return_value=sample_location)
        mocker.patch.object(diary_core._diary_client, 'search_diaries_by_location', return_value=[sample_diary])

        (location, diaries) = diary_core.search_diaries_by_location(1)
        assert location == sample_location
        assert diaries == [sample_diary]

    def test_search_diaries_by_location_location_not_found(self, diary_core: DiaryCore, mocker: MockerFixture):
        mocker.patch.object(diary_core, 'get_location', return_value=None)
        result = diary_core.search_diaries_by_location(999)
        assert result is None

    def test_search_diaries_by_location_diaries_not_found(
        self, diary_core: DiaryCore, sample_location: Location, mocker: MockerFixture
    ):
        mocker.patch.object(diary_core, 'get_location', return_value=sample_location)
        mocker.patch.object(diary_core._diary_client, 'search_diaries_by_location', return_value=[])

        (location, diaries) = diary_core.search_diaries_by_location(3)
        assert location == sample_location
        assert diaries == []
