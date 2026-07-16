"""add satellite_detection_id to missions

Revision ID: f6a7b8c9d0e1
Revises: e5f6a7b8c9d0
Create Date: 2026-07-16 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "f6a7b8c9d0e1"
down_revision: Union[str, None] = "e5f6a7b8c9d0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("missions", sa.Column("satellite_detection_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_missions_satellite_detection_id_satellite_detections",
        "missions",
        "satellite_detections",
        ["satellite_detection_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_missions_satellite_detection_id_satellite_detections", "missions", type_="foreignkey")
    op.drop_column("missions", "satellite_detection_id")
