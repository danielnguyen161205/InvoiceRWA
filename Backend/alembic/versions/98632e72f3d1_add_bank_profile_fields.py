"""add_bank_profile_fields

Revision ID: 98632e72f3d1
Revises: 580b17343089
Create Date: 2026-01-11 02:57:45.384191

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '98632e72f3d1'
down_revision = '580b17343089'
branch_labels = None
depends_on = None


def upgrade():
    # Add bank profile fields to organizations table
    op.add_column('organizations', sa.Column('average_disbursement_days', sa.Integer(), nullable=True))
    op.add_column('organizations', sa.Column('discount_interest_rate', sa.String(length=50), nullable=True))
    op.add_column('organizations', sa.Column('average_financing_percentage', sa.String(length=50), nullable=True))


def downgrade():
    # Remove bank profile fields from organizations table
    op.drop_column('organizations', 'average_financing_percentage')
    op.drop_column('organizations', 'discount_interest_rate')
    op.drop_column('organizations', 'average_disbursement_days')
