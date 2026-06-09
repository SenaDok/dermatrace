[README.md](https://github.com/user-attachments/files/28750121/README.md)

# DermTrace Backend

FastAPI + PostgreSQL REST API for the DermTrace recovery platform.

## Quick start

```bash
# Copy environment file
cp .env.example .env

# Start API + database
docker compose up --build

# Seed demo data
docker compose exec api python scripts/seed_demo.py
```

**API:** http://localhost:8000  
**Docs:** http://localhost:8000/docs

## Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Register user |
| POST | `/auth/login` | — | Login → JWT |
| POST | `/procedures` | ✓ | Create procedure |
| GET | `/procedures/active` | ✓ | Active procedure |
| POST | `/checkins` | ✓ | Submit check-in |
| GET | `/checkins` | ✓ | List check-ins |
| GET | `/timeline/{id}` | ✓ | Healing timeline |
| GET | `/risk/{id}` | ✓ | Risk score + alert |
| POST | `/scan` | ✓ | Ingredient scan |
| GET | `/health` | — | Health check |

## Project structure

```
backend/
├── app/
│   ├── main.py          # FastAPI app + middleware
│   ├── config.py        # Settings from .env
│   ├── database.py      # Async SQLAlchemy engine
│   ├── models/          # ORM models (4 tables)
│   ├── routers/         # Route handlers
│   ├── schemas/         # Pydantic schemas
│   └── services/        # Auth, scoring, scanner logic
├── scripts/
│   └── seed_demo.py     # Demo data seeder
├── Dockerfile
├── docker-compose.yml
└── requirements.txt
```

## Demo credentials

```
Email:    demo@dermatrace.app
Password: demo1234
```
