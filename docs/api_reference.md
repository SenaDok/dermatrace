[api_reference.md](https://github.com/user-attachments/files/28750175/api_reference.md)

# DermTrace API Reference

Base URL: `http://localhost:8000`
Interactive docs: `http://localhost:8000/docs`

All protected endpoints require:
```
Authorization: Bearer <token>
```

---

## Auth

### POST /auth/register
```json
// Request
{ "email": "user@example.com", "password": "mypassword" }

// Response 201
{
  "token": "eyJ...",
  "token_type": "bearer",
  "user": { "id": "uuid", "email": "user@example.com", "created_at": "..." }
}
```

### POST /auth/login
```json
// Request
{ "email": "user@example.com", "password": "mypassword" }

// Response 200 — same as register
```

---

## Procedures

### POST /procedures
```json
// Request
{ "type": "rf_microneedling", "date": "2026-06-01", "clinic_name": "Skin & Glow" }

// Response 201
{
  "id": "uuid", "type": "rf_microneedling",
  "procedure_date": "2026-06-01", "day_number": 5,
  "phase": "inflammation", "is_active": true
}
```

### GET /procedures/active
Returns the currently active procedure with `day_number` and `phase`.

---

## Check-ins

### POST /checkins
```json
// Request
{
  "procedure_id": "uuid",
  "redness": 6.0, "swelling": 4.0, "flaking": 3.0, "discomfort": 3.0
}

// Response 201
{
  "id": "uuid", "day_number": 5,
  "barrier_score": 68.5, "risk_score": 22.4,
  "healing_phase": "inflammation"
}
```

### POST /checkins/photo/{checkin_id}
Multipart form upload. Field: `file` (JPEG/PNG).

### GET /checkins?procedure_id={id}
Returns all check-ins for a procedure, ordered by day.

---

## Timeline

### GET /timeline/{procedure_id}
```json
// Response
{
  "procedure_id": "uuid",
  "current_day": 5,
  "days": [
    { "day": 1, "expected_barrier": 45.0, "actual_barrier": 48.2, "phase": "inflammation", "is_today": false, "has_checkin": true },
    { "day": 2, "expected_barrier": 48.0, "actual_barrier": 51.0, ... },
    ...
  ]
}
```

---

## Risk Score

### GET /risk/{procedure_id}
```json
// Response
{
  "procedure_id": "uuid",
  "risk_score": 38.5,
  "level": "moderate",
  "title": "Recovery slightly below expected",
  "description": "Some symptoms are slightly outside the expected window.",
  "recommendation": "Continue gentle aftercare. Log again tomorrow."
}
```

Risk levels: `low` (0–34) · `moderate` (35–64) · `high` (65–84) · `critical` (85–100)

---

## Ingredient Scanner

### POST /scan
```json
// Request — by barcode
{ "procedure_id": "uuid", "barcode": "3337875597951" }

// Request — by name
{ "procedure_id": "uuid", "product_name": "Skinceuticals C E Ferulic" }

// Response
{
  "id": "uuid",
  "product_name": "La Roche-Posay Cicaplast Baume B5",
  "overall_status": "safe",
  "flagged_ingredients": [],
  "scanned_at": "2026-06-06T10:00:00Z",
  "disclaimer": "Informational guidance only. Not medical advice."
}
```

Overall status values: `safe` · `caution` · `avoid`

---

## Health Check

### GET /health
```json
{ "status": "ok", "service": "dermatrace-api", "version": "1.0.0" }
```
