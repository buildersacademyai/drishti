"""add telemetry_source_ip to drones

Revision ID: c9d0e1f2a3b4
Revises: b8c9d0e1f2a3
Create Date: 2026-07-17
"""
from alembic import op
import sqlalchemy as sa

revision = "c9d0e1f2a3b4"
down_revision = "b8c9d0e1f2a3"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("drones", sa.Column("telemetry_source_ip", sa.String(45), nullable=True))


def downgrade() -> None:
    op.drop_column("drones", "telemetry_source_ip")
