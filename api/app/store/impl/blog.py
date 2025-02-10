from datetime import datetime
from typing import TypeAlias

from psycopg2.extensions import connection as Connection

from model.blog import Blog, Tag
from store.client import BlogClient
from store.impl.postgres import with_connection

EntryRecord: TypeAlias = tuple[int, str, str, datetime, datetime | None]
TagRecord: TypeAlias = tuple[int, str, datetime, datetime]


class PostgresBlogClient(BlogClient):
    def _to_diary(self, record: EntryRecord, tags: list[Tag]) -> Blog:
        return Blog(
            blog_id=record[0],
            title=record[1],
            content=record[2],
            created_at=record[3],
            updated_at=record[4],
            tags=tags,
        )

    def _to_tag(self, record: TagRecord) -> Tag:
        return Tag(
            tag_id=record[0],
            name=record[1],
            created_at=record[2],
            updated_at=record[3],
        )

    @with_connection
    def get_blog(self, blog_id: int, *, connection: Connection) -> Blog | None:
        sql_entry = f"""
            select id, title, content, created_at, updated_at
            from blog.entries
            where id = {blog_id}
        """
        sql_tags = f"""
            select t.id, t.name, t.created_at, t.updated_at
            from blog.tags t join blog.entry_tags et on t.id = et.tag_id
            where et.entry_id = {blog_id}
        """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql_entry)
                record_entry = cursor.fetchone()
                cursor.execute(sql_tags)
                records_tags = cursor.fetchall()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')

        if record_entry:
            tags = [self._to_tag(record) for record in records_tags]
            return self._to_diary(record_entry, tags)
        else:
            return None
