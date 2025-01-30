from datetime import date, datetime

import pytest
from fastapi import HTTPException
from pytest_mock import MockerFixture

from model.diary import Diary, Location
from util.time import JST
from web.controller.v1 import GetDiaryResponse, V1Controller, _Location


class TestV1Controller:
    @pytest.fixture
    def v1_controller(self):
        return V1Controller()

    def test_get_diary(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(
            v1_controller._diary_core,
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
        response = v1_controller.get_diary(1)
        assert response == GetDiaryResponse(
            diary_id=1,
            date=date(2025, 1, 1),
            title='Sample diary',
            content='This is a sample diary.',
            location=_Location(location_id=1, name='Tokyo, Japan'),
            created_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
            updated_at=datetime(2025, 1, 1, 0, 0, 0, tzinfo=JST),
        )

    def test_get_diary_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._diary_core, 'get_diary', return_value=None)
        try:
            _ = v1_controller.get_diary(1)
            assert False
        except HTTPException as e:
            assert e.status_code == 404
            assert e.detail == 'Diary not found'
