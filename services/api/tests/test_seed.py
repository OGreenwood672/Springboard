import pytest
from app.models import User, YouthProfile, Business, Opportunity, Application, Qualification


def test_seed_database_contents(db_session):
    # Assert Users
    users = db_session.query(User).all()
    assert len(users) >= 4
    assert any(u.email == "youth@example.com" for u in users)
    assert any(u.email == "business@example.com" for u in users)

    # Assert Youth Profiles
    youth_profiles = db_session.query(YouthProfile).all()
    assert len(youth_profiles) >= 2
    youth_user = db_session.query(User).filter(User.email == "youth@example.com").first()
    assert youth_user is not None
    alex = youth_user.youth_profile
    assert alex is not None
    assert "Python" in alex.skills

    # Assert Businesses
    businesses = db_session.query(Business).all()
    assert len(businesses) >= 2
    apex = db_session.query(Business).filter(Business.name == "Apex Tech Innovations").first()
    assert apex is not None

    # Assert Opportunities
    opportunities = db_session.query(Opportunity).all()
    assert len(opportunities) >= 6
    published = db_session.query(Opportunity).filter(Opportunity.status == "published").all()
    draft = db_session.query(Opportunity).filter(Opportunity.status == "draft").all()
    closed = db_session.query(Opportunity).filter(Opportunity.status == "closed").all()
    assert len(published) >= 4
    assert len(draft) >= 1
    assert len(closed) >= 1

    # Assert Applications
    apps = db_session.query(Application).all()
    assert len(apps) >= 1
