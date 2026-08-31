import sqlite3
import os

db_path = "springboard.db"
if os.path.exists(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    def add_col_if_missing(table, col, col_type):
        cursor.execute(f"PRAGMA table_info({table})")
        cols = [info[1] for info in cursor.fetchall()]
        if col not in cols:
            print(f"Adding {col} to {table}...")
            cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")

    # 1. Update youth_profiles
    add_col_if_missing("youth_profiles", "is_low_income_eligible", "BOOLEAN NOT NULL DEFAULT 0")
    add_col_if_missing("youth_profiles", "household_income_bracket", "VARCHAR(50)")
    add_col_if_missing("youth_profiles", "pupil_premium_recipient", "BOOLEAN NOT NULL DEFAULT 0")

    # 2. Update businesses
    add_col_if_missing("businesses", "company_size", "VARCHAR(50) NOT NULL DEFAULT 'small'")
    add_col_if_missing("businesses", "employee_count", "INTEGER NOT NULL DEFAULT 8")
    add_col_if_missing("businesses", "annual_turnover_bracket", "VARCHAR(50) DEFAULT '100k_500k'")
    add_col_if_missing("businesses", "wage_subsidy_eligible", "BOOLEAN NOT NULL DEFAULT 1")
    add_col_if_missing("businesses", "wage_subsidy_status", "VARCHAR(50) NOT NULL DEFAULT 'eligible'")
    add_col_if_missing("businesses", "low_income_catchment_score", "FLOAT NOT NULL DEFAULT 75.0")
    add_col_if_missing("businesses", "hourly_wage_gap", "FLOAT NOT NULL DEFAULT 4.44")
    add_col_if_missing("businesses", "current_wage_offered", "FLOAT NOT NULL DEFAULT 7.00")
    add_col_if_missing("businesses", "target_wage", "FLOAT NOT NULL DEFAULT 11.44")
    add_col_if_missing("businesses", "youth_mentorship_commitment", "BOOLEAN NOT NULL DEFAULT 1")

    # 3. Update opportunities
    add_col_if_missing("opportunities", "wage_subsidy_applied", "BOOLEAN NOT NULL DEFAULT 0")
    add_col_if_missing("opportunities", "hourly_wage_subsidised", "FLOAT")

    conn.commit()
    conn.close()
    print("[MIGRATE] SQLite columns verified and updated!")

# 4. Run database creation and seed
from app.database import engine, Base, SessionLocal
from app.seed import seed_database

Base.metadata.create_all(bind=engine)
with SessionLocal() as db:
    seed_database(db=db)
print("[MIGRATE] Database successfully seeded with council and wage subsidy data!")

