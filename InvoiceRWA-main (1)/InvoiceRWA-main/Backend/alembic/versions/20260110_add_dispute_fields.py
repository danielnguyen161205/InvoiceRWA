"""Add dispute system fields

Revision ID: 20260110_add_dispute_fields
Revises: 
Create Date: 2026-01-10

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260110_add_dispute_fields'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add new dispute fields to invoices table
    op.add_column('invoices', sa.Column('dispute_type', sa.String(50), nullable=True))
    op.add_column('invoices', sa.Column('dispute_case_id', sa.String(100), nullable=True))
    op.add_column('invoices', sa.Column('dispute_description', sa.Text, nullable=True))
    op.add_column('invoices', sa.Column('dispute_resolved', sa.Boolean, server_default='0'))
    op.add_column('invoices', sa.Column('dispute_resolved_at', sa.DateTime, nullable=True))


def downgrade():
    # Remove dispute fields
    op.drop_column('invoices', 'dispute_resolved_at')
    op.drop_column('invoices', 'dispute_resolved')
    op.drop_column('invoices', 'dispute_description')
    op.drop_column('invoices', 'dispute_case_id')
    op.drop_column('invoices', 'dispute_type')
