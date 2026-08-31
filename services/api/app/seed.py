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
    Council,
    WageSubsidyScheme,
    WageSubsidyAllocation,
)


def seed_database(db: Session = None):
    close_session = False
    if db is None:
        Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        close_session = True

    try:
        print("[SEED] Seeding database with Youth, Business, and Council Wage Subsidy data...")
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

        # 2. Seed Youth User 1 (Alex Taylor - HP5 Chesham - Low-Income Eligible)
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
                is_low_income_eligible=True,
                household_income_bracket="under_18k",
                pupil_premium_recipient=True,
            )
            db.add(youth_profile_1)
            db.flush()

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
        user_youth_2 = db.query(User).filter(User.email == "sarah.jenkins@example.com").first()
        if not user_youth_2:
            user_youth_2 = User(
                email="sarah.jenkins@example.com",
                password_hash=get_password_hash("Password123!"),
                role="youth",
            )
            db.add(user_youth_2)
            db.flush()

            lat, lon = geocode_uk_postcode("EC1A 1BB")
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            youth_profile_2 = YouthProfile(
                user_id=user_youth_2.id,
                full_name="Sarah Jenkins",
                preferred_location="Central London",
                postcode="EC1A 1BB",
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
                is_low_income_eligible=True,
                household_income_bracket="18k_25k",
                pupil_premium_recipient=False,
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

        # 4. Seed Businesses (Micro & Small Companies in Local Area)
        businesses_to_seed = [
            {
                "email": "business@example.com",
                "name": "Apex Tech Innovations",
                "organisation_type": "Technology",
                "contact_name": "David Clarke",
                "contact_email": "dave@apextech.co.uk",
                "description": "Innovative digital software agency creating modern web platforms. Keen to hire young developers with wage subsidy support.",
                "address": "14 High Street, Chesham",
                "postcode": "HP5 2UR",
                "company_size": "micro",
                "employee_count": 6,
                "annual_turnover_bracket": "100k_500k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "active_subsidised",
                "low_income_catchment_score": 85.0,
                "hourly_wage_gap": 4.44,
                "current_wage_offered": 7.00,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "techforward@example.com",
                "name": "London Youth Horizons",
                "organisation_type": "Charity & Community",
                "contact_name": "Elena Rostova",
                "contact_email": "elena@youthhorizons.org.uk",
                "description": "Non-profit organisation providing youth mentorship, creative workshops, and community events across the UK.",
                "address": "88 Farringdon Road, London",
                "postcode": "EC1A 1BB",
                "company_size": "small",
                "employee_count": 14,
                "annual_turnover_bracket": "500k_1m",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 82.0,
                "hourly_wage_gap": 4.00,
                "current_wage_offered": 7.50,
                "target_wage": 11.50,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "chilternbakery@example.com",
                "name": "Chiltern Hills Artisan Bakery & Café",
                "organisation_type": "Hospitality & Food",
                "contact_name": "Hannah Moore",
                "contact_email": "hannah@chilternbakery.co.uk",
                "description": "Independent high street bakery & café serving organic sourdough and pastries. Wants weekend student assistants but squeezed by living wage.",
                "address": "29 High Street, Chesham",
                "postcode": "HP5 1BW",
                "company_size": "micro",
                "employee_count": 5,
                "annual_turnover_bracket": "under_100k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 88.0,
                "hourly_wage_gap": 4.94,
                "current_wage_offered": 6.50,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "cheshambikes@example.com",
                "name": "Chesham Community Bike Works",
                "organisation_type": "Retail & Trade",
                "contact_name": "Marcus Vance",
                "contact_email": "marcus@cheshambikes.org.uk",
                "description": "Community bike repair shop offering cycling maintenance, upcycled bikes, and youth apprentice training.",
                "address": "3 Waterside, Chesham",
                "postcode": "HP5 1PE",
                "company_size": "micro",
                "employee_count": 3,
                "annual_turnover_bracket": "under_100k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "pledged",
                "low_income_catchment_score": 92.0,
                "hourly_wage_gap": 4.44,
                "current_wage_offered": 7.00,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "amershamgreentrades@example.com",
                "name": "Amersham Green Trades & Solar",
                "organisation_type": "Green Energy & Trades",
                "contact_name": "Simon Lee",
                "contact_email": "simon@amershamgreentrades.co.uk",
                "description": "Local domestic eco-retrofit, heat pump installation, and solar electrical repairs specialist offering green entry pathways.",
                "address": "45 Sycamore Road, Amersham",
                "postcode": "HP6 5EQ",
                "company_size": "small",
                "employee_count": 9,
                "annual_turnover_bracket": "500k_1m",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 70.0,
                "hourly_wage_gap": 3.50,
                "current_wage_offered": 8.00,
                "target_wage": 11.50,
                "youth_mentorship_commitment": True,
            },
        ]

        seeded_businesses = []
        for b_data in businesses_to_seed:
            user_b = db.query(User).filter(User.email == b_data["email"]).first()
            if not user_b:
                user_b = User(
                    email=b_data["email"],
                    password_hash=get_password_hash("Password123!"),
                    role="business",
                )
                db.add(user_b)
                db.flush()

                lat, lon = geocode_uk_postcode(b_data["postcode"])
                loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

                biz = Business(
                    user_id=user_b.id,
                    name=b_data["name"],
                    organisation_type=b_data["organisation_type"],
                    contact_name=b_data["contact_name"],
                    contact_email=b_data["contact_email"],
                    description=b_data["description"],
                    address=b_data["address"],
                    postcode=b_data["postcode"],
                    latitude=lat,
                    longitude=lon,
                    location_geom=loc_geom,
                    company_size=b_data["company_size"],
                    employee_count=b_data["employee_count"],
                    annual_turnover_bracket=b_data["annual_turnover_bracket"],
                    wage_subsidy_eligible=b_data["wage_subsidy_eligible"],
                    wage_subsidy_status=b_data["wage_subsidy_status"],
                    low_income_catchment_score=b_data["low_income_catchment_score"],
                    hourly_wage_gap=b_data["hourly_wage_gap"],
                    current_wage_offered=b_data["current_wage_offered"],
                    target_wage=b_data["target_wage"],
                    youth_mentorship_commitment=b_data["youth_mentorship_commitment"],
                )
                db.add(biz)
                db.flush()
                seeded_businesses.append(biz)
            else:
                seeded_businesses.append(user_b.business)

        biz_1 = seeded_businesses[0]
        biz_2 = seeded_businesses[1]
        biz_3 = seeded_businesses[2]
        biz_4 = seeded_businesses[3]

        # 5. Seed Councils
        councils_to_seed = [
            {
                "email": "council@example.com",
                "name": "Buckinghamshire Council",
                "council_type": "unitary",
                "region": "South East",
                "contact_name": "Rachel Vance (Youth Economic Strategy Lead)",
                "contact_email": "council@example.com",
                "contact_phone": "01296 395000",
                "postcode": "HP5 1AA",
                "total_budget_allocated": 100000.0,
                "total_budget_spent": 1728.0,
                "deprivation_focus_areas": ["HP5 1", "HP5 2", "HP6 5", "HP11 2"],
            },
            {
                "email": "camden@example.com",
                "name": "Camden London Borough Council",
                "council_type": "london_borough",
                "region": "London",
                "contact_name": "Tariq Mahmood (Social Mobility & Youth Enterprise)",
                "contact_email": "camden@example.com",
                "contact_phone": "020 7974 4444",
                "postcode": "NW1 2JR",
                "total_budget_allocated": 150000.0,
                "total_budget_spent": 0.0,
                "deprivation_focus_areas": ["NW1 1", "NW1 2", "EC1A 1"],
            },
        ]

        seeded_councils = []
        for c_data in councils_to_seed:
            user_c = db.query(User).filter(User.email == c_data["email"]).first()
            if not user_c:
                user_c = User(
                    email=c_data["email"],
                    password_hash=get_password_hash("Password123!"),
                    role="council",
                )
                db.add(user_c)
                db.flush()

                lat, lon = geocode_uk_postcode(c_data["postcode"])
                loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

                c = Council(
                    user_id=user_c.id,
                    name=c_data["name"],
                    council_type=c_data["council_type"],
                    region=c_data["region"],
                    contact_name=c_data["contact_name"],
                    contact_email=c_data["contact_email"],
                    contact_phone=c_data["contact_phone"],
                    postcode=c_data["postcode"],
                    latitude=lat,
                    longitude=lon,
                    location_geom=loc_geom,
                    deprivation_focus_areas=c_data["deprivation_focus_areas"],
                    total_budget_allocated=c_data["total_budget_allocated"],
                    total_budget_spent=c_data["total_budget_spent"],
                )
                db.add(c)
                db.flush()
                seeded_councils.append(c)
            else:
                seeded_councils.append(user_c.council)

        bucks_council = seeded_councils[0]

        # 6. Seed Wage Subsidy Schemes
        existing_schemes = db.query(WageSubsidyScheme).filter(WageSubsidyScheme.council_id == bucks_council.id).count()
        if existing_schemes == 0:
            scheme_1 = WageSubsidyScheme(
                council_id=bucks_council.id,
                title="Buckinghamshire Youth Social Mobility Wage Fund 2026",
                description="Council-backed hourly wage top-up for micro and small businesses in Chesham, Amersham, and High Wycombe hiring 16-24 year olds from low-income families at the Real Living Wage.",
                total_budget=75000.0,
                remaining_budget=73272.0,
                subsidy_rate_per_hour=4.50,
                max_hours_per_week_per_youth=16,
                max_duration_months=6,
                target_postcodes=["HP5", "HP6", "HP11", "HP12"],
                target_sectors=["Technology", "Hospitality & Food", "Retail & Trade", "Green Energy & Trades"],
                is_active=True,
                eligibility_criteria={
                    "max_company_size": "small",
                    "requires_youth_mentorship": True,
                    "target_deprivation_deciles": [1, 2, 3, 4],
                },
            )
            scheme_2 = WageSubsidyScheme(
                council_id=bucks_council.id,
                title="Chesham & Amersham High Street Youth Apprentice Bridge",
                description="Dedicated wage co-funding for independent high street businesses to take on local school-leavers and college students.",
                total_budget=25000.0,
                remaining_budget=25000.0,
                subsidy_rate_per_hour=4.00,
                max_hours_per_week_per_youth=12,
                max_duration_months=6,
                target_postcodes=["HP5 1", "HP5 2", "HP6 5"],
                target_sectors=["Retail & Trade", "Hospitality & Food"],
                is_active=True,
                eligibility_criteria={"max_company_size": "micro"},
            )
            db.add(scheme_1)
            db.add(scheme_2)
            db.flush()

            # 7. Seed Initial Wage Subsidy Allocation
            alloc_1 = WageSubsidyAllocation(
                scheme_id=scheme_1.id,
                council_id=bucks_council.id,
                business_id=biz_1.id,
                allocated_amount=1728.0,  # £4.50 * 16 hrs * 24 wks
                hourly_subsidy=4.50,
                max_hours_per_week=16,
                duration_weeks=24,
                status="active",
                notes="Subsidising Junior Web Developer role for local youth from HP5 low-income household.",
            )
            alloc_2 = WageSubsidyAllocation(
                scheme_id=scheme_1.id,
                council_id=bucks_council.id,
                business_id=biz_4.id,
                allocated_amount=1296.0,  # £4.50 * 12 hrs * 24 wks
                hourly_subsidy=4.50,
                max_hours_per_week=12,
                duration_weeks=24,
                status="pledged",
                notes="Pledged subsidy for youth bicycle maintenance apprentice.",
            )
            db.add(alloc_1)
            db.add(alloc_2)
            db.flush()

        # 8. Seed Opportunities
        existing_opps = db.query(Opportunity).count()
        if existing_opps == 0:
            opportunities_data = [
                {
                    "business_id": biz_1.id,
                    "title": "Weekend Junior Web Developer",
                    "opportunity_type": "part_time_job",
                    "description": "Join our friendly engineering team to build web components and client landing pages. Fully subsidized wage at the Real Living Wage through Buckinghamshire Council.",
                    "required_skills": ["Python", "Problem Solving"],
                    "preferred_skills": ["Teamwork", "HTML/CSS"],
                    "location_name": "Chesham, Buckinghamshire",
                    "postcode": "HP5 2UR",
                    "workplace_type": "hybrid",
                    "pay_info": "£11.44 / hour (Council Subsidised)",
                    "hours_or_commitment": "8-16 hours / week",
                    "deadline": utc_now() + timedelta(days=30),
                    "status": "published",
                    "wage_subsidy_applied": True,
                    "hourly_wage_subsidised": 4.50,
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
                    "business_id": biz_3.id,
                    "title": "Weekend Café & Customer Assistant",
                    "opportunity_type": "part_time_job",
                    "description": "Serve artisan coffee, assist with bakery display, and learn barista skills in a supportive, friendly local café. Subsidised wage for local youth.",
                    "required_skills": ["Customer Service", "Teamwork"],
                    "preferred_skills": ["Cash Handling"],
                    "location_name": "Chesham High Street",
                    "postcode": "HP5 1BW",
                    "workplace_type": "in_person",
                    "pay_info": "£11.44 / hour (Subsidy Eligible)",
                    "hours_or_commitment": "8-12 hours / week (Weekends)",
                    "deadline": utc_now() + timedelta(days=25),
                    "status": "published",
                },
                {
                    "business_id": biz_4.id,
                    "title": "Junior Bicycle Mechanic Trainee",
                    "opportunity_type": "part_time_job",
                    "description": "Learn cycle diagnostics, gear tuning, brake replacement, and workshop safety with an experienced master technician.",
                    "required_skills": ["Problem Solving", "Communication"],
                    "preferred_skills": ["Teamwork"],
                    "location_name": "Waterside, Chesham",
                    "postcode": "HP5 1PE",
                    "workplace_type": "in_person",
                    "pay_info": "£11.44 / hour (Pledged Council Subsidy)",
                    "hours_or_commitment": "12 hours / week",
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
                    wage_subsidy_applied=data.get("wage_subsidy_applied", False),
                    hourly_wage_subsidised=data.get("hourly_wage_subsidised"),
                )
                db.add(opp)
                created_opps.append(opp)

            db.flush()

            # 9. Seed Sample Application
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
        print("[SUCCESS] Database seeding completed successfully with Councils and Wage Subsidy records!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error during seeding: {e}")
        raise e
    finally:
        if close_session:
            db.close()


if __name__ == "__main__":
    seed_database()
