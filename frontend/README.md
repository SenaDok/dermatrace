[README.md](https://github.com/user-attachments/files/28750342/README.md)

# DermTrace Frontend

React Native + Expo mobile application.

## Quick start

```bash
npm install
npx expo start
```

Then press:
- `i` — iOS simulator
- `a` — Android emulator  
- Scan QR code — Expo Go on your phone

## Screens

| Screen | Route | Description |
|--------|-------|-------------|
| Login | `Login` | Email + password auth |
| Register | `Register` | New account creation |
| Procedure Setup | `ProcedureSetup` | Select procedure type + date |
| Dashboard | `Dashboard` | Recovery score + daily actions |
| Daily Check-in | `Checkin` | Symptom sliders + submit |
| Timeline | `Timeline` | 30-day healing chart + phases |
| Scanner | `Scanner` | Ingredient barcode scanner |
| Alerts | `Alerts` | Risk score + recommendations |
| Profile | `Profile` | User info + sign out |

## Connecting to the backend

The app points to `http://localhost:8000` by default.  
To use a different URL, set `EXPO_PUBLIC_API_URL` in a `.env` file:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.100:8000
```

Use your machine's local IP (not `localhost`) when running on a real device.

## Project structure

```
frontend/
├── App.tsx              # Entry point
├── src/
│   ├── screens/         # All screens in one file
│   ├── navigation/      # Stack + tab navigators
│   ├── services/        # API client
│   ├── store/           # Zustand state
│   └── theme/           # Colors + spacing
├── app.json             # Expo config
└── package.json
```
