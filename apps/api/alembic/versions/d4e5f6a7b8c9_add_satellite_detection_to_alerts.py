"""add satellite_detection_id to alerts

Revision ID: d4e5f6a7b8c9
Revises: c3d4e5f6a7b8
Create Date: 2026-07-16 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "d4e5f6a7b8c9"
down_revision: Union[str, None] = "c3d4e5f6a7b8"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("alerts", sa.Column("satellite_detection_id", postgresql.UUID(as_uuid=True), nullable=True))
    op.create_foreign_key(
        "fk_alerts_satellite_detection_id_satellite_detections",
        "alerts",
        "satellite_detections",
        ["satellite_detection_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_alerts_satellite_detection_id_satellite_detections", "alerts", type_="foreignkey")
    op.drop_column("alerts", "satellite_detection_id")
