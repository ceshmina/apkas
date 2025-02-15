from datetime import datetime

import pytest
from pytest_mock import MockerFixture

from core.blog import BlogCore, blog_core
from model.blog import Blog, Tag


class TestBlogCore:
    @pytest.fixture
    def blog_core(self) -> BlogCore:
        return blog_core

    @pytest.fixture
    def sample_tag(self) -> Tag:
        return Tag(
            tag_id=1,
            name='Sample tag',
            created_at=datetime(2025, 1, 1, 0, 0, 0),
            updated_at=datetime(2025, 1, 1, 0, 0, 0),
        )

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

    def test_get_blog(self, blog_core: BlogCore, sample_blog: Blog, mocker: MockerFixture):
        mocker.patch.object(blog_core._blog_client, 'get_blog', return_value=sample_blog)
        blog = blog_core.get_blog(1)
        assert blog == sample_blog

    def test_get_blog_not_found(self, blog_core: BlogCore, mocker: MockerFixture):
        mocker.patch.object(blog_core._blog_client, 'get_blog', return_value=None)
        blog = blog_core.get_blog(999)
        assert blog is None

    def test_get_blog_error(self, blog_core: BlogCore, mocker: MockerFixture):
        mocker.patch.object(blog_core._blog_client, 'get_blog', side_effect=Exception('Error'))
        with pytest.raises(Exception):
            blog_core.get_blog(-10)

    def test_get_all_blogs(self, blog_core: BlogCore, sample_blog: Blog, mocker: MockerFixture):
        mocker.patch.object(blog_core._blog_client, 'get_all_blogs', return_value=[sample_blog])
        blogs = blog_core.get_all_blogs()
        assert blogs == [sample_blog]

    def test_get_all_blogs_not_found(self, blog_core: BlogCore, mocker: MockerFixture):
        mocker.patch.object(blog_core._blog_client, 'get_all_blogs', return_value=[])
        blogs = blog_core.get_all_blogs()
        assert blogs == []

    def test_get_all_blogs_error(self, blog_core: BlogCore, mocker: MockerFixture):
        mocker.patch.object(blog_core._blog_client, 'get_all_blogs', side_effect=Exception('Error'))
        with pytest.raises(Exception):
            blog_core.get_all_blogs()
