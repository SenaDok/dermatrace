
"""
Demo data seeder — run this to populate the database for presentation.

Usage:
    docker compose exec api python scripts/seed_demo.py
"""
import asyncio
import sys
import os
from datetime import date, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import AsyncSessionLocal
from app.models import User, Procedure, Checkin
from app.services.auth import hash_password
from app.services.scoring import compute_scores


DEMO_EMAIL    = "demo@dermatrace.app"
DEMO_PASSWORD = "demo1234"

# Demo scenario: RF Microneedling, 5 days ago, recovering normally with a moderate alert on day 4
PROCEDURE_DATE = date.today() - timedelta(days=4)

DEMO_CHECKINS = [
    # day, redness, swelling, flaking, discomfort
    (1, 7.0, 6.0, 1.0, 5.0),
    (2, 6.0, 5.0, 2.0, 4.0),
    (3, 5.5, 5.5, 3.0, 3.5),  # slight spike — creates moderate alert
    (4, 5.0, 4.0, 4.0, 3.0),
]


async def seed():
    async with AsyncSessionLocal() as db:
        # Check if demo user already exists
        from sqlalchemy import select
        existing = await db.execute(select(User).where(User.email == DEMO_EMAIL))
        user = existing.scalar_one_or_none()

        if not user:
            user = User(
                email=DEMO_EMAIL,
                hashed_password=hash_password(DEMO_PASSWORD),
                skin_type="III-IV",
                sensitivities=["None"],
            )
            db.add(user)
            await db.flush()
            await db.refresh(user)
            print(f"✓ Created demo user: {DEMO_EMAIL}")
        else:
            print(f"✓ Demo user already exists: {DEMO_EMAIL}")

        # Check if active procedure exists
        proc_existing = await db.execute(
            select(Procedure).where(Procedure.user_id == user.id, Procedure.is_active == True)
        )
        proc = proc_existing.scalar_one_or_none()

        if not proc:
            proc = Procedure(
                user_id=user.id,
                type="rf_microneedling",
                procedure_date=PROCEDURE_DATE,
                clinic_name="Skin & Glow München",
                is_active=True,
            )
            db.add(proc)
            await db.flush()
            await db.refresh(proc)
            print(f"✓ Created procedure: RF Microneedling on {PROCEDURE_DATE}")
        else:
            print(f"✓ Active procedure already exists")

        # Seed checkins
        for (day, redness, swelling, flaking, discomfort) in DEMO_CHECKINS:
            existing_checkin = await db.execute(
                select(Checkin).where(
                    Checkin.procedure_id == proc.id,
                    Checkin.day_number == day,
                )
            )
            if existing_checkin.scalar_one_or_none():
                print(f"  ↳ Day {day} checkin already exists, skipping")
                continue

            scores = compute_scores(day, redness, swelling, flaking, discomfort)
            checkin = Checkin(
                procedure_id=proc.id,
                user_id=user.id,
                checkin_date=PROCEDURE_DATE + timedelta(days=day - 1),
                day_number=day,
                redness=redness,
                swelling=swelling,
                flaking=flaking,
                discomfort=discomfort,
                barrier_score=scores.barrier_score,
                risk_score=scores.risk_score,
                healing_phase=scores.healing_phase,
            )
            db.add(checkin)
            print(f"  ✓ Day {day} — barrier: {scores.barrier_score}, risk: {scores.risk_score} ({scores.healing_phase})")

        await db.commit()
        print("\n✅ Demo data seeded successfully!")
        print(f"\n   Login: {DEMO_EMAIL} / {DEMO_PASSWORD}")
        print(f"   API docs: http://localhost:8000/docs")


if __name__ == "__main__":
    asyncio.run(seed())
