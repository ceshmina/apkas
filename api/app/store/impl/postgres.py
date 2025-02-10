import functools
import os
from datetime import date, datetime
from logging import getLogger
from typing import Any, Callable, TypeAlias, TypeVar

import psycopg2
from psycopg2.extensions import connection as Connection

from model.diary import Diary, Location
from store.client import DiaryClient

PG_CONF = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
    'connect_timeout': 60,
}

MAX_RETRIES = 3

logger = getLogger(f'uvicorn.{__name__}')

BASE_SQL = """
    select
        e.id, title, date, location_id, l.name as location_name, content,
        e.created_at, e.updated_at
    from
        diary.entries as e
        left join diary.locations as l on e.location_id = l.id
"""

T = TypeVar('T')

Record: TypeAlias = tuple[int, str | None, date, int | None, str | None, str, datetime, datetime | None]


def with_connection(func: Callable[..., T]) -> Callable[..., T]:
    @functools.wraps(func)
    def wrapper(self: Any, *args: Any, **kwargs: Any) -> T:
        retries = 0
        connection: Connection | None = None
        while retries < MAX_RETRIES:
            try:
                connection = psycopg2.connect(**PG_CONF)  # type: ignore
                break
            except Exception as e:
                retries += 1
                if retries >= MAX_RETRIES:
                    raise Exception(f'Failed to connect to PostgreSQL after {MAX_RETRIES} attempts: {e}')
                else:
                    logger.info('Failed to connect to PostgreSQL. Retrying...')
        try:
            return func(self, *args, connection=connection, **kwargs)
        finally:
            if connection:
                connection.close()

    return wrapper


class PostgresDiaryClient(DiaryClient):
    def _to_diary(self, record: Record) -> Diary:
        if record[3] and record[4]:
            location = Location(location_id=record[3], name=record[4])
        else:
            location = None
        return Diary(
            diary_id=record[0],
            title=record[1],
            date=record[2],
            location=location,
            content=record[5],
            created_at=record[6],
            updated_at=record[7],
        )

    @with_connection
    def get_diary(self, diary_id: int, *, connection: Connection) -> Diary | None:
        sql = f"""
            {BASE_SQL}
            where
                e.id = {diary_id}
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                record = cursor.fetchone()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')

        if record:
            return self._to_diary(record)
        else:
            return None

    @with_connection
    def get_location(self, location_id: int, *, connection: Connection) -> Location | None:
        sql = f"""
            select id, name
            from diary.locations
            where id = {location_id}
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                record = cursor.fetchone()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')

        if record:
            return Location(location_id=record[0], name=record[1])
        else:
            return None

    @with_connection
    def search_diaries_by_date(self, date: date, *, connection: Connection) -> list[Diary]:
        sql = f"""
            {BASE_SQL}
            where
                e.date = '{date.strftime('%Y-%m-%d')}'
            order by
                e.date desc, e.created_at desc
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                records = cursor.fetchall()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')
        return [self._to_diary(record) for record in records]

    @with_connection
    def search_diaries_by_month(self, month: date, *, connection: Connection) -> list[Diary]:
        sql = f"""
            {BASE_SQL}
            where
                date_trunc('month', e.date) = '{month.strftime('%Y-%m-01')}'
            order by
                e.date desc, e.created_at desc
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                records = cursor.fetchall()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')
        return [self._to_diary(record) for record in records]

    @with_connection
    def search_diaries_by_location(self, location_id: int, *, connection: Connection) -> list[Diary]:
        sql = f"""
            {BASE_SQL}
            where
                e.location_id = {location_id}
            order by
                e.date desc, e.created_at desc
        """
        try:
            with connection.cursor() as cursor:
                cursor.execute(sql)
                records = cursor.fetchall()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')
        return [self._to_diary(record) for record in records]
