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

            lat, lon = geocode_uk_postcode("HP11 1BB")
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            youth_profile_2 = YouthProfile(
                user_id=user_youth_2.id,
                full_name="Sarah Jenkins",
                preferred_location="High Wycombe, Buckinghamshire",
                postcode="HP11 1BB",
                max_travel_km=15,
                latitude=lat,
                longitude=lon,
                location_geom=loc_geom,
                skills=["Communication", "Event Planning", "Social Media", "First Aid"],
                interests=["Charity", "Arts & Culture", "Environment"],
                availability={"days": ["Wednesday", "Saturday"], "hours_per_week": 10},
                education_stage="college",
                bio="Dedicated college student in High Wycombe keen to support local community initiatives and creative events.",
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

        # 4. Seed Businesses (Micro & Small Companies in Buckinghamshire)
        businesses_to_seed = [
            {
                "email": "business@example.com",
                "name": "Apex Tech Innovations",
                "organisation_type": "Technology",
                "contact_name": "David Clarke",
                "contact_email": "dave@apextech.co.uk",
                "description": "Innovative digital software agency creating modern web platforms. Keen to hire young developers with wage subsidy support.",
                "address": "14 High Street, Chesham, Buckinghamshire",
                "postcode": "HP5 2UR",
                "latitude": 51.7040,
                "longitude": -0.6185,
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
                "name": "Buckinghamshire Youth Horizons & Community Trust",
                "organisation_type": "Charity & Community",
                "contact_name": "Elena Rostova",
                "contact_email": "elena@bucksyouthhorizons.org.uk",
                "description": "Non-profit charitable trust delivering youth empowerment workshops, community events, and mentoring across High Wycombe and south Buckinghamshire.",
                "address": "22 Queen Victoria Road, High Wycombe, Buckinghamshire",
                "postcode": "HP11 1BB",
                "latitude": 51.6265,
                "longitude": -0.7460,
                "company_size": "small",
                "employee_count": 14,
                "annual_turnover_bracket": "500k_1m",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 88.0,
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
                "address": "29 High Street, Chesham, Buckinghamshire",
                "postcode": "HP5 1BW",
                "latitude": 51.7075,
                "longitude": -0.6135,
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
                "description": "Community bike repair shop offering cycling maintenance, upcycled bikes, and youth apprentice training in the Chess Valley.",
                "address": "3 Waterside, Chesham, Buckinghamshire",
                "postcode": "HP5 1PE",
                "latitude": 51.6995,
                "longitude": -0.6075,
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
                "description": "Local domestic eco-retrofit, heat pump installation, and solar electrical repairs specialist offering green entry pathways across the Chilterns.",
                "address": "45 Sycamore Road, Amersham, Buckinghamshire",
                "postcode": "HP6 5EQ",
                "latitude": 51.6780,
                "longitude": -0.6095,
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
            {
                "email": "camdensound@example.com",
                "name": "Chiltern Sound & Creative Media Labs",
                "organisation_type": "Creative & Media",
                "contact_name": "Maya Lin",
                "contact_email": "maya@chilternsound.co.uk",
                "description": "Independent digital podcast studio, sound design suite, and youth creative media lab empowering young Buckinghamshire creators.",
                "address": "8 St Mary's Way, Chesham, Buckinghamshire",
                "postcode": "HP5 1HR",
                "latitude": 51.7055,
                "longitude": -0.6110,
                "company_size": "micro",
                "employee_count": 4,
                "annual_turnover_bracket": "100k_500k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 86.0,
                "hourly_wage_gap": 4.14,
                "current_wage_offered": 7.30,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "wycombejoinery@example.com",
                "name": "High Wycombe Precision Craft & Joinery",
                "organisation_type": "Manufacturing & Trades",
                "contact_name": "Arthur Pendelton",
                "contact_email": "arthur@wycombejoinery.co.uk",
                "description": "Heritage bespoke furniture and architectural woodwork workshop training youth in CAD joinery, lathe work, and timber restoration in High Wycombe.",
                "address": "8 Desborough Park Road, High Wycombe, Buckinghamshire",
                "postcode": "HP11 2HE",
                "latitude": 51.6295,
                "longitude": -0.7510,
                "company_size": "small",
                "employee_count": 11,
                "annual_turnover_bracket": "500k_1m",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 86.0,
                "hourly_wage_gap": 3.94,
                "current_wage_offered": 7.50,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "chilterncare@example.com",
                "name": "Chiltern Care & Wellbeing Hub",
                "organisation_type": "Healthcare & Social Care",
                "contact_name": "Denise Cooper",
                "contact_email": "denise@chilterncarehub.org.uk",
                "description": "Community care and day activity centre providing companion support and activities for elder residents across the Chess Valley.",
                "address": "52 Broad Street, Chesham, Buckinghamshire",
                "postcode": "HP5 1DH",
                "latitude": 51.7120,
                "longitude": -0.6105,
                "company_size": "small",
                "employee_count": 16,
                "annual_turnover_bracket": "500k_1m",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 90.0,
                "hourly_wage_gap": 3.44,
                "current_wage_offered": 8.00,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "holbornfarm@example.com",
                "name": "Aylesbury Vale Agri-Tech & Vertical Greens",
                "organisation_type": "Agriculture & Sustainability",
                "contact_name": "Liam Gallagher",
                "contact_email": "liam@aylesburyverticalgreens.co.uk",
                "description": "Modern controlled-environment vertical farm growing sustainable salad greens, micro-herbs, and offering agricultural STEM training across the Vale of Aylesbury.",
                "address": "14 Cambridge Street, Aylesbury, Buckinghamshire",
                "postcode": "HP20 1RS",
                "latitude": 51.8160,
                "longitude": -0.8090,
                "company_size": "micro",
                "employee_count": 5,
                "annual_turnover_bracket": "100k_500k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 84.0,
                "hourly_wage_gap": 4.20,
                "current_wage_offered": 7.30,
                "target_wage": 11.50,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "amershamstem@example.com",
                "name": "Amersham Robotics & STEM Academy",
                "organisation_type": "Technology & Education",
                "contact_name": "Dr. Keith Evans",
                "contact_email": "keith@amershamstem.co.uk",
                "description": "Educational robotics workshop and makerspace teaching local young people programming, CAD 3D-printing, and circuit design.",
                "address": "18 Hill Avenue, Amersham, Buckinghamshire",
                "postcode": "HP6 5BL",
                "latitude": 51.6745,
                "longitude": -0.6045,
                "company_size": "micro",
                "employee_count": 4,
                "annual_turnover_bracket": "100k_500k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 78.0,
                "hourly_wage_gap": 4.44,
                "current_wage_offered": 7.00,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "marlowdesign@example.com",
                "name": "Marlow Eco-Packaging & Design Studio",
                "organisation_type": "Creative & Design",
                "contact_name": "Oliver Sterling",
                "contact_email": "oliver@marlowdesign.co.uk",
                "description": "Sustainable industrial packaging design studio innovating bio-degradable cartons, eco-friendly consumer branding, and circular materials.",
                "address": "17 High Street, Marlow, Buckinghamshire",
                "postcode": "SL7 1AU",
                "latitude": 51.5710,
                "longitude": -0.7760,
                "company_size": "micro",
                "employee_count": 5,
                "annual_turnover_bracket": "100k_500k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 76.0,
                "hourly_wage_gap": 4.14,
                "current_wage_offered": 7.30,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "wendovertourism@example.com",
                "name": "Wendover Forest Eco-Tourism & Heritage Hub",
                "organisation_type": "Hospitality & Tourism",
                "contact_name": "Claire Thornton",
                "contact_email": "claire@wendoverhub.co.uk",
                "description": "Chilterns National Landscape visitor hub and eco-outdoor education center offering hospitality, park ranger, and trail guidance opportunities.",
                "address": "5 High Street, Wendover, Buckinghamshire",
                "postcode": "HP22 6DU",
                "latitude": 51.7635,
                "longitude": -0.7405,
                "company_size": "micro",
                "employee_count": 4,
                "annual_turnover_bracket": "100k_500k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 80.0,
                "hourly_wage_gap": 3.94,
                "current_wage_offered": 7.50,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "aylesburyrobotics@example.com",
                "name": "Aylesbury Precision Automation & Robotics",
                "organisation_type": "Manufacturing & Engineering",
                "contact_name": "Graham Fletcher",
                "contact_email": "graham@aylesburyrobotics.co.uk",
                "description": "Advanced mechatronics and industrial automation workshop delivering CNC programming and robotic assembly apprenticeships in Aylesbury.",
                "address": "6 Gatehouse Way, Aylesbury, Buckinghamshire",
                "postcode": "HP19 8DB",
                "latitude": 51.8240,
                "longitude": -0.8285,
                "company_size": "small",
                "employee_count": 12,
                "annual_turnover_bracket": "500k_1m",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 85.0,
                "hourly_wage_gap": 4.44,
                "current_wage_offered": 7.00,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
            {
                "email": "beaconsfieldcare@example.com",
                "name": "Chilterns Bio-Veterinary & Animal Care",
                "organisation_type": "Healthcare & Veterinary",
                "contact_name": "Dr. Fiona Campbell",
                "contact_email": "fiona@chilternsanimalcare.co.uk",
                "description": "Modern veterinary clinic, canine hydrotherapy suite, and animal wellbeing sanctuary providing vocational training in animal husbandry.",
                "address": "34 London End, Beaconsfield, Buckinghamshire",
                "postcode": "HP9 2JH",
                "latitude": 51.6025,
                "longitude": -0.6390,
                "company_size": "micro",
                "employee_count": 6,
                "annual_turnover_bracket": "100k_500k",
                "wage_subsidy_eligible": True,
                "wage_subsidy_status": "eligible",
                "low_income_catchment_score": 75.0,
                "hourly_wage_gap": 3.64,
                "current_wage_offered": 7.80,
                "target_wage": 11.44,
                "youth_mentorship_commitment": True,
            },
        ]

        seeded_businesses = []
        for b_data in businesses_to_seed:
            user_b = db.query(User).filter(User.email == b_data["email"]).first()
            lat = b_data.get("latitude")
            lon = b_data.get("longitude")
            if lat is None or lon is None:
                lat, lon = geocode_uk_postcode(b_data["postcode"])
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            if not user_b:
                user_b = User(
                    email=b_data["email"],
                    password_hash=get_password_hash("Password123!"),
                    role="business",
                )
                db.add(user_b)
                db.flush()

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
                biz = user_b.business
                if biz:
                    biz.name = b_data["name"]
                    biz.organisation_type = b_data["organisation_type"]
                    biz.contact_name = b_data["contact_name"]
                    biz.contact_email = b_data["contact_email"]
                    biz.description = b_data["description"]
                    biz.address = b_data["address"]
                    biz.postcode = b_data["postcode"]
                    biz.latitude = lat
                    biz.longitude = lon
                    biz.location_geom = loc_geom
                    biz.company_size = b_data["company_size"]
                    biz.employee_count = b_data["employee_count"]
                    biz.annual_turnover_bracket = b_data["annual_turnover_bracket"]
                    biz.wage_subsidy_eligible = b_data["wage_subsidy_eligible"]
                    biz.wage_subsidy_status = b_data["wage_subsidy_status"]
                    biz.low_income_catchment_score = b_data["low_income_catchment_score"]
                    biz.hourly_wage_gap = b_data["hourly_wage_gap"]
                    biz.current_wage_offered = b_data["current_wage_offered"]
                    biz.target_wage = b_data["target_wage"]
                    biz.youth_mentorship_commitment = b_data["youth_mentorship_commitment"]
                    db.flush()
                seeded_businesses.append(biz)

        biz_1 = seeded_businesses[0]
        biz_2 = seeded_businesses[1]
        biz_3 = seeded_businesses[2]
        biz_4 = seeded_businesses[3]
        biz_5 = seeded_businesses[4]
        biz_6 = seeded_businesses[5]
        biz_7 = seeded_businesses[6]
        biz_8 = seeded_businesses[7]
        biz_9 = seeded_businesses[8]
        biz_10 = seeded_businesses[9]
        biz_11 = seeded_businesses[10]
        biz_12 = seeded_businesses[11]
        biz_13 = seeded_businesses[12]
        biz_14 = seeded_businesses[13]

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
                "title": "Youth Community Outreach & Mentorship Assistant",
                "opportunity_type": "volunteering",
                "description": "Help organize vibrant youth empowerment workshops, assist with event registration, and support peer-to-peer mentoring across High Wycombe and south Buckinghamshire.",
                "required_skills": ["Communication", "Event Planning"],
                "preferred_skills": ["Social Media", "First Aid"],
                "location_name": "High Wycombe, Buckinghamshire",
                "postcode": "HP11 1BB",
                "workplace_type": "in_person",
                "pay_info": "Voluntary (Expenses covered)",
                "hours_or_commitment": "4-6 hours on event Saturdays",
                "deadline": utc_now() + timedelta(days=60),
                "status": "published",
            },
            {
                "business_id": biz_2.id,
                "title": "Creative Youth Workshop & Event Coordinator",
                "opportunity_type": "part_time_job",
                "description": "Coordinate weekly youth arts, digital media, and social mobility workshops for local teenagers in High Wycombe. Council co-funded living wage.",
                "required_skills": ["Communication", "Teamwork"],
                "preferred_skills": ["Event Planning"],
                "location_name": "High Wycombe, Buckinghamshire",
                "postcode": "HP11 1BB",
                "workplace_type": "in_person",
                "pay_info": "£11.50 / hour (Subsidy Eligible)",
                "hours_or_commitment": "8-12 hours / week",
                "deadline": utc_now() + timedelta(days=40),
                "status": "published",
            },
            {
                "business_id": biz_3.id,
                "title": "Weekend Café & Customer Assistant",
                "opportunity_type": "part_time_job",
                "description": "Serve artisan coffee, assist with bakery display, and learn barista skills in a supportive, friendly local café. Subsidised wage for local youth.",
                "required_skills": ["Customer Service", "Teamwork"],
                "preferred_skills": ["Cash Handling"],
                "location_name": "Chesham High Street, Buckinghamshire",
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
                "description": "Learn cycle diagnostics, gear tuning, brake replacement, and workshop safety with an experienced master technician in the Chess Valley.",
                "required_skills": ["Problem Solving", "Communication"],
                "preferred_skills": ["Teamwork"],
                "location_name": "Waterside, Chesham, Buckinghamshire",
                "postcode": "HP5 1PE",
                "workplace_type": "in_person",
                "pay_info": "£11.44 / hour (Pledged Council Subsidy)",
                "hours_or_commitment": "12 hours / week",
                "deadline": utc_now() + timedelta(days=40),
                "status": "published",
            },
            {
                "business_id": biz_5.id,
                "title": "Solar Energy & Heat Pump Retrofit Trainee",
                "opportunity_type": "apprenticeship",
                "description": "Kickstart your green trade career shadowing qualified electrical engineers on domestic solar PV installations and air-source heat pump retrofits across Chiltern district.",
                "required_skills": ["Problem Solving", "Teamwork"],
                "preferred_skills": ["First Aid", "Communication"],
                "location_name": "Amersham & Chilterns, Buckinghamshire",
                "postcode": "HP6 5EQ",
                "workplace_type": "in_person",
                "pay_info": "£11.50 / hour (Council Green Subsidy)",
                "hours_or_commitment": "16 hours / week",
                "deadline": utc_now() + timedelta(days=35),
                "status": "published",
            },
            {
                "business_id": biz_6.id,
                "title": "Digital Audio Mixing & Podcast Production Assistant",
                "opportunity_type": "part_time_job",
                "description": "Manage recording studio sessions, assist with DAW audio mixing, set up microphones, and edit weekly creative youth podcasts in Chesham.",
                "required_skills": ["Communication", "Social Media"],
                "preferred_skills": ["Problem Solving"],
                "location_name": "Chesham, Buckinghamshire",
                "postcode": "HP5 1HR",
                "workplace_type": "in_person",
                "pay_info": "£11.44 / hour (Subsidy Eligible)",
                "hours_or_commitment": "12-16 hours / week",
                "deadline": utc_now() + timedelta(days=45),
                "status": "published",
            },
            {
                "business_id": biz_7.id,
                "title": "Apprentice Architectural Joiner & CAD Assistant",
                "opportunity_type": "apprenticeship",
                "description": "Learn fine woodworking, timber joinery, bespoke furniture craft, and computerized CAD drafting in High Wycombe's historic furniture quarter.",
                "required_skills": ["Problem Solving", "Teamwork"],
                "preferred_skills": ["Mathematics"],
                "location_name": "High Wycombe, Buckinghamshire",
                "postcode": "HP11 2HE",
                "workplace_type": "in_person",
                "pay_info": "£11.44 / hour (Subsidy Eligible)",
                "hours_or_commitment": "16 hours / week",
                "deadline": utc_now() + timedelta(days=30),
                "status": "published",
            },
            {
                "business_id": biz_8.id,
                "title": "Trainee Wellbeing & Activities Companion",
                "opportunity_type": "part_time_job",
                "description": "Support community wellbeing sessions, organize arts and crafts, and provide friendship and companion care to elder citizens in Chesham.",
                "required_skills": ["Communication", "Customer Service"],
                "preferred_skills": ["First Aid"],
                "location_name": "Chesham Broad Street, Buckinghamshire",
                "postcode": "HP5 1DH",
                "workplace_type": "in_person",
                "pay_info": "£11.44 / hour (Council Co-Funded)",
                "hours_or_commitment": "12 hours / week",
                "deadline": utc_now() + timedelta(days=50),
                "status": "published",
            },
            {
                "business_id": biz_9.id,
                "title": "Hydroponic Cultivation & Vertical Farm Trainee",
                "opportunity_type": "part_time_job",
                "description": "Work in our vertical indoor hydroponic farm in Aylesbury monitoring nutrient water balances, harvesting microgreens, and managing eco-friendly delivery logistics.",
                "required_skills": ["Teamwork", "Problem Solving"],
                "preferred_skills": ["Customer Service"],
                "location_name": "Aylesbury, Buckinghamshire",
                "postcode": "HP20 1RS",
                "workplace_type": "in_person",
                "pay_info": "£11.50 / hour (Subsidy Eligible)",
                "hours_or_commitment": "10-14 hours / week",
                "deadline": utc_now() + timedelta(days=30),
                "status": "published",
            },
            {
                "business_id": biz_10.id,
                "title": "STEM Coding & Robotics Workshop Mentor",
                "opportunity_type": "part_time_job",
                "description": "Guide local 8-14 year olds through beginner Python coding, 3D printing, and Lego robotics challenges in our Amersham makerspace.",
                "required_skills": ["Python", "Communication"],
                "preferred_skills": ["Problem Solving"],
                "location_name": "Amersham Hill Avenue, Buckinghamshire",
                "postcode": "HP6 5BL",
                "workplace_type": "in_person",
                "pay_info": "£11.44 / hour (Subsidy Eligible)",
                "hours_or_commitment": "8-12 hours / weekend",
                "deadline": utc_now() + timedelta(days=28),
                "status": "published",
            },
            {
                "business_id": biz_11.id,
                "title": "Junior Sustainable Packaging Designer",
                "opportunity_type": "apprenticeship",
                "description": "Collaborate with senior packaging designers on CAD die-line prototypes, sustainable cardboard origami, and eco-branding for FMCG clients in Marlow.",
                "required_skills": ["Problem Solving", "Customer Service"],
                "preferred_skills": ["Teamwork"],
                "location_name": "Marlow High Street, Buckinghamshire",
                "postcode": "SL7 1AU",
                "workplace_type": "hybrid",
                "pay_info": "£11.44 / hour (Council Co-Funded)",
                "hours_or_commitment": "16 hours / week",
                "deadline": utc_now() + timedelta(days=32),
                "status": "published",
            },
            {
                "business_id": biz_12.id,
                "title": "Eco-Tourism Experience Host & Trail Guide",
                "opportunity_type": "part_time_job",
                "description": "Welcome visitors to Wendover Forest, assist with guided biodiversity walking tours, host visitor center exhibitions, and support outdoor youth education.",
                "required_skills": ["Communication", "Customer Service"],
                "preferred_skills": ["First Aid"],
                "location_name": "Wendover, Buckinghamshire",
                "postcode": "HP22 6DU",
                "workplace_type": "in_person",
                "pay_info": "£11.44 / hour (Subsidy Eligible)",
                "hours_or_commitment": "10-14 hours / week",
                "deadline": utc_now() + timedelta(days=36),
                "status": "published",
            },
            {
                "business_id": biz_13.id,
                "title": "Junior Mechatronics & CNC Assembly Apprentice",
                "opportunity_type": "apprenticeship",
                "description": "Learn precision CNC calibration, industrial wiring loom assembly, and automated pick-and-place robotics programming in Aylesbury's industrial park.",
                "required_skills": ["Problem Solving", "Teamwork"],
                "preferred_skills": ["Mathematics"],
                "location_name": "Gatehouse, Aylesbury, Buckinghamshire",
                "postcode": "HP19 8DB",
                "workplace_type": "in_person",
                "pay_info": "£11.50 / hour (Council Subsidised)",
                "hours_or_commitment": "16 hours / week",
                "deadline": utc_now() + timedelta(days=24),
                "status": "published",
            },
            {
                "business_id": biz_14.id,
                "title": "Trainee Animal Wellbeing & Care Companion",
                "opportunity_type": "part_time_job",
                "description": "Assist clinical veterinary nurses with animal husbandry, dog hydrotherapy rehabilitation sessions, and client welcoming in our Beaconsfield sanctuary.",
                "required_skills": ["Communication", "Teamwork"],
                "preferred_skills": ["Customer Service"],
                "location_name": "Beaconsfield Old Town, Buckinghamshire",
                "postcode": "HP9 2JH",
                "workplace_type": "in_person",
                "pay_info": "£11.44 / hour (Council Co-Funded)",
                "hours_or_commitment": "12 hours / week",
                "deadline": utc_now() + timedelta(days=42),
                "status": "published",
            },
        ]

        created_opps = []
        for data in opportunities_data:
            lat, lon = geocode_uk_postcode(data["postcode"])
            loc_geom = create_point_geom(lat, lon, is_postgres=is_postgres)

            opp = db.query(Opportunity).filter(
                Opportunity.business_id == data["business_id"],
                Opportunity.title == data["title"],
            ).first()

            if not opp:
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
            else:
                opp.description = data["description"]
                opp.location_name = data["location_name"]
                opp.postcode = data["postcode"]
                opp.latitude = lat
                opp.longitude = lon
                opp.location_geom = loc_geom
                opp.pay_info = data["pay_info"]
                opp.hours_or_commitment = data["hours_or_commitment"]
                opp.status = data["status"]
            created_opps.append(opp)

        db.flush()

        # 9. Seed Sample Application
        youth_1_profile = user_youth_1.youth_profile
        if youth_1_profile and len(created_opps) > 0:
            existing_app = db.query(Application).filter(
                Application.youth_profile_id == youth_1_profile.id,
                Application.opportunity_id == created_opps[0].id
            ).first()
            if not existing_app:
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
