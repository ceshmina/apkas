import os

import psycopg2

from model.diary import Diary, Location
from store.client import DiaryClient

PG_CONF = {
    'host': os.getenv('DB_HOST'),
    'port': os.getenv('DB_PORT'),
    'dbname': os.getenv('DB_NAME'),
    'user': os.getenv('DB_USER'),
    'password': os.getenv('DB_PASSWORD'),
}


class PostgresDiaryClient(DiaryClient):
    def __init__(self) -> None:
        try:
            self._connection = psycopg2.connect(**PG_CONF)  # type: ignore
        except Exception as e:
            raise Exception(f'Failed to connect to PostgreSQL: {e}')

    def get_diary(self, diary_id: int) -> Diary | None:
        sql = f"""
            select
                e.id, title, date, location_id, l.name as location_name, content,
                e.created_at, e.updated_at
            from
                diary.entries as e
                left join diary.locations as l on e.location_id = l.id
            where
                e.id = {diary_id}
        """
        try:
            with self._connection.cursor() as cursor:
                cursor.execute(sql)
                record = cursor.fetchone()
        except Exception as e:
            raise Exception(f'Failed to execute SQL: {e}')

        if record:
            return Diary(
                diary_id=record[0],
                title=record[1],
                date=record[2],
                location=Location(location_id=record[3], name=record[4]),
                content=record[5],
                created_at=record[6],
                updated_at=record[7],
            )
        else:
            return None
