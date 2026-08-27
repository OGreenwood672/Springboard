import re
from typing import Dict, Any, List
from app.schemas.ai_coach import (
    AICoachExtractedProfile,
    AICoachAvailability,
    AICoachQualification,
    AICoachLocation,
)

# Reference taxonomy for pattern extraction
KNOWN_SKILLS = [
    "Python", "JavaScript", "TypeScript", "HTML/CSS", "Customer Service",
    "Communication", "Teamwork", "Problem Solving", "Social Media",
    "Retail", "Cash Handling", "Event Planning", "First Aid", "Graphic Design",
    "Writing", "Video Editing", "Administration", "Leadership"
]

KNOWN_INTERESTS = [
    "Technology", "Retail", "Charity", "Arts & Culture", "Environment",
    "Hospitality", "Healthcare", "Sports & Fitness", "Education", "Marketing"
]

DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]


def mock_extract_youth_profile(message: str) -> AICoachExtractedProfile:
    """
    Parse a user message and extract structured profile fields using deterministic heuristics.
    Simulates structured JSON generation from a future Gemini 2.0 / Flash API model.
    """
    text = message.lower()

    # 1. Extract Skills
    extracted_skills = []
    for skill in KNOWN_SKILLS:
        if skill.lower() in text:
            extracted_skills.append(skill)
    if not extracted_skills:
        extracted_skills = ["Customer Service", "Python"]

    # 2. Extract Interests
    extracted_interests = []
    for interest in KNOWN_INTERESTS:
        if interest.lower() in text:
            extracted_interests.append(interest)
    if not extracted_interests:
        extracted_interests = ["Technology", "Retail"]

    # 3. Extract Availability
    extracted_days = []
    for day in DAYS_OF_WEEK:
        if day.lower() in text:
            extracted_days.append(day)
    if "weekend" in text and not extracted_days:
        extracted_days = ["Saturday", "Sunday"]
    if not extracted_days:
        extracted_days = ["Saturday", "Sunday"]

    # Extract hours per week
    hours_match = re.search(r'(\d+)\s*(?:hours|hrs|hr)', text)
    hours_per_week = int(hours_match.group(1)) if hours_match else 8

    # 4. Extract Education Stage
    education_stage = "sixth_form"
    if "sixth form" in text or "sixth_form" in text or "a-level" in text or "a level" in text or "year 12" in text or "year 13" in text:
        education_stage = "sixth_form"
    elif "college" in text or "btec" in text or "t-level" in text or "t level" in text:
        education_stage = "college"
    elif "university" in text or "uni" in text or "undergraduate" in text:
        education_stage = "university"
    elif "secondary" in text or "gcse" in text or "year 10" in text or "year 11" in text:
        education_stage = "secondary"

    # 5. Extract Qualifications
    qualifications = []
    if "maths" in text or "mathematics" in text:
        grade_match = re.search(r'(?:maths|mathematics)[^\d]*(\d|a\*|a|b|c)', text)
        grade = grade_match.group(1).upper() if grade_match else "7"
        qualifications.append(AICoachQualification(name="GCSE Mathematics", grade=grade))
    if "english" in text:
        grade_match = re.search(r'(?:english)[^\d]*(\d|a\*|a|b|c)', text)
        grade = grade_match.group(1).upper() if grade_match else "6"
        qualifications.append(AICoachQualification(name="GCSE English Language", grade=grade))
    if "computer science" in text or "cs" in text or "computing" in text:
        qualifications.append(AICoachQualification(name="GCSE Computer Science", grade="8"))

    if not qualifications:
        qualifications = [AICoachQualification(name="GCSE Mathematics", grade="7")]

    # 6. Extract Preferred Opportunity Types
    preferred_types = []
    if "part time" in text or "part-time" in text or "job" in text:
        preferred_types.append("part_time_job")
    if "work experience" in text or "placement" in text or "intern" in text:
        preferred_types.append("work_experience")
    if "volunteer" in text or "volunteering" in text or "charity" in text:
        preferred_types.append("volunteering")

    if not preferred_types:
        preferred_types = ["part_time_job", "work_experience"]

    # 7. Extract Postcode and Distance
    postcode_match = re.search(r'\b([A-Z]{1,2}[0-9][A-Z0-9]?)\b', message.upper())
    postcode = postcode_match.group(1) if postcode_match else "HP5"

    dist_match = re.search(r'(\d+)\s*(?:km|kilometres|kilometers|miles)', text)
    max_travel_km = int(dist_match.group(1)) if dist_match else 15

    return AICoachExtractedProfile(
        skills=extracted_skills,
        interests=extracted_interests,
        availability=AICoachAvailability(
            days=extracted_days,
            hours_per_week=hours_per_week,
        ),
        education_stage=education_stage,
        qualifications=qualifications,
        preferred_opportunity_types=preferred_types,
        location=AICoachLocation(
            postcode=postcode,
            max_travel_km=max_travel_km,
        ),
    )
