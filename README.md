[README.md](https://github.com/user-attachments/files/28746337/README.md)

# DermTrace 🌿

**AI-assisted post-procedure recovery platform for aesthetic treatment patients**

> _Not medical advice. Always consult a qualified healthcare professional._

---

## What is DermTrace?

DermTrace is a mobile application that guides patients through the **0–30 day healing window** after aesthetic treatments such as microneedling, laser resurfacing, and chemical peels.

It acts as a **procedural digital twin** — tracking recovery, scanning product ingredients for safety, and alerting users when their healing pattern looks unusual.

---

## MVP Features

| Feature | Status |
|---|---|
| Procedure onboarding | ✅ Implemented |
| Daily symptom check-in + photo | ✅ Implemented |
| Healing timeline (expected vs actual) | ✅ Implemented |
| Ingredient barcode scanner | ✅ Implemented |
| AI risk score + complication alerts | ✅ Implemented (mock) |
| User authentication (JWT) | ✅ Implemented |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile frontend | React Native + Expo + TypeScript |
| Backend API | FastAPI (Python 3.12) |
| Database | PostgreSQL 16 |
| Infrastructure | Docker + Docker Compose |
| AI/ML | Mock inference (MobileNetV3-ready) |

---

## Quick Start (5 minutes)

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- [Node.js 20+](https://nodejs.org/)
- [Expo Go](https://expo.dev/go) app on your phone (optional)

### 1 — Clone and start the backend

```bash
git clone https://github.com/YOUR_USERNAME/dermatrace.git
cd dermatrace

# Start backend + database
cd backend
cp .env.example .env
docker compose up --build
```

API will be live at **http://localhost:8000**
Interactive docs at **http://localhost:8000/docs**

### 2 — Start the frontend

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go on your phone, or press `i` for iOS simulator / `a` for Android.

### 3 — Load demo data

```bash
cd backend
docker compose exec api python scripts/seed_demo.py
```

Demo login: `demo@dermatrace.app` / `demo1234`

---

## Project Structure

```
dermatrace/
├── backend/              # FastAPI REST API
│   ├── app/
│   │   ├── main.py       # App entry point
│   │   ├── models/       # SQLAlchemy database models
│   │   ├── routers/      # API route handlers
│   │   ├── schemas/      # Pydantic request/response schemas
│   │   └── services/     # Business logic
│   ├── scripts/          # Demo data seeder
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
├── frontend/             # React Native + Expo app
│   ├── src/
│   │   ├── screens/      # All 8 app screens
│   │   ├── components/   # Reusable UI components
│   │   ├── navigation/   # Tab + stack navigation
│   │   ├── services/     # API client
│   │   ├── store/        # Zustand state management
│   │   └── theme/        # Design tokens
│   └── App.tsx
├── ai/                   # AI/ML inference service
│   └── mock_inference.py # Mock model for demo
├── docs/                 # Project documentation
└── scripts/              # Utility scripts
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, receive JWT |
| POST | `/procedures` | Create procedure |
| GET | `/procedures/active` | Get active procedure |
| POST | `/checkins` | Submit daily check-in |
| GET | `/timeline/{procedure_id}` | Get healing timeline |
| GET | `/risk/{procedure_id}` | Get current risk score |
| POST | `/scan` | Scan ingredient barcode |

Full documentation: **http://localhost:8000/docs** (when running)

---

## Demo Credentials

| Field | Value |
|---|---|
| Email | `demo@dermatrace.app` |
| Password | `demo1234` |
| Procedure | RF Microneedling (Day 5) |
| Risk level | Moderate (demo alert active) |

---

## Team

| Role | Responsibility |
|---|---|
| Product Manager | User research, wireframes, backlog |
| Business Lead | Market analysis, financials, positioning |
| Frontend Developer | React Native app, UI implementation |
| Backend Developer | FastAPI, PostgreSQL, Docker |
| AI/ML Developer | MobileNetV3 pipeline, inference API |

---

## Academic Context

This project was developed as part of a university startup and software engineering course. It demonstrates:

- Problem validation (10 patient interviews, 3 B2B clinic interviews)
- Solution validation (10 solution interviews, SUS score 82/100)
- Technical feasibility (working MVP across all 5 core features)
- Business viability (€6.22M Year 3 revenue projection, break-even Month 15)

---

> ⚠️ **Disclaimer:** DermTrace is not a medical device. All outputs are informational recovery guidance only. Not medical advice. Consult a qualified healthcare professional.
