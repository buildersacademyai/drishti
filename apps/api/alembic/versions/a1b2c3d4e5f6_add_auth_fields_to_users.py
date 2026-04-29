"""add auth fields to users

Revision ID: a1b2c3d4e5f6
Revises: d34d793cdf83
Create Date: 2026-04-29 12:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "d34d793cdf83"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(255), nullable=False, server_default=""))
    op.add_column("users", sa.Column("name", sa.String(255), nullable=True))
    # make email NOT NULL and unique (was nullable in v1)
    op.alter_column("users", "email", nullable=False)
    op.create_unique_constraint("uq_users_email", "users", ["email"])


def downgrade() -> None:
    op.drop_constraint("uq_users_email", "users", type_="unique")
    op.alter_column("users", "email", nullable=True)
    op.drop_column("users", "name")
    op.drop_column("users", "password_hash")
