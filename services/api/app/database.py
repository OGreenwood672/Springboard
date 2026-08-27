import os
import uuid
import logging
from typing import Generator
from sqlalchemy import create_engine, String, TypeDecorator, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from geoalchemy2 import Geometry
from app.config import settings

logger = logging.getLogger("uvicorn.error")


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's native UUID type, otherwise uses String(36) for SQLite compatibility.
    """
    impl = String(36)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(String(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == "postgresql":
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(str(value)))
            else:
                return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(str(value))
            return value


class PointGeometry(TypeDecorator):
    """Platform-independent PostGIS Point geometry type.
    Uses PostGIS Geometry(POINT, 4326) on PostgreSQL, and String on other dialects for SQLite test compatibility.
    """
    impl = String(255)
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(Geometry(geometry_type="POINT", srid=4326, spatial_index=False))
        else:
            return dialect.type_descriptor(String(255))

    def process_bind_param(self, value, dialect):
        if dialect.name != "postgresql" or value is None:
            return str(value) if value is not None else None
        return value


def create_db_engine():
    """Create database engine with automatic fallback to standalone SQLite if PostgreSQL is unreachable."""
    db_url = settings.DATABASE_URL
    is_sqlite = db_url.startswith("sqlite")

    if not is_sqlite:
        try:
            # Test PostgreSQL connection with a short timeout
            test_engine = create_engine(
                db_url,
                pool_pre_ping=True,
                connect_args={"connect_timeout": 3},
            )
            with test_engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Connected successfully to PostgreSQL database.")
            return test_engine
        except Exception as e:
            logger.warning(
                f"PostgreSQL connection to {db_url} failed ({e}). "
                "Automatically activating standalone SQLite database (springboard.db)."
            )
            return create_engine(
                "sqlite:///./springboard.db",
                pool_pre_ping=True,
                connect_args={"check_same_thread": False},
            )
    else:
        return create_engine(
            db_url,
            pool_pre_ping=True,
            connect_args={"check_same_thread": False},
        )


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def init_db():
    """Ensure database schema is created and auto-seed initial UK data if database is empty."""
    # Import all models so metadata is complete
    import app.models  # noqa: F401
    from app.models.user import User
    from app.seed import seed_database

    try:
        Base.metadata.create_all(bind=engine)
        with SessionLocal() as db:
            user_count = db.query(User).count()
            if user_count == 0:
                logger.info("Standalone database is empty. Auto-seeding UK opportunities and demo accounts...")
                seed_database(db=db)
    except Exception as err:
        logger.error(f"Error during init_db: {err}")


def get_db() -> Generator[Session, None, None]:
    """Dependency that yields a SQLAlchemy database session and ensures proper closure."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
