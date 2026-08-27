export type UserRole = 'youth' | 'business';
export interface User {
    id: string;
    email: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
}
export type OpportunityType = 'part_time_job' | 'work_experience' | 'volunteering';
export type WorkplaceType = 'in_person' | 'hybrid' | 'remote';
export type OpportunityStatus = 'draft' | 'published' | 'closed';
export type ApplicationStatus = 'submitted' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted' | 'withdrawn';
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
    qualifications: {
        name: string;
        grade: string;
    }[];
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
