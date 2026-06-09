
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime, date
import uuid


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    skin_type: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    token: str
    token_type: str = "bearer"
    user: UserResponse


# ── Procedures ────────────────────────────────────────────────────────────────

class ProcedureCreate(BaseModel):
    type: str
    date: date
    clinic_name: Optional[str] = None

class ProcedureResponse(BaseModel):
    id: uuid.UUID
    type: str
    procedure_date: date
    clinic_name: Optional[str]
    is_active: bool
    day_number: int
    total_days: int = 30
    phase: str
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Checkins ──────────────────────────────────────────────────────────────────

class CheckinCreate(BaseModel):
    procedure_id: uuid.UUID
    redness: float = Field(ge=0, le=10)
    swelling: float = Field(ge=0, le=10)
    flaking: float = Field(ge=0, le=10)
    discomfort: float = Field(ge=0, le=10)
    notes: Optional[str] = None

class CheckinResponse(BaseModel):
    id: uuid.UUID
    procedure_id: uuid.UUID
    checkin_date: date
    day_number: int
    redness: float
    swelling: float
    flaking: float
    discomfort: float
    barrier_score: float
    risk_score: float
    healing_phase: str
    photo_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Timeline ──────────────────────────────────────────────────────────────────

class TimelineDay(BaseModel):
    day: int
    expected_barrier: float
    actual_barrier: Optional[float]
    phase: str
    is_today: bool
    has_checkin: bool

class TimelineResponse(BaseModel):
    procedure_id: uuid.UUID
    current_day: int
    days: list[TimelineDay]


# ── Risk ──────────────────────────────────────────────────────────────────────

class RiskResponse(BaseModel):
    procedure_id: uuid.UUID
    risk_score: float
    level: str
    title: str
    description: str
    recommendation: str


# ── Scanner ───────────────────────────────────────────────────────────────────

class ScanRequest(BaseModel):
    procedure_id: uuid.UUID
    barcode: Optional[str] = None
    product_name: Optional[str] = None

class FlaggedIngredient(BaseModel):
    name: str
    status: str
    reason: str
    safe_from_day: Optional[int]

class ScanResponse(BaseModel):
    id: str
    product_name: str
    barcode: Optional[str]
    overall_status: str
    flagged_ingredients: list[FlaggedIngredient]
    scanned_at: datetime
    disclaimer: str = "Informational guidance only. Not medical advice."
