import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import geoalchemy2.admin.dialects.sqlite

# Disable SpatiaLite DDL calls when testing in pure SQLite
def _noop(*args, **kwargs):
    pass

geoalchemy2.admin.dialects.sqlite.after_create = _noop
geoalchemy2.admin.dialects.sqlite.before_create = _noop

from app.database import Base, get_db
from app.config import settings
from app.main import app
from app.seed import seed_database

# Create in-memory SQLite database for testing
TEST_DATABASE_URL = "sqlite:///:memory:"
test_engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(autouse=True)
def disable_external_semantic_calls(monkeypatch):
    monkeypatch.setattr(settings, "SEMANTIC_SKILLS_ENABLED", False)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    seed_database(db=db)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
