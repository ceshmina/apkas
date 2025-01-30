import pytest

from web.controller.index import IndexController, IndexResponse


class TestIndexController:
    @pytest.fixture
    def index_controller(self):
        return IndexController()

    def test_get_index(self, index_controller: IndexController):
        response = index_controller.get_index()
        assert response == IndexResponse(message='Hello, world!')
