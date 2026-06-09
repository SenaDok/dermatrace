
import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.models import User, Procedure, Checkin, ScanResult
from app.schemas import (
    RegisterRequest, LoginRequest, TokenResponse, UserResponse,
    ProcedureCreate, ProcedureResponse,
    CheckinCreate, CheckinResponse,
    TimelineResponse, TimelineDay,
    RiskResponse, ScanRequest, ScanResponse,
)
from app.services.auth import hash_password, verify_password, create_token, get_current_user
from app.services.scoring import compute_scores, get_expected_barrier, get_phase
from app.services.scanner import analyse, overall_status

# ── Auth ──────────────────────────────────────────────────────────────────────

auth_router = APIRouter(prefix="/auth", tags=["Auth"])


@auth_router.post("/register", response_model=TokenResponse, status_code=201)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered.")
    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    await db.flush()
    await db.refresh(user)
    return TokenResponse(token=create_token(user.id), user=UserResponse.model_validate(user))


@auth_router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials.")
    return TokenResponse(token=create_token(user.id), user=UserResponse.model_validate(user))


# ── Procedures ────────────────────────────────────────────────────────────────

procedures_router = APIRouter(prefix="/procedures", tags=["Procedures"])


def _enrich(proc: Procedure) -> dict:
    day = max(1, min((date.today() - proc.procedure_date).days + 1, 30))
    return {
        "id": proc.id, "type": proc.type, "procedure_date": proc.procedure_date,
        "clinic_name": proc.clinic_name, "is_active": proc.is_active,
        "day_number": day, "phase": get_phase(day), "total_days": 30,
        "created_at": proc.created_at,
    }


@procedures_router.post("", response_model=ProcedureResponse, status_code=201)
async def create_procedure(
    payload: ProcedureCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Deactivate existing active procedure
    result = await db.execute(
        select(Procedure).where(Procedure.user_id == current_user.id, Procedure.is_active == True)
    )
    for p in result.scalars().all():
        p.is_active = False

    proc = Procedure(
        user_id=current_user.id, type=payload.type,
        procedure_date=payload.date, clinic_name=payload.clinic_name,
    )
    db.add(proc)
    await db.flush()
    await db.refresh(proc)
    return ProcedureResponse.model_validate(_enrich(proc))


@procedures_router.get("/active", response_model=ProcedureResponse)
async def get_active(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Procedure).where(Procedure.user_id == current_user.id, Procedure.is_active == True)
    )
    proc = result.scalar_one_or_none()
    if not proc:
        raise HTTPException(status_code=404, detail="No active procedure.")
    return ProcedureResponse.model_validate(_enrich(proc))


# ── Checkins ──────────────────────────────────────────────────────────────────

checkins_router = APIRouter(prefix="/checkins", tags=["Checkins"])


@checkins_router.post("", response_model=CheckinResponse, status_code=201)
async def create_checkin(
    payload: CheckinCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Verify procedure ownership
    result = await db.execute(
        select(Procedure).where(Procedure.id == payload.procedure_id, Procedure.user_id == current_user.id)
    )
    proc = result.scalar_one_or_none()
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure not found.")

    today = date.today()
    day = max(1, min((today - proc.procedure_date).days + 1, 30))
    scores = compute_scores(day, payload.redness, payload.swelling, payload.flaking, payload.discomfort)

    checkin = Checkin(
        procedure_id=proc.id, user_id=current_user.id,
        checkin_date=today, day_number=day,
        redness=payload.redness, swelling=payload.swelling,
        flaking=payload.flaking, discomfort=payload.discomfort,
        barrier_score=scores.barrier_score, risk_score=scores.risk_score,
        healing_phase=scores.healing_phase, notes=payload.notes,
    )
    db.add(checkin)
    await db.flush()
    await db.refresh(checkin)
    return CheckinResponse.model_validate(checkin)


@checkins_router.post("/photo/{checkin_id}")
async def upload_photo(
    checkin_id: uuid.UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Accepts photo upload — stores as mock URL for MVP demo."""
    result = await db.execute(
        select(Checkin).where(Checkin.id == checkin_id, Checkin.user_id == current_user.id)
    )
    checkin = result.scalar_one_or_none()
    if not checkin:
        raise HTTPException(status_code=404, detail="Check-in not found.")

    # MVP: store filename, not actual file (avoids S3 setup for demo)
    checkin.photo_url = f"/static/photos/{checkin_id}_{file.filename}"
    await db.flush()
    return {"photo_url": checkin.photo_url, "message": "Photo uploaded successfully."}


@checkins_router.get("", response_model=list[CheckinResponse])
async def list_checkins(
    procedure_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Checkin)
        .where(Checkin.procedure_id == procedure_id, Checkin.user_id == current_user.id)
        .order_by(Checkin.day_number)
    )
    return [CheckinResponse.model_validate(c) for c in result.scalars().all()]


# ── Timeline ──────────────────────────────────────────────────────────────────

timeline_router = APIRouter(prefix="/timeline", tags=["Timeline"])


@timeline_router.get("/{procedure_id}", response_model=TimelineResponse)
async def get_timeline(
    procedure_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    proc_result = await db.execute(
        select(Procedure).where(Procedure.id == procedure_id, Procedure.user_id == current_user.id)
    )
    proc = proc_result.scalar_one_or_none()
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure not found.")

    checkin_result = await db.execute(
        select(Checkin).where(Checkin.procedure_id == proc.id)
    )
    by_day = {c.day_number: c for c in checkin_result.scalars().all()}
    current_day = max(1, min((date.today() - proc.procedure_date).days + 1, 30))

    days = [
        TimelineDay(
            day=d,
            expected_barrier=get_expected_barrier(d),
            actual_barrier=by_day[d].barrier_score if d in by_day else None,
            phase=get_phase(d),
            is_today=(d == current_day),
            has_checkin=(d in by_day),
        )
        for d in range(1, 31)
    ]
    return TimelineResponse(procedure_id=proc.id, current_day=current_day, days=days)


# ── Risk ──────────────────────────────────────────────────────────────────────

risk_router = APIRouter(prefix="/risk", tags=["Risk"])


@risk_router.get("/{procedure_id}", response_model=RiskResponse)
async def get_risk(
    procedure_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    proc_result = await db.execute(
        select(Procedure).where(Procedure.id == procedure_id, Procedure.user_id == current_user.id)
    )
    proc = proc_result.scalar_one_or_none()
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure not found.")

    # Get latest checkin risk score
    checkin_result = await db.execute(
        select(Checkin)
        .where(Checkin.procedure_id == proc.id)
        .order_by(Checkin.checkin_date.desc())
        .limit(1)
    )
    latest = checkin_result.scalar_one_or_none()
    risk_score = latest.risk_score if latest else 0.0

    if risk_score >= 85:
        level, title = "critical", "Seek medical attention today"
        description = "Multiple recovery indicators are significantly outside expected range."
        recommendation = "Contact your clinic or a healthcare professional today."
    elif risk_score >= 65:
        level, title = "high", "Unusual healing pattern detected"
        description = "Your recovery pattern falls outside the typical range for your procedure."
        recommendation = "Consider contacting your clinic. Monitor closely."
    elif risk_score >= 35:
        level, title = "moderate", "Recovery slightly below expected"
        description = "Some symptoms are slightly outside the expected window."
        recommendation = "Continue gentle aftercare. Log again tomorrow."
    else:
        level, title = "low", "Recovery on track"
        description = "Your healing pattern is within the normal range."
        recommendation = "Continue your current aftercare routine."

    return RiskResponse(
        procedure_id=proc.id, risk_score=risk_score, level=level,
        title=title, description=description, recommendation=recommendation,
    )


# ── Scanner ───────────────────────────────────────────────────────────────────

scanner_router = APIRouter(prefix="/scan", tags=["Scanner"])

# Mock product database for demo
DEMO_PRODUCTS = {
    "3337875597951": {
        "name": "La Roche-Posay Cicaplast Baume B5",
        "ingredients": ["Aqua", "Glycerin", "Panthenol", "Centella Asiatica", "Allantoin", "Ceramide NP"],
    },
    "3600522454595": {
        "name": "Skinceuticals C E Ferulic",
        "ingredients": ["Aqua", "L-Ascorbic Acid", "Ferulic Acid", "Tocopherol"],
    },
    "0070501027700": {
        "name": "CeraVe Moisturising Cream",
        "ingredients": ["Aqua", "Glycerin", "Ceramide NP", "Ceramide AP", "Hyaluronic Acid", "Petrolatum"],
    },
    "DEFAULT": {
        "name": "Unknown Product",
        "ingredients": ["Aqua", "Glycerin", "Fragrance", "Alcohol Denat"],
    },
}


def _mock_ingredients_from_name(name: str) -> list[str]:
    n = name.lower()
    if any(k in n for k in ["retinol", "vitamin a"]):
        return ["Aqua", "Retinol", "Glycerin", "Niacinamide"]
    if any(k in n for k in ["vitamin c", "ascorbic", "glow"]):
        return ["Aqua", "L-Ascorbic Acid", "Ferulic Acid"]
    if any(k in n for k in ["peel", "exfol"]):
        return ["Aqua", "Glycolic Acid", "Lactic Acid", "Panthenol"]
    if any(k in n for k in ["repair", "barrier", "heal"]):
        return ["Aqua", "Glycerin", "Ceramide NP", "Panthenol", "Centella Asiatica"]
    if any(k in n for k in ["spf", "sun"]):
        return ["Aqua", "Zinc Oxide", "Titanium Dioxide", "Glycerin"]
    return ["Aqua", "Glycerin", "Fragrance", "Alcohol Denat"]


@scanner_router.post("", response_model=ScanResponse)
async def scan_product(
    payload: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not payload.barcode and not payload.product_name:
        raise HTTPException(status_code=400, detail="Provide barcode or product_name.")

    # Get day number for context-aware analysis
    proc_result = await db.execute(
        select(Procedure).where(Procedure.id == payload.procedure_id, Procedure.user_id == current_user.id)
    )
    proc = proc_result.scalar_one_or_none()
    if not proc:
        raise HTTPException(status_code=404, detail="Procedure not found.")

    day = max(1, min((date.today() - proc.procedure_date).days + 1, 30))

    # Look up product
    if payload.barcode and payload.barcode in DEMO_PRODUCTS:
        product = DEMO_PRODUCTS[payload.barcode]
    elif payload.product_name:
        product = {"name": payload.product_name, "ingredients": _mock_ingredients_from_name(payload.product_name)}
    else:
        product = DEMO_PRODUCTS["DEFAULT"]

    flags = analyse(product["ingredients"], day)
    status = overall_status(flags)

    # Persist scan
    scan = ScanResult(
        user_id=current_user.id,
        procedure_id=proc.id,
        product_name=product["name"],
        barcode=payload.barcode,
        overall_status=status,
        flagged_ingredients=flags,
    )
    db.add(scan)
    await db.flush()

    return ScanResponse(
        id=str(scan.id),
        product_name=product["name"],
        barcode=payload.barcode,
        overall_status=status,
        flagged_ingredients=flags,
        scanned_at=datetime.now(timezone.utc),
    )
