"""add detection verification columns

Revision ID: c3d4e5f6a7b8
Revises: b2c3d4e5f6a7
Create Date: 2026-07-02 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "c3d4e5f6a7b8"
down_revision: Union[str, None] = "b2c3d4e5f6a7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("detections", sa.Column("status", sa.String(20), nullable=False, server_default="pending_review"))
    op.add_column("detections", sa.Column("verified_by", postgresql.UUID(as_uuid=True), nullable=True))
    op.add_column("detections", sa.Column("verified_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    op.drop_column("detections", "verified_at")
    op.drop_column("detections", "verified_by")
    op.drop_column("detections", "status")
