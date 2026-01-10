"""merge heads

Revision ID: 580b17343089
Revises: 20260108_add_user_org, 20260110_add_bank_requests
Create Date: 2026-01-10 18:18:38.500365

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '580b17343089'
down_revision = ('20260108_add_user_org', '20260110_add_bank_requests')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
