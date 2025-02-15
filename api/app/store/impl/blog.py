from datetime import datetime
from typing import TypeAlias

from psycopg2.extensions import connection as Connection

from model.blog import Blog, Tag
from store.client import BlogClient
from store.connection.postgres import PostgresConnection

EntryRecord: TypeAlias = tuple[int, str, str, datetime, datetime | None]
TagRecord: TypeAlias = tuple[int, str, datetime, datetime]


class PostgresBlogClient(BlogClient, PostgresConnection):
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

    @PostgresConnection.with_connection
    def get_blog(self, blog_id: int, *, connection: Connection) -> Blog | None:
        sql_entry = f"""
            select id, title, content, created_at, updated_at
            from blog.entries
            where id = {blog_id}
        """
        sql_tags = f"""
            select t.id, t.name, t.created_at, t.updated_at
            from blog.tags as t join blog.entry_tags as et on t.id = et.tag_id
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

    @PostgresConnection.with_connection
    def get_all_blogs(self, *, connection: Connection) -> list[Blog]:
        sql_entries = """
            select id, title, content, created_at, updated_at
            from blog.entries
            order by created_at desc
        """
        sql_tags = """
            select et.entry_id, t.id, t.name, t.created_at, t.updated_at
            from blog.tags as t join blog.entry_tags as et on t.id = et.tag_id
        """

        try:
            with connection.cursor() as cursor:
                cursor.execute(sql_entries)
                records_entry = cursor.fetchall()
                cursor.execute(sql_tags)
                records_tags = cursor.fetchall()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')

        diary_tags: dict[int, list[Tag]] = {}
        for record in records_tags:
            blog_id = record[0]
            if blog_id not in diary_tags:
                diary_tags[blog_id] = []
            diary_tags[blog_id].append(self._to_tag(record[1:]))

        diaries = []
        for record_entry in records_entry:
            tags = diary_tags.get(record_entry[0], [])
            diaries.append(self._to_diary(record_entry, tags))

        return diaries
