
import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, Integer, Float, Date, DateTime, ForeignKey, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    skin_type: Mapped[str | None] = mapped_column(String(20))
    sensitivities: Mapped[list] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    procedures: Mapped[list["Procedure"]] = relationship(back_populates="user", cascade="all, delete-orphan")


class Procedure(Base):
    __tablename__ = "procedures"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    procedure_date: Mapped[date] = mapped_column(Date, nullable=False)
    clinic_name: Mapped[str | None] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="procedures")
    checkins: Mapped[list["Checkin"]] = relationship(back_populates="procedure", cascade="all, delete-orphan")


class Checkin(Base):
    __tablename__ = "checkins"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    procedure_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("procedures.id", ondelete="CASCADE"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    checkin_date: Mapped[date] = mapped_column(Date, nullable=False)
    day_number: Mapped[int] = mapped_column(Integer, nullable=False)
    redness: Mapped[float] = mapped_column(Float, default=0)
    swelling: Mapped[float] = mapped_column(Float, default=0)
    flaking: Mapped[float] = mapped_column(Float, default=0)
    discomfort: Mapped[float] = mapped_column(Float, default=0)
    barrier_score: Mapped[float] = mapped_column(Float, default=0)
    risk_score: Mapped[float] = mapped_column(Float, default=0)
    healing_phase: Mapped[str] = mapped_column(String(20), default="inflammation")
    photo_url: Mapped[str | None] = mapped_column(Text)
    notes: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    procedure: Mapped["Procedure"] = relationship(back_populates="checkins")


class ScanResult(Base):
    __tablename__ = "scan_results"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    procedure_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("procedures.id", ondelete="CASCADE"))
    product_name: Mapped[str] = mapped_column(String(512))
    barcode: Mapped[str | None] = mapped_column(String(64))
    overall_status: Mapped[str] = mapped_column(String(10))
    flagged_ingredients: Mapped[list] = mapped_column(JSON, default=list)
    scanned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
