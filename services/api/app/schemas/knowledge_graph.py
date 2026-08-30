from typing import Literal
from uuid import UUID

from pydantic import BaseModel


class KnowledgeGraphNode(BaseModel):
    id: str
    label: str
    kind: Literal["skill", "interest"]
    status: Literal["current", "frontier"]
    category: str
    sectors: list[str]
    demand: int
    opportunity_count: int
    reason: str


class KnowledgeGraphEdge(BaseModel):
    source: str
    target: str
    relationship: Literal["interest_alignment", "related", "used_together"]


class SectorRecommendation(BaseModel):
    name: str
    fit_score: int
    matching_skills: list[str]
    frontier_skills: list[str]
    opportunity_count: int


class KnowledgeOpportunity(BaseModel):
    id: UUID
    title: str
    business_name: str | None = None
    sector: str
    workplace_type: str
    location_name: str | None = None
    fit_score: int
    matched_skills: list[str]
    missing_skills: list[str]


class KnowledgeGraphStats(BaseModel):
    current_skills: int
    current_interests: int
    frontier_skills: int
    sectors_in_reach: int
    roles_in_reach: int


class KnowledgeGraphOut(BaseModel):
    nodes: list[KnowledgeGraphNode]
    edges: list[KnowledgeGraphEdge]
    sectors: list[SectorRecommendation]
    opportunities: list[KnowledgeOpportunity]
    stats: KnowledgeGraphStats


class KnowledgeFrontierExpansionRequest(BaseModel):
    node_id: str
    label: str
    kind: Literal["skill", "interest"]


class KnowledgeFrontierExpansionOut(BaseModel):
    nodes: list[KnowledgeGraphNode]
    edges: list[KnowledgeGraphEdge]
