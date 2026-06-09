[demo_script.md](https://github.com/user-attachments/files/28750181/demo_script.md)

# DermTrace Demo Script
## Presentation / Video Recording Guide

**Total demo time: ~4 minutes**
**Demo login:** `demo@dermatrace.app` / `demo1234`

---

## Setup (before recording)

```bash
# 1. Start the backend
cd backend && docker compose up

# 2. Seed demo data
docker compose exec api python scripts/seed_demo.py

# 3. Start the frontend
cd ../frontend && npx expo start

# 4. Open on device or simulator
# Press 'i' for iOS simulator or scan QR code with Expo Go
```

Confirm at http://localhost:8000/docs that the API is responding.

---

## Scene 1 — Login (30 sec)

1. Show the DermTrace welcome screen
2. Tap **Log in**
3. Credentials are pre-filled (`demo@dermatrace.app` / `demo1234`)
4. Tap **Log in** → lands on Dashboard

**Say:** *"DermTrace greets the patient on their home screen with their current recovery status."*

---

## Scene 2 — Dashboard (45 sec)

1. Point to the **Recovery score ring** — shows barrier score
2. Point to the **Day counter** — "Day 5 of 30, RF Microneedling"
3. Point to **Today's actions** — check-in, scanner, timeline
4. Mention the alert bell in the top right

**Say:** *"The dashboard gives patients one glance to know how their healing is progressing."*

---

## Scene 3 — Daily Check-in (60 sec)

1. Tap **Daily check-in**
2. Show the symptom sliders — redness, swelling, flaking, discomfort
3. Adjust redness to 7, swelling to 6 (to trigger a moderate score)
4. Tap **Submit check-in**
5. Show the result screen — barrier score + status badge

**Say:** *"Patients log symptoms in under 60 seconds. The app calculates a barrier score and tells them if they're on track."*

---

## Scene 4 — Healing Timeline (45 sec)

1. Tap **Timeline** tab
2. Show the progress bar — Day 5 of 30, 17%
3. Point to the bar chart — grey bars are predicted, green are actual
4. Scroll to show the three healing phases
5. Highlight the active **Inflammation** phase badge

**Say:** *"The healing timeline shows expected vs actual recovery. Patients always know which phase they're in and what to expect next."*

---

## Scene 5 — Ingredient Scanner (45 sec)

1. Tap **Scanner** tab
2. Tap **SkinCeuticals C E Ferulic (avoid)** demo button
3. Show the red **Avoid at this stage** result banner
4. Scroll to show the flagged ingredient — L-Ascorbic Acid with explanation
5. Note "Safe to use from Day 21"
6. Tap back, then tap **La Roche-Posay Cicaplast (safe)**
7. Show the green **Safe for your stage** result

**Say:** *"The ingredient scanner is the most-valued feature from user testing. Patients scan any product and instantly know if it's safe for where they are in their recovery."*

---

## Scene 6 — Alerts (30 sec)

1. Tap **Alerts** tab (bell icon)
2. Show the moderate alert card — risk score, description, recommendation
3. Point to the disclaimer at the bottom

**Say:** *"If the recovery pattern looks unusual, DermTrace raises an alert with a plain-language recommendation. All outputs carry a non-medical-advice disclaimer — DermTrace is a recovery guidance tool, not a diagnostic device."*

---

## Scene 7 — API Docs (15 sec, optional)

1. Switch to browser, open `http://localhost:8000/docs`
2. Show the Swagger UI — all 7 endpoints visible
3. Expand POST /scan to show the request schema

**Say:** *"The full REST API is documented and ready for clinic integration."*

---

## Wrap-up talking points

- Problem: 9/10 patients feel anxious post-procedure, use unsafe products, overload clinics with panic calls
- Solution: 30-day guided recovery — timeline, scanner, alerts
- Validated: 10 patient interviews, 3 B2B clinic interviews, SUS score 82/100
- Business: B2C €12/month, B2B €299/month per clinic, break-even Month 15
- Stack: React Native + FastAPI + PostgreSQL + Docker — production-ready architecture
