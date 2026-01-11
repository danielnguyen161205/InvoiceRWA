from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import DATABASE_URL
import os
from urllib.parse import urlparse, urlunparse, parse_qsl, urlencode

# Create engine depending on database type. SQLite needs `check_same_thread`.
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    # For MySQL (Aiven) or other DBs, enable pool_pre_ping and sanitize unsupported URL params.
    url = DATABASE_URL
    if url.startswith("mysql://"):
        url = url.replace("mysql://", "mysql+pymysql://", 1)

    parsed = urlparse(url)
    # Remove unsupported parameters like 'ssl-mode' that PyMySQL doesn't accept
    qs = parse_qsl(parsed.query, keep_blank_values=True)
    filtered_qs = [(k, v) for (k, v) in qs if k not in {"ssl-mode", "ssl_mode"}]
    new_query = urlencode(filtered_qs)
    DATABASE_URL = urlunparse((parsed.scheme, parsed.netloc, parsed.path, parsed.params, new_query, parsed.fragment))

    connect_args = {}
    # Force TLS if required by provider; PyMySQL uses an 'ssl' dict.
    mysql_ca = os.getenv("MYSQL_SSL_CA")
    if mysql_ca:
        connect_args["ssl"] = {"ca": mysql_ca}
    else:
        # Empty dict triggers TLS handshake with managed providers like Aiven
        connect_args["ssl"] = {}

    engine = create_engine(DATABASE_URL, pool_pre_ping=True, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


