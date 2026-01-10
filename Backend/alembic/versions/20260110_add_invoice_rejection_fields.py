"""add invoice rejection fields

Revision ID: 20260110_invoice_rejection
Revises: 20260110_add_dispute_fields
Create Date: 2026-01-10 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '20260110_invoice_rejection'
down_revision = '20260110_add_dispute_fields'
branch_labels = None
depends_on = None


def upgrade():
    # Add rejection fields to invoices table
    op.add_column('invoices', sa.Column('rejection_comment', sa.Text(), nullable=True))
    op.add_column('invoices', sa.Column('rejected_at', sa.DateTime(), nullable=True))
    op.add_column('invoices', sa.Column('rejected_by', sa.Integer(), nullable=True))


def downgrade():
    # Remove rejection fields from invoices table
    op.drop_column('invoices', 'rejected_by')
    op.drop_column('invoices', 'rejected_at')
    op.drop_column('invoices', 'rejection_comment')
