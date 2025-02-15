import functools
import os
from logging import getLogger
from typing import Any, Callable, TypeVar

import psycopg2
from psycopg2.extensions import connection as Connection

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

T = TypeVar('T')


class PostgresConnection:
    @classmethod
    def with_connection(cls, func: Callable[..., T]) -> Callable[..., T]:
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
