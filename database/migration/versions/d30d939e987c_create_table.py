"""Create table

Revision ID: d30d939e987c
Revises: 4d8c2df34094
Create Date: 2025-02-06 15:02:52.513049

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd30d939e987c'
down_revision: Union[str, None] = '4d8c2df34094'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('''
        create table if not exists diary.locations (
            id serial primary key,
            name text not null,
            created_at timestamp not null default now(),
            updated_at timestamp
        )
    ''')
    op.execute('''
        create table if not exists diary.entries (
            id serial primary key,
            title text,
            date date not null,
            content text not null,
            location_id integer references diary.locations(id),
            created_at timestamp not null default now(),
            updated_at timestamp
        )
    ''')


def downgrade() -> None:
    op.execute('drop table if exists diary.entries')
    op.execute('drop table if exists diary.locations')
