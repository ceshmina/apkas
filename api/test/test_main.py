import pytest
from fastapi.testclient import TestClient

from main import app


class TestMain:
    @pytest.fixture
    def client(self):
        return TestClient(app)

    def test_main(self, client: TestClient):
        response = client.get('/')
        assert response.status_code == 200
        assert response.json() == {'message': 'Hello, world!'}
