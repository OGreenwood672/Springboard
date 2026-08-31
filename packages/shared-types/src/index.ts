export type UserRole = "youth" | "business" | "council";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type OpportunityType =
  "part_time_job" | "work_experience" | "volunteering";
export type WorkplaceType = "in_person" | "hybrid" | "remote";
export type OpportunityStatus = "draft" | "published" | "closed";

export type ApplicationStatus =
  | "submitted"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "accepted"
  | "withdrawn";

export interface YouthAvailability {
  days: string[];
  hours_per_week?: number;
}

export interface YouthQualification {
  id?: string;
  qualification_id?: string | null;
  name: string;
  grade?: string;
  year_obtained?: number;
}

export interface YouthProfile {
  id: string;
  user_id: string;
  full_name: string;
  preferred_location?: string;
  postcode?: string;
  max_travel_km: number;
  latitude?: number | null;
  longitude?: number | null;
  skills: string[];
  interests: string[];
  availability?: YouthAvailability;
  education_stage?: string;
  bio?: string;
  preferred_opportunity_types: OpportunityType[];
  qualifications?: YouthQualification[];
  is_low_income_eligible?: boolean;
  household_income_bracket?: string;
  pupil_premium_recipient?: boolean;
  created_at: string;
  updated_at: string;
}

export type KnowledgeNodeStatus = "current" | "frontier";

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  kind: "skill" | "interest";
  status: KnowledgeNodeStatus;
  category: string;
  sectors: string[];
  demand: number;
  opportunity_count: number;
  reason: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relationship: "interest_alignment" | "related" | "used_together";
}

export interface KnowledgeFrontierExpansion {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
}

export interface SectorRecommendation {
  name: string;
  fit_score: number;
  matching_skills: string[];
  frontier_skills: string[];
  opportunity_count: number;
}

export interface KnowledgeOpportunity {
  id: string;
  title: string;
  business_name?: string | null;
  sector: string;
  workplace_type: string;
  location_name?: string | null;
  fit_score: number;
  matched_skills: string[];
  missing_skills: string[];
}

export interface KnowledgeGraph {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  sectors: SectorRecommendation[];
  opportunities: KnowledgeOpportunity[];
  stats: {
    current_skills: number;
    current_interests: number;
    frontier_skills: number;
    sectors_in_reach: number;
    roles_in_reach: number;
  };
}

export type CompanySize = "micro" | "small" | "medium" | "large";
export type BusinessSubsidyStatus =
  | "not_applied"
  | "eligible"
  | "pledged"
  | "approved"
  | "active_subsidised"
  | "ineligible";

export interface Business {
  id: string;
  user_id: string;
  name: string;
  organisation_type: string;
  contact_name: string;
  contact_email: string;
  description?: string;
  address?: string;
  postcode?: string;
  website?: string;
  latitude?: number | null;
  longitude?: number | null;
  company_size?: CompanySize;
  employee_count?: number;
  annual_turnover_bracket?: string;
  wage_subsidy_eligible?: boolean;
  wage_subsidy_status?: BusinessSubsidyStatus;
  low_income_catchment_score?: number;
  hourly_wage_gap?: number;
  current_wage_offered?: number;
  target_wage?: number;
  youth_mentorship_commitment?: boolean;
  active_subsidies_count?: number;
  opportunities_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Opportunity {
  id: string;
  business_id: string;
  business_name?: string;
  organisation_type?: string;
  title: string;
  opportunity_type: OpportunityType;
  description: string;
  required_skills: string[];
  preferred_skills: string[];
  location_name?: string;
  postcode?: string;
  latitude?: number | null;
  longitude?: number | null;
  workplace_type: WorkplaceType;
  pay_info?: string;
  hours_or_commitment?: string;
  deadline?: string | null;
  status: OpportunityStatus;
  applications_count?: number;
  wage_subsidy_applied?: boolean;
  hourly_wage_subsidised?: number;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  youth_profile_id: string;
  opportunity_id: string;
  status: ApplicationStatus;
  cover_note?: string;
  opportunity?: Opportunity;
  youth_profile?: YouthProfile;
  created_at: string;
  updated_at: string;
}

export interface MatchScoreFactors {
  type_score: number;
  skills_score: number;
  location_score: number;
  availability_score: number;
  qualification_score?: number;
  distance_km?: number | null;
  matched_skills?: string[];
  missing_skills?: string[];
}

export interface Match {
  id: string;
  youth_profile_id: string;
  opportunity_id: string;
  score: number;
  factors: MatchScoreFactors;
  opportunity?: Opportunity;
  youth_profile?: YouthProfile;
  created_at: string;
  updated_at: string;
}

export interface AICoachExtractedProfile {
  skills: string[];
  interests: string[];
  availability: YouthAvailability;
  education_stage: string;
  qualifications: { name: string; grade: string }[];
  preferred_opportunity_types: OpportunityType[];
}

export type ConversationRole = "system" | "user" | "assistant" | "tool";
export type ConversationMode = "youth" | "business" | "council";

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: ConversationRole;
  content: string;
  tool_name?: string | null;
  tool_payload?: Record<string, any> | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  mode: ConversationMode;
  title: string;
  messages?: ConversationMessage[];
  last_message?: string;
  created_at: string;
  updated_at: string;
}

export type PendingActionStatus =
  "pending" | "confirmed" | "cancelled" | "expired";

export interface PendingAction {
  id: string;
  conversation_id: string;
  user_id: string;
  action_type: string;
  payload: Record<string, any>;
  status: PendingActionStatus;
  expires_at: string;
  created_at: string;
  confirmed_at?: string | null;
}

export type UICardType =
  | "confirmation"
  | "opportunity_recommendation"
  | "candidate_match"
  | "profile_summary"
  | "opportunity_draft"
  | "subsidy_offer"
  | "subsidy_impact";

export interface ConfirmationCardData {
  action_id: string;
  action_type: string;
  title: string;
  summary: string;
  details: Record<string, any>;
  status?: PendingActionStatus;
}

export interface OpportunityRecommendationCardData {
  opportunity: Opportunity;
  match_score?: number;
  factors?: MatchScoreFactors;
  explanation_points?: string[];
}

export interface CandidateMatchCardData {
  youth_profile_id: string;
  opportunity_id: string;
  candidate_name: string;
  education_stage?: string;
  postcode_area?: string;
  distance_km?: number | null;
  match_score: number;
  factors: MatchScoreFactors;
  matched_skills: string[];
  explanation_points?: string[];
}

export interface ProfileSummaryCardData {
  full_name?: string;
  postcode?: string;
  max_travel_km?: number;
  skills: string[];
  interests: string[];
  availability?: YouthAvailability;
  education_stage?: string;
  preferred_opportunity_types?: OpportunityType[];
}

export interface OpportunityDraftCardData {
  draft: Partial<Opportunity>;
  missing_required_fields?: string[];
  is_publish_ready: boolean;
}

export interface UICard {
  id: string;
  card_type: UICardType;
  data:
    | ConfirmationCardData
    | OpportunityRecommendationCardData
    | CandidateMatchCardData
    | ProfileSummaryCardData
    | OpportunityDraftCardData
    | any;
}

export interface AgentChatRequest {
  message: string;
}

export interface AgentChatResponse {
  conversation_id: string;
  message: string;
  ui_cards: UICard[];
  pending_action?: PendingAction | null;
}

export interface ActionConfirmationResult {
  pending_action_id: string;
  status: PendingActionStatus;
  message: string;
  result_data?: Record<string, any>;
}

// -----------------------------------------------------------------------------
// Council & Wage Subsidy Types
// -----------------------------------------------------------------------------
export type CouncilType =
  "unitary" | "county" | "district" | "london_borough" | "metropolitan";

export interface Council {
  id: string;
  user_id: string;
  name: string;
  council_type: CouncilType;
  region?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  postcode?: string;
  latitude?: number | null;
  longitude?: number | null;
  deprivation_focus_areas?: string[];
  total_budget_allocated: number;
  total_budget_spent: number;
  active_schemes_count?: number;
  active_allocations_count?: number;
  created_at: string;
  updated_at: string;
}

export interface WageSubsidyScheme {
  id: string;
  council_id: string;
  title: string;
  description?: string;
  total_budget: number;
  remaining_budget: number;
  subsidy_rate_per_hour: number;
  max_hours_per_week_per_youth: number;
  max_duration_months: number;
  target_postcodes?: string[];
  target_sectors?: string[];
  is_active: boolean;
  eligibility_criteria?: Record<string, any>;
  council?: Council;
  allocations_count?: number;
  created_at: string;
  updated_at: string;
}

export type WageSubsidyAllocationStatus =
  "pledged" | "approved" | "active" | "completed" | "cancelled";

export interface WageSubsidyAllocation {
  id: string;
  scheme_id: string;
  council_id: string;
  business_id: string;
  opportunity_id?: string | null;
  youth_profile_id?: string | null;
  allocated_amount: number;
  hourly_subsidy: number;
  max_hours_per_week: number;
  duration_weeks: number;
  status: WageSubsidyAllocationStatus;
  notes?: string;
  business_name?: string;
  scheme_title?: string;
  business?: Business;
  scheme?: WageSubsidyScheme;
  opportunity?: Opportunity;
  youth_profile?: YouthProfile;
  created_at: string;
  updated_at: string;
}

export interface EligibleBusiness {
  id: string;
  name: string;
  organisation_type: string;
  address?: string;
  postcode?: string;
  latitude?: number | null;
  longitude?: number | null;
  company_size: CompanySize;
  employee_count: number;
  wage_subsidy_eligible: boolean;
  wage_subsidy_status: BusinessSubsidyStatus;
  low_income_catchment_score: number;
  hourly_wage_gap: number;
  current_wage_offered: number;
  target_wage: number;
  youth_mentorship_commitment: boolean;
  open_opportunities_count: number;
  contact_name: string;
  contact_email: string;
}

export interface CouncilMapMarker {
  id: string;
  business_id: string;
  name: string;
  organisation_type: string;
  address?: string;
  postcode?: string;
  latitude: number;
  longitude: number;
  company_size: CompanySize;
  employee_count: number;
  wage_subsidy_status: BusinessSubsidyStatus;
  hourly_wage_gap: number;
  current_wage_offered: number;
  target_wage: number;
  low_income_catchment_score: number;
  open_opportunities_count: number;
  youth_mentorship_commitment: boolean;
  contact_name: string;
  contact_email: string;
}

export interface DeprivationAreaBoundary {
  ward_name: string;
  postcode_prefix: string;
  deprivation_decile: number; // 1-10 (1 = highest deprivation/priority)
  youth_population_estimate: number;
  low_income_family_percentage: number;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
}

export interface CouncilMapData {
  council: Council;
  markers: CouncilMapMarker[];
  deprivation_areas: DeprivationAreaBoundary[];
  summary: {
    total_businesses_in_area: number;
    eligible_for_subsidy: number;
    active_subsidised: number;
    average_wage_gap: number;
    estimated_youth_reach: number;
  };
}

export interface CouncilAnalytics {
  total_budget_allocated: number;
  total_budget_spent: number;
  remaining_budget: number;
  total_subsidies_active: number;
  total_youth_supported_low_income: number;
  total_hours_subsidised: number;
  average_hourly_top_up: number;
  participating_businesses_count: number;
  retention_rate_percentage: number;
  social_mobility_roi_multiplier: number;
  monthly_trends: {
    month: string;
    youth_placed: number;
    funds_disbursed: number;
  }[];
  sector_breakdown: {
    sector: string;
    business_count: number;
    subsidies_allocated: number;
  }[];
}
