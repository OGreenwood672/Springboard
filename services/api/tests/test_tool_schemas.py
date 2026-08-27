import pytest
from pydantic import ValidationError
from app.agents.schemas import (
    YouthProfilePatchSchema,
    BusinessProfilePatchSchema,
    OpportunityDraftExtractionSchema,
    OpportunitySearchFiltersSchema,
)


def test_youth_profile_patch_schema_valid():
    patch = YouthProfilePatchSchema(
        full_name="Alex Taylor",
        postcode="hp5 2ur",
        max_travel_km=15,
        skills=["Python", "Customer Service"],
        education_stage="sixth_form",
        availability={"days": ["Saturday", "Sunday"], "hours_per_week": 8},
    )
    assert patch.postcode == "HP5 2UR"
    assert patch.max_travel_km == 15
    assert len(patch.skills) == 2


def test_youth_profile_patch_schema_invalid_travel():
    with pytest.raises(ValidationError):
        YouthProfilePatchSchema(max_travel_km=150)  # Max allowed is 100


def test_opportunity_draft_extraction_schema():
    draft = OpportunityDraftExtractionSchema(
        title="Weekend Café Assistant",
        opportunity_type="part_time_job",
        description="Friendly customer-facing weekend assistant needed.",
        required_skills=["Customer Service"],
        postcode="HP5 2UR",
        workplace_type="in_person",
        pay_info="£11.50 / hour",
    )
    assert draft.title == "Weekend Café Assistant"
    assert draft.opportunity_type == "part_time_job"
    assert draft.postcode == "HP5 2UR"


def test_opportunity_draft_schema_invalid_type():
    with pytest.raises(ValidationError):
        OpportunityDraftExtractionSchema(
            title="Invalid",
            opportunity_type="full_time_unsupported",
            description="Short desc",
        )

