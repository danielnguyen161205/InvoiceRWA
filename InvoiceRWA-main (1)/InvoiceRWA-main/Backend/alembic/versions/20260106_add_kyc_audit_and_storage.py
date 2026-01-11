"""add kyc audit tables and document storage_path

Revision ID: 20260106_add_kyc_audit_and_storage
Revises: 
Create Date: 2026-01-06 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260106_add_kyc_audit_and_storage'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('actor_sub', sa.String(length=255), nullable=True),
        sa.Column('actor_roles', sa.String(length=255), nullable=True),
        sa.Column('action', sa.String(length=255), nullable=False),
        sa.Column('target_type', sa.String(length=255), nullable=False),
        sa.Column('target_id', sa.String(length=255), nullable=True),
        sa.Column('comments', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=True),
    )

    # create organization_reviews table
    op.create_table(
        'organization_reviews',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('org_id', sa.Integer, nullable=False),
        sa.Column('reviewer_sub', sa.String(length=255), nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('comments', sa.Text, nullable=True),
        sa.Column('created_at', sa.DateTime, nullable=True),
    )

    # add storage_path to documents
    with op.batch_alter_table('documents') as batch_op:
        batch_op.add_column(sa.Column('storage_path', sa.String(length=1024), nullable=True))


def downgrade():
    # drop storage_path
    with op.batch_alter_table('documents') as batch_op:
        batch_op.drop_column('storage_path')

    op.drop_table('organization_reviews')
    op.drop_table('audit_logs')
