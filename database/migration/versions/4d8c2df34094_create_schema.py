"""Create schema

Revision ID: 4d8c2df34094
Revises: 
Create Date: 2025-02-06 14:31:31.697715

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4d8c2df34094'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute('create schema if not exists diary')


def downgrade() -> None:
    pass
