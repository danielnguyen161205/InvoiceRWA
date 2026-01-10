"""add user organization link

Revision ID: 20260108_add_user_org
Revises: 20260106_add_kyc_audit_and_storage
Create Date: 2026-01-08

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '20260108_add_user_org'
down_revision = '20260106_add_kyc_audit_and_storage'
branch_labels = None
depends_on = None


def upgrade():
    # Add organization_id column to users table
    op.add_column('users', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_foreign_key('fk_users_organization', 'users', 'organizations', ['organization_id'], ['id'])


def downgrade():
    op.drop_constraint('fk_users_organization', 'users', type_='foreignkey')
    op.drop_column('users', 'organization_id')
