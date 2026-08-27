from datetime import timedelta
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.core.security import get_password_hash
from app.core.time import utc_now
from app.core.geo import geocode_uk_postcode, create_point_geom
from app.models import (
    User,
    YouthProfile,
    Business,
    Opportunity,
    Application,
    Qualification,
    YouthQualification,
    Match,
)


def seed_database(db: Session = None):
    close_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_session = True

    try:
        print("🌱 Seeding database...")
        is_postgres = (db.bind.dialect.name == "postgresql") if db.bind else False

        # 1. Seed Qualifications
        standard_qualifications = [
            ("GCSE Mathematics", "GCSE"),
            ("GCSE English Language", "GCSE"),
            ("GCSE English Literature", "GCSE"),
            ("GCSE Computer Science", "GCSE"),
            ("GCSE Combined Science", "GCSE"),
            ("A-Level Mathematics", "A-Level"),
            ("A-Level Computer Science", "A-Level"),
            ("A-Level Business Studies", "A-Level"),
            ("BTEC Level 3 Information Technology", "BTEC"),
            ("BTEC Level 3 Health & Social Care", "BTEC"),
            ("T-Level Digital Production, Design & Development", "T-Level"),
        ]

        qual_map = {}
        for qual_name, cat in standard_qualifications:
            existing = db.query(Qualification).filter(Qualification.name == qual_name).first()
            if not existing:
                existing = Qualification(name=qual_name, category=cat)
                db.add(existing)
                db.flush()
            qual_map[qual_name] = existing

        # 2. Seed Youth User 1 (Alex Taylor - HP5 Chesham)
        user_youth_1 = db.query(User).filter(User.email == "youth@example.com").first()
        if not user_youth_1:
            user_youth_1 = User(
                email="youth@example.com",
                password_hash=get_password_hash("Password123!"),
                role="youth",
            )
            db.add(user_youth_1)
            db.flush()

            lat, lon = geocode_uk_postcode("HP5 1AA")
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            youth_profile_1 = YouthProfile(
                user_id=user_youth_1.id,
                full_name="Alex Taylor",
                preferred_location="Chesham, Buckinghamshire",
                postcode="HP5 1AA",
                max_travel_km=15,
                latitude=lat,
                longitude=lon,
                location_geom=loc_geom,
                skills=["Python", "Customer Service", "Problem Solving", "Teamwork"],
                interests=["Technology", "Retail", "Community"],
                availability={"days": ["Saturday", "Sunday"], "hours_per_week": 8},
                education_stage="sixth_form",
                bio="Ambitious 17-year-old student passionate about software development and customer-facing roles.",
                preferred_opportunity_types=["part_time_job", "work_experience"],
            )
            db.add(youth_profile_1)
            db.flush()

            # Add qualifications for youth 1
            for q_name, grade in [("GCSE Mathematics", "7"), ("GCSE English Language", "6"), ("GCSE Computer Science", "8")]:
                if q_name in qual_map:
                    db.add(
                        YouthQualification(
                            youth_profile_id=youth_profile_1.id,
                            qualification_id=qual_map[q_name].id,
                            name=q_name,
                            grade=grade,
                            year_obtained=2024,
                        )
                    )

        # 3. Seed Youth User 2 (Sarah Jenkins - Central London)
        user_youth_2 = db.query(User).filter(User.email == "sarah.youth@example.com").first()
        if not user_youth_2:
            user_youth_2 = User(
                email="sarah.youth@example.com",
                password_hash=get_password_hash("Password123!"),
                role="youth",
            )
            db.add(user_youth_2)
            db.flush()

            lat, lon = geocode_uk_postcode("SW1A 1AA")
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            youth_profile_2 = YouthProfile(
                user_id=user_youth_2.id,
                full_name="Sarah Jenkins",
                preferred_location="Central London",
                postcode="SW1A 1AA",
                max_travel_km=10,
                latitude=lat,
                longitude=lon,
                location_geom=loc_geom,
                skills=["Communication", "Event Planning", "Social Media", "First Aid"],
                interests=["Charity", "Arts & Culture", "Environment"],
                availability={"days": ["Wednesday", "Saturday"], "hours_per_week": 10},
                education_stage="college",
                bio="Dedicated college student keen to support local community initiatives and creative events.",
                preferred_opportunity_types=["volunteering", "work_experience"],
            )
            db.add(youth_profile_2)
            db.flush()

            for q_name, grade in [("BTEC Level 3 Health & Social Care", "Distinction"), ("GCSE English Literature", "7")]:
                if q_name in qual_map:
                    db.add(
                        YouthQualification(
                            youth_profile_id=youth_profile_2.id,
                            qualification_id=qual_map[q_name].id,
                            name=q_name,
                            grade=grade,
                            year_obtained=2023,
                        )
                    )

        # 4. Seed Business 1 (Apex Tech Innovations - Buckinghamshire)
        user_biz_1 = db.query(User).filter(User.email == "business@example.com").first()
        if not user_biz_1:
            user_biz_1 = User(
                email="business@example.com",
                password_hash=get_password_hash("Password123!"),
                role="business",
            )
            db.add(user_biz_1)
            db.flush()

            lat, lon = geocode_uk_postcode("HP5 2UR")
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            biz_1 = Business(
                user_id=user_biz_1.id,
                name="Apex Tech Innovations",
                organisation_type="Technology",
                contact_name="David Clarke",
                contact_email="dave@apextech.co.uk",
                description="Innovative digital software agency creating modern apps and web platforms for local enterprises.",
                address="14 High Street, Chesham",
                postcode="HP5 2UR",
                website="https://apextech.co.uk",
                latitude=lat,
                longitude=lon,
                location_geom=loc_geom,
            )
            db.add(biz_1)
            db.flush()
        else:
            biz_1 = user_biz_1.business

        # 5. Seed Business 2 (London Youth Horizons - London)
        user_biz_2 = db.query(User).filter(User.email == "techforward@example.com").first()
        if not user_biz_2:
            user_biz_2 = User(
                email="techforward@example.com",
                password_hash=get_password_hash("Password123!"),
                role="business",
            )
            db.add(user_biz_2)
            db.flush()

            lat, lon = geocode_uk_postcode("EC1A 1BB")
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            biz_2 = Business(
                user_id=user_biz_2.id,
                name="London Youth Horizons",
                organisation_type="Charity & Community",
                contact_name="Elena Rostova",
                contact_email="elena@youthhorizons.org.uk",
                description="Non-profit organisation providing youth mentorship, creative workshops, and community events across the UK.",
                address="88 Farringdon Road, London",
                postcode="EC1A 1BB",
                website="https://youthhorizons.org.uk",
                latitude=lat,
                longitude=lon,
                location_geom=loc_geom,
            )
            db.add(biz_2)
            db.flush()
        else:
            biz_2 = user_biz_2.business

        # 6. Seed Opportunities (6 opportunities)
        existing_opps = db.query(Opportunity).count()
        if existing_opps == 0:
            opportunities_data = [
                {
                    "business_id": biz_1.id,
                    "title": "Weekend Junior Web Developer",
                    "opportunity_type": "part_time_job",
                    "description": "Join our friendly engineering team to build web components and client landing pages. Perfect for sixth formers or college students looking to build their technical portfolio.",
                    "required_skills": ["Python", "Problem Solving"],
                    "preferred_skills": ["Teamwork", "HTML/CSS"],
                    "location_name": "Chesham, Buckinghamshire",
                    "postcode": "HP5 2UR",
                    "workplace_type": "hybrid",
                    "pay_info": "£11.44 / hour",
                    "hours_or_commitment": "8 hours / week (Saturdays)",
                    "deadline": utc_now() + timedelta(days=30),
                    "status": "published",
                },
                {
                    "business_id": biz_1.id,
                    "title": "Summer Technology Work Experience Placement",
                    "opportunity_type": "work_experience",
                    "description": "Hands-on two-week summer placement shadowing full-stack software engineers, product managers, and UI designers on live client projects.",
                    "required_skills": ["Python", "Customer Service"],
                    "preferred_skills": ["Teamwork"],
                    "location_name": "Remote & Chesham HQ",
                    "postcode": "HP5 2UR",
                    "workplace_type": "remote",
                    "pay_info": "Unpaid (Travel & lunch reimbursed)",
                    "hours_or_commitment": "2 weeks full-time (July)",
                    "deadline": utc_now() + timedelta(days=45),
                    "status": "published",
                },
                {
                    "business_id": biz_2.id,
                    "title": "Youth Community Event Assistant",
                    "opportunity_type": "volunteering",
                    "description": "Help organize vibrant community workshops, assist with event registration, and coordinate youth art showcases across Central London.",
                    "required_skills": ["Communication", "Event Planning"],
                    "preferred_skills": ["Social Media", "First Aid"],
                    "location_name": "Central London",
                    "postcode": "EC1A 1BB",
                    "workplace_type": "in_person",
                    "pay_info": "Voluntary (Expenses covered)",
                    "hours_or_commitment": "4-6 hours on event Saturdays",
                    "deadline": utc_now() + timedelta(days=60),
                    "status": "published",
                },
                {
                    "business_id": biz_2.id,
                    "title": "Social Media & Creative Content Intern",
                    "opportunity_type": "work_experience",
                    "description": "Draft social media posts, design Canva graphics, and create short video content to engage our UK youth community.",
                    "required_skills": ["Social Media", "Communication"],
                    "preferred_skills": ["Video Editing", "Content Creation"],
                    "location_name": "London",
                    "postcode": "EC1A 1BB",
                    "workplace_type": "hybrid",
                    "pay_info": "£12.00 / hour",
                    "hours_or_commitment": "10 hours / week",
                    "deadline": utc_now() + timedelta(days=20),
                    "status": "draft",
                },
                {
                    "business_id": biz_1.id,
                    "title": "Retail & Customer Service Pop-up Assistant",
                    "opportunity_type": "part_time_job",
                    "description": "Assisting customers at our promotional tech pop-up stall in Manchester. Applications are now closed for this intake.",
                    "required_skills": ["Customer Service", "Communication"],
                    "preferred_skills": ["Cash Handling"],
                    "location_name": "Manchester City Centre",
                    "postcode": "M1 1AE",
                    "workplace_type": "in_person",
                    "pay_info": "£11.50 / hour",
                    "hours_or_commitment": "16 hours / week",
                    "deadline": utc_now() - timedelta(days=10),
                    "status": "closed",
                },
                {
                    "business_id": biz_2.id,
                    "title": "Youth Peer Mentor & STEM Workshop Facilitator",
                    "opportunity_type": "volunteering",
                    "description": "Facilitate interactive weekly peer mentoring workshops for secondary school pupils interested in science and technology.",
                    "required_skills": ["Communication", "Teamwork"],
                    "preferred_skills": ["Leadership", "Problem Solving"],
                    "location_name": "Birmingham Central",
                    "postcode": "B1 1BB",
                    "workplace_type": "in_person",
                    "pay_info": "Voluntary role",
                    "hours_or_commitment": "2 hours every Wednesday evening",
                    "deadline": utc_now() + timedelta(days=40),
                    "status": "published",
                },
            ]

            created_opps = []
            for data in opportunities_data:
                lat, lon = geocode_uk_postcode(data["postcode"])
                loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

                opp = Opportunity(
                    business_id=data["business_id"],
                    title=data["title"],
                    opportunity_type=data["opportunity_type"],
                    description=data["description"],
                    required_skills=data["required_skills"],
                    preferred_skills=data["preferred_skills"],
                    location_name=data["location_name"],
                    postcode=data["postcode"],
                    workplace_type=data["workplace_type"],
                    pay_info=data["pay_info"],
                    hours_or_commitment=data["hours_or_commitment"],
                    deadline=data["deadline"],
                    status=data["status"],
                    latitude=lat,
                    longitude=lon,
                    location_geom=loc_geom,
                )
                db.add(opp)
                created_opps.append(opp)

            db.flush()

            # 7. Seed Sample Application (Youth 1 Alex -> Opportunity 1 Web Developer)
            youth_1_profile = user_youth_1.youth_profile
            if youth_1_profile and len(created_opps) > 0:
                sample_app = Application(
                    youth_profile_id=youth_1_profile.id,
                    opportunity_id=created_opps[0].id,
                    status="submitted",
                    cover_note="I am very excited about this role! I have built several Python scripts and web widgets in my spare time and I would love the opportunity to contribute to your team.",
                )
                db.add(sample_app)

        db.commit()
        print("✅ Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        print(f"❌ Error during seeding: {e}")
        raise e
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    seed_database()
