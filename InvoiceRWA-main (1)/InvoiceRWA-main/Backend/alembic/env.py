import os
import sys
from logging.config import fileConfig

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
fileConfig(config.config_file_name)

# add app's directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.db.base import Base  # noqa: E402
# Import all models so Alembic can detect them
from app.models.user import User  # noqa: E402
from app.models.invoice import Invoice  # noqa: E402
from app.models.organization import Organization  # noqa: E402
from app.models.kyc_person import KycPerson  # noqa: E402
from app.models.ubo import UBO  # noqa: E402
from app.models.document import Document  # noqa: E402
from app.models.audit import AuditLog  # noqa: E402
from app.models.bank_request import BankRequest  # noqa: E402

# set SQLALCHEMY URL from env if provided
db_url = os.getenv('DATABASE_URL')
if db_url:
	config.set_main_option('sqlalchemy.url', db_url)

target_metadata = Base.metadata


def run_migrations_offline():
	url = config.get_main_option('sqlalchemy.url')
	context.configure(url=url, target_metadata=target_metadata, literal_binds=True)

	with context.begin_transaction():
		context.run_migrations()


def run_migrations_online():
	from sqlalchemy import engine_from_config, pool

	connectable = engine_from_config(
		config.get_section(config.config_ini_section),
		prefix='sqlalchemy.',
		poolclass=pool.NullPool,
	)

	with connectable.connect() as connection:
		context.configure(connection=connection, target_metadata=target_metadata)

		with context.begin_transaction():
			context.run_migrations()


if context.is_offline_mode():
	run_migrations_offline()
else:
	run_migrations_online()
