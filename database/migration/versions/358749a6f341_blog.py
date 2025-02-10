"""blog

Revision ID: 358749a6f341
Revises: d30d939e987c
Create Date: 2025-02-10 22:32:25.522104

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '358749a6f341'
down_revision: Union[str, None] = 'd30d939e987c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('create schema if not exists blog')

    op.execute("""
        create table if not exists blog.entries (
            id serial primary key,
            title text not null,
            content text not null,
            created_at timestamp not null default now(),
            updated_at timestamp
        )
    """)

    op.execute("""
        create table if not exists blog.tags (
            id serial primary key,
            name text not null,
            created_at timestamp not null default now(),
            updated_at timestamp
        )
    """)

    op.execute("""
        create table if not exists blog.entry_tags (
            entry_id integer references blog.entries(id),
            tag_id integer references blog.tags(id),
            primary key (entry_id, tag_id)
        )
    """)


def downgrade() -> None:
    op.execute('drop table if exists blog.entry_tags')
    op.execute('drop table if exists blog.tags')
    op.execute('drop table if exists blog.entries')
    op.execute('drop schema if exists blog')
