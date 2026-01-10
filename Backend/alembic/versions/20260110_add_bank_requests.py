"""add bank requests and financing fields

Revision ID: 20260110_add_bank_requests
Revises: 20260110_invoice_rejection
Create Date: 2026-01-10

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260110_add_bank_requests'
down_revision = '20260110_invoice_rejection'
branch_labels = None
depends_on = None


def upgrade():
    # Create bank_requests table
    op.create_table('bank_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('invoice_id', sa.Integer(), nullable=False),
        sa.Column('bank_id', sa.Integer(), nullable=False),
        sa.Column('sme_id', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('requested_at', sa.DateTime(), nullable=True),
        sa.Column('bank_responded_at', sa.DateTime(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('financing_started_at', sa.DateTime(), nullable=True),
        sa.Column('bank_financed_at', sa.DateTime(), nullable=True),
        sa.Column('sme_confirmed_receipt_at', sa.DateTime(), nullable=True),
        sa.Column('financed_at', sa.DateTime(), nullable=True),
        sa.Column('finance_amount', sa.Integer(), nullable=True),
        sa.Column('interest_rate', sa.Integer(), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['bank_id'], ['users.id'], ),
        sa.ForeignKeyConstraint(['invoice_id'], ['invoices.id'], ),
        sa.ForeignKeyConstraint(['sme_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_bank_requests_id'), 'bank_requests', ['id'], unique=False)
    
    # Add new columns to invoices table
    op.add_column('invoices', sa.Column('bank_confirmed_financed', sa.Boolean(), nullable=True))
    op.add_column('invoices', sa.Column('sme_confirmed_receipt', sa.Boolean(), nullable=True))
    op.add_column('invoices', sa.Column('bank_financed_at', sa.DateTime(), nullable=True))
    op.add_column('invoices', sa.Column('sme_confirmed_at', sa.DateTime(), nullable=True))
    
    # Set default values for existing rows
    op.execute("UPDATE invoices SET bank_confirmed_financed = 0 WHERE bank_confirmed_financed IS NULL")
    op.execute("UPDATE invoices SET sme_confirmed_receipt = 0 WHERE sme_confirmed_receipt IS NULL")


def downgrade():
    # Remove columns from invoices table
    op.drop_column('invoices', 'sme_confirmed_at')
    op.drop_column('invoices', 'bank_financed_at')
    op.drop_column('invoices', 'sme_confirmed_receipt')
    op.drop_column('invoices', 'bank_confirmed_financed')
    
    # Drop bank_requests table
    op.drop_index(op.f('ix_bank_requests_id'), table_name='bank_requests')
    op.drop_table('bank_requests')
