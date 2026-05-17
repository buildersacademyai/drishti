"""add drones table

Revision ID: b2c3d4e5f6a7
Revises: a1b2c3d4e5f6
Create Date: 2026-04-29
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

revision = "b2c3d4e5f6a7"
down_revision = "a1b2c3d4e5f6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "drones",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("tenant_id", UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("model", sa.String(100), nullable=True),
        sa.Column("serial_number", sa.String(100), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="at_station"),
        sa.Column("battery_pct", sa.Integer, nullable=True),
        sa.Column("total_flight_hours", sa.Float, server_default="0"),
        sa.Column("last_seen", sa.DateTime, nullable=True),
        sa.Column("current_mission_id", UUID(as_uuid=True), sa.ForeignKey("missions.id"), nullable=True),
        sa.Column("home_lat", sa.Float, nullable=True),
        sa.Column("home_lng", sa.Float, nullable=True),
        sa.Column("current_lat", sa.Float, nullable=True),
        sa.Column("current_lng", sa.Float, nullable=True),
        sa.Column("notes", sa.String(500), nullable=True),
        sa.Column("registered_at", sa.DateTime, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("drones")
