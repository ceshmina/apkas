from model.blog import Blog, Tag
from store.client import BlogClient
from store.impl.blog import PostgresBlogClient


class BlogCore:
    _blog_client: BlogClient

    def __init__(self, blog_client: BlogClient) -> None:
        self._blog_client = blog_client

    def get_blog(self, blog_id: int) -> Blog | None:
        try:
            return self._blog_client.get_blog(blog_id)
        except Exception as e:
            raise Exception(f'Failed to get blog: {e}')

    def get_all_blogs(self) -> list[Blog]:
        try:
            return self._blog_client.get_all_blogs()
        except Exception as e:
            raise Exception(f'Failed to get all blogs: {e}')

    def get_tag(self, tag_id: int) -> Tag | None:
        try:
            return self._blog_client.get_tag(tag_id)
        except Exception as e:
            raise Exception(f'Failed to get tag: {e}')

    def get_all_tags(self) -> list[Tag]:
        try:
            return self._blog_client.get_all_tags()
        except Exception as e:
            raise Exception(f'Failed to get all tags: {e}')


blog_core = BlogCore(PostgresBlogClient())
