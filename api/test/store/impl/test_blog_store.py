from datetime import datetime

import pytest

from model.blog import Blog, Tag
from store.impl.blog import PostgresBlogClient


class TestPostgresBlogClient:
    @pytest.fixture
    def client(self):
        return PostgresBlogClient()

    def test_get_blog(self, client: PostgresBlogClient):
        blog = client.get_blog(1)
        assert blog == Blog(
            blog_id=1,
            title='ブログのテスト',
            content='これはブログのテストです。',
            created_at=datetime(2025, 1, 1, 0, 0, 0),
            updated_at=None,
            tags=[Tag(tag_id=1, name='タグ1', created_at=datetime(2025, 1, 1, 0, 0, 0), updated_at=None)],
        )

    def test_get_blog_not_found(self, client: PostgresBlogClient):
        blog = client.get_blog(999)
        assert blog is None

    def test_get_blog_without_tags(self, client: PostgresBlogClient):
        blog = client.get_blog(2)
        assert blog == Blog(
            blog_id=2,
            title='ブログのテスト2',
            content='これはブログのテスト2です。',
            created_at=datetime(2025, 1, 2, 0, 0, 0),
            updated_at=None,
            tags=[],
        )

    def test_get_all_blogs(self, client: PostgresBlogClient):
        blogs = client.get_all_blogs()
        assert blogs == [
            Blog(
                blog_id=3,
                title='ブログのテスト3',
                content='これはブログのテスト3です。',
                created_at=datetime(2025, 2, 1, 0, 0, 0),
                updated_at=None,
                tags=[
                    Tag(tag_id=1, name='タグ1', created_at=datetime(2025, 1, 1, 0, 0, 0), updated_at=None),
                    Tag(tag_id=2, name='タグ2', created_at=datetime(2025, 1, 1, 0, 0, 0), updated_at=None),
                ],
            ),
            Blog(
                blog_id=2,
                title='ブログのテスト2',
                content='これはブログのテスト2です。',
                created_at=datetime(2025, 1, 2, 0, 0, 0),
                updated_at=None,
                tags=[],
            ),
            Blog(
                blog_id=1,
                title='ブログのテスト',
                content='これはブログのテストです。',
                created_at=datetime(2025, 1, 1, 0, 0, 0),
                updated_at=None,
                tags=[Tag(tag_id=1, name='タグ1', created_at=datetime(2025, 1, 1, 0, 0, 0), updated_at=None)],
            ),
        ]

    def test_get_tag(self, client: PostgresBlogClient):
        tag = client.get_tag(1)
        assert tag == Tag(
            tag_id=1,
            name='タグ1',
            created_at=datetime(2025, 1, 1, 0, 0, 0),
            updated_at=None,
        )

    def test_get_tag_not_found(self, client: PostgresBlogClient):
        tag = client.get_tag(999)
        assert tag is None

    def test_get_all_tags(self, client: PostgresBlogClient):
        tags = client.get_all_tags()
        assert tags == [
            Tag(tag_id=1, name='タグ1', created_at=datetime(2025, 1, 1, 0, 0, 0), updated_at=None),
            Tag(tag_id=2, name='タグ2', created_at=datetime(2025, 1, 1, 0, 0, 0), updated_at=None),
        ]

    def test_search_blogs_by_tag(self, client: PostgresBlogClient):
        blogs = client.search_blogs_by_tag(1)
        assert [b.blog_id for b in blogs] == [3, 1]

    def test_search_blogs_by_tag_not_found(self, client: PostgresBlogClient):
        blogs = client.search_blogs_by_tag(999)
        assert blogs == []

    def test_search_blogs_by_year(self, client: PostgresBlogClient):
        blogs = client.search_blogs_by_year(2025)
        assert [b.blog_id for b in blogs] == [3, 2, 1]

    def test_search_blogs_by_year_not_found(self, client: PostgresBlogClient):
        blogs = client.search_blogs_by_year(2026)
        assert blogs == []
