from datetime import date, datetime

import pytest
from fastapi import HTTPException
from pytest_mock import MockerFixture

from model.blog import Blog, Tag
from model.diary import Diary, Location
from web.controller.v1 import (
    BlogResponse,
    BlogsResponse,
    DiariesResponse,
    DiaryResponse,
    LocationResponse,
    LocationsResponse,
    SearchDiariesResponse,
    V1Controller,
)


class TestV1ControllerForBlog:
    @pytest.fixture
    def v1_controller(self):
        return V1Controller()

    @pytest.fixture
    def sample_tag(self) -> Tag:
        return Tag(tag_id=1, name='Sample tag', created_at=datetime(2025, 1, 1, 0, 0, 0))

    @pytest.fixture
    def sample_blog(self, sample_tag: Tag) -> Blog:
        return Blog(
            blog_id=1,
            title='Sample blog',
            content='Sample content',
            created_at=datetime(2025, 1, 1, 0, 0, 0),
            updated_at=datetime(2025, 1, 1, 0, 0, 0),
            tags=[sample_tag],
        )

    def test_get_blog(
        self,
        v1_controller: V1Controller,
        sample_blog: Blog,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._blog_core, 'get_blog', return_value=sample_blog)
        response = v1_controller.get_blog(1)
        assert response == BlogResponse(blog=sample_blog)

    def test_get_blog_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._blog_core, 'get_blog', return_value=None)
        with pytest.raises(HTTPException):
            _ = v1_controller.get_blog(999)

    def test_get_all_blogs(
        self,
        v1_controller: V1Controller,
        sample_blog: Blog,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._blog_core, 'get_all_blogs', return_value=[sample_blog])
        response = v1_controller.get_all_blogs()
        assert response == BlogsResponse(blogs=[sample_blog])

    def test_get_all_blogs_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._blog_core, 'get_all_blogs', return_value=[])
        response = v1_controller.get_all_blogs()
        assert response == BlogsResponse(blogs=[])


class TestV1ControllerForDiary:
    @pytest.fixture
    def v1_controller(self):
        return V1Controller()

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
            created_at=datetime(2025, 1, 1, 0, 0, 0),
            updated_at=datetime(2025, 1, 1, 0, 0, 0),
        )

    def test_get_diary(
        self,
        v1_controller: V1Controller,
        sample_diary: Diary,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._diary_core, 'get_diary', return_value=sample_diary)
        response = v1_controller.get_diary(1)
        assert response == DiaryResponse(diary=sample_diary)

    def test_get_diary_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._diary_core, 'get_diary', return_value=None)
        with pytest.raises(HTTPException):
            _ = v1_controller.get_diary(999)

    def test_get_all_diaries(
        self,
        v1_controller: V1Controller,
        sample_diary: Diary,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._diary_core, 'get_all_diaries', return_value=[sample_diary])
        response = v1_controller.get_all_diaries()
        assert response == DiariesResponse(diaries=[sample_diary])

    def test_get_all_diaries_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._diary_core, 'get_all_diaries', return_value=[])
        response = v1_controller.get_all_diaries()
        assert response == DiariesResponse(diaries=[])

    def test_get_location(self, v1_controller: V1Controller, sample_location: Location, mocker: MockerFixture):
        mocker.patch.object(v1_controller._diary_core, 'get_location', return_value=sample_location)
        response = v1_controller.get_location(1)
        assert response == LocationResponse(location=sample_location)

    def test_get_all_locations(
        self,
        v1_controller: V1Controller,
        sample_location: Location,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._diary_core, 'get_all_locations', return_value=[sample_location])
        response = v1_controller.get_all_locations()
        assert response == LocationsResponse(locations=[sample_location])

    def test_get_all_locations_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._diary_core, 'get_all_locations', return_value=[])
        response = v1_controller.get_all_locations()
        assert response == LocationsResponse(locations=[])

    def test_get_location_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._diary_core, 'get_location', return_value=None)
        with pytest.raises(HTTPException):
            _ = v1_controller.get_location(999)

    def test_search_diaries_by_date(
        self,
        v1_controller: V1Controller,
        sample_diary: Diary,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._diary_core, 'search_diaries_by_date', return_value=[sample_diary])
        response = v1_controller.search_diaries(date='20250101')
        assert response == SearchDiariesResponse(diaries=[sample_diary])

    def test_search_diaries_invalide_date(self, v1_controller: V1Controller):
        with pytest.raises(HTTPException):
            _ = v1_controller.search_diaries(date='20250132')

    def test_search_diaries_by_month(
        self,
        v1_controller: V1Controller,
        sample_diary: Diary,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._diary_core, 'search_diaries_by_month', return_value=[sample_diary])
        response = v1_controller.search_diaries(month='202501')
        assert response == SearchDiariesResponse(diaries=[sample_diary])

    def test_search_diaries_invalide_month(self, v1_controller: V1Controller):
        with pytest.raises(HTTPException):
            _ = v1_controller.search_diaries(month='202513')

    def test_search_diaries_by_location(
        self,
        v1_controller: V1Controller,
        sample_diary: Diary,
        sample_location: Location,
        mocker: MockerFixture,
    ):
        mocker.patch.object(
            v1_controller._diary_core, 'search_diaries_by_location', return_value=(sample_location, [sample_diary])
        )
        response = v1_controller.search_diaries(location_id=1)
        assert response == SearchDiariesResponse(
            location=sample_location,
            diaries=[sample_diary],
        )

    def test_search_diaries_by_location_location_not_found(self, v1_controller: V1Controller, mocker: MockerFixture):
        mocker.patch.object(v1_controller._diary_core, 'search_diaries_by_location', return_value=None)
        with pytest.raises(HTTPException):
            _ = v1_controller.search_diaries(location_id=999)

    def test_search_diaries_by_location_diaries_not_found(
        self,
        v1_controller: V1Controller,
        sample_location: Location,
        mocker: MockerFixture,
    ):
        mocker.patch.object(v1_controller._diary_core, 'search_diaries_by_location', return_value=(sample_location, []))
        response = v1_controller.search_diaries(location_id=3)
        assert response == SearchDiariesResponse(location=sample_location, diaries=[])

    def test_search_diaries_no_params(self, v1_controller: V1Controller):
        with pytest.raises(HTTPException):
            _ = v1_controller.search_diaries()

    def test_search_diaries_too_many_params(self, v1_controller: V1Controller):
        with pytest.raises(HTTPException):
            _ = v1_controller.search_diaries(date='20250101', month='202501', location_id=1)
