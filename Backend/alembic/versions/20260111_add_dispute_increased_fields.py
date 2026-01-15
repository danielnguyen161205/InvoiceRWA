"""Add dispute increased amount fields

Revision ID: 20260111_dispute_increased
Revises: 98632e72f3d1
Create Date: 2026-01-11

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260111_dispute_increased'
down_revision = '98632e72f3d1'  # Link to the latest head
branch_labels = None
depends_on = None


def upgrade():
    # Add new dispute resolution fields only
    # (Base dispute fields already exist in database)
    op.add_column('invoices', sa.Column('dispute_resolution_action', sa.String(50), nullable=True))
    op.add_column('invoices', sa.Column('previous_amount', sa.Float(), nullable=True))
    op.add_column('invoices', sa.Column('increased_amount', sa.Float(), nullable=True))
    op.add_column('invoices', sa.Column('additional_financing_amount', sa.Float(), nullable=True))
    op.add_column('invoices', sa.Column('linked_invoice_id', sa.Integer(), nullable=True))


def downgrade():
    op.drop_column('invoices', 'dispute_resolution_action')
    op.drop_column('invoices', 'previous_amount')
    op.drop_column('invoices', 'increased_amount')
    op.drop_column('invoices', 'additional_financing_amount')
    op.drop_column('invoices', 'linked_invoice_id')
