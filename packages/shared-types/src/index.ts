export type UserRole = "youth" | "business";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export type OpportunityType =
  | "part_time_job"
  | "work_experience"
  | "volunteering";
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
  created_at: string;
  updated_at: string;
}

export type KnowledgeNodeStatus = "current" | "frontier";

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  status: KnowledgeNodeStatus;
  sector: string;
  demand: number;
  opportunity_count: number;
  reason: string;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relationship: "related" | "used_together";
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
    frontier_skills: number;
    sectors_in_reach: number;
    roles_in_reach: number;
  };
}

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
  location: {
    postcode: string;
    max_travel_km: number;
  };
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
  profile?: YouthProfile | null;
  business?: Business | null;
}

// ==========================================
// Conversation & Agent Contracts
// ==========================================

export type ConversationMode = "youth" | "business";
export type MessageRole = "system" | "user" | "assistant" | "tool";

export type PendingActionType =
  | "update_youth_profile"
  | "update_business_profile"
  | "create_opportunity_draft"
  | "publish_opportunity"
  | "close_opportunity"
  | "submit_application";

export type PendingActionStatus = "pending" | "confirmed" | "cancelled" | "expired";

export interface PendingAction<T = any> {
  id: string;
  user_id: string;
  conversation_id: string;
  action_type: PendingActionType;
  payload: T;
  status: PendingActionStatus;
  expires_at: string;
  created_at: string;
  confirmed_at?: string | null;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  role: MessageRole;
  content: string;
  tool_name?: string | null;
  tool_payload?: Record<string, any> | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  mode: ConversationMode;
  title?: string | null;
  created_at: string;
  updated_at: string;
  messages?: ConversationMessage[];
  pending_actions?: PendingAction[];
}

export type UICardType =
  | "confirmation_card"
  | "opportunity_recommendation"
  | "candidate_match"
  | "profile_summary"
  | "opportunity_draft";

export interface ConfirmationCardData {
  pending_action_id: string;
  action_type: PendingActionType;
  title: string;
  description: string;
  diff_summary?: Record<string, any>;
  preview_data?: Record<string, any>;
  expires_at: string;
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
    | OpportunityDraftCardData;
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
