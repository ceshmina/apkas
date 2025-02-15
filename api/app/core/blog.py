from model.blog import Blog
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


blog_core = BlogCore(PostgresBlogClient())
