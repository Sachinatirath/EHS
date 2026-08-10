# FastAid — Digital First Aid Box Inspection System

Two apps that talk to each other:

- **`backend/`** — FastAPI + SQLite REST API (auth, boxes, inspections, refill requests, notifications, file uploads)
- **`mobile/`** — Expo React Native app (TypeScript), used by both roles:
  - **Area Incharge** — scans/selects a first aid box, runs the 12-point checklist, submits inspections
  - **OHC Team** — reviews refill requests, uploads refill evidence, and the Area Incharge re-verifies

Everything is real and functional end-to-end: real JWT login, a real SQLite database, real photo uploads — no mock data.

## Project layout

```
FastAid/
  backend/
    app/
      main.py            # FastAPI app, CORS, static file mount
      config.py           # Settings loaded from .env (pydantic-settings)
      models.py            # SQLAlchemy models
      schemas.py           # Pydantic request/response schemas
      security.py          # password hashing + JWT
      deps.py               # DB session / current-user / role-guard dependencies
      seed.py                # demo users + boxes, inserted on first run
      routers/                # auth, boxes, inspections, refills, notifications, dashboard, uploads
    .env.example
    requirements.txt
  mobile/
    App.tsx
    src/
      api/            # one axios client + one thin module per resource (auth, boxes, inspections, refills, notifications, dashboard, uploads)
      components/      # shared UI: Card, PrimaryButton, StatusBadge, Skeleton (shimmer), ChecklistItemRow, icons/Icon.tsx (all custom SVGs)
      context/          # AuthContext (login/logout/session persistence)
      navigation/         # role-based navigators (Area Incharge stack+tabs, OHC stack+tabs)
      screens/
        auth/               # Login
        areaIncharge/        # Home, Scan/Select, Box Details, Checklist, Submit Success, Refill Created, Re-Verification, My Inspections, Inspection Detail, Notifications
        ohc/                   # Dashboard, Refills list, Refill Detail, Notifications
        shared/                 # Profile, Notifications list (shared by both roles)
      theme/                  # colors, spacing, radius
    .env.example
```

## 1. Run the backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # defaults are fine for local dev

# --host 0.0.0.0 is required so your PHONE (not just this computer) can reach it
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

First run creates `backend/fastaid.db` (SQLite) and seeds demo accounts:

| Role          | Employee ID | Password    |
|---------------|-------------|-------------|
| Area Incharge | `AI001`     | `password123` |
| Area Incharge | `AI002`     | `password123` |
| OHC Team      | `OHC001`    | `password123` |

API docs (interactive): `http://<your-ip>:8000/docs`

## 2. Run the mobile app

This project needs **Node 20+**. If your system Node is older, install [nvm](https://github.com/nvm-sh/nvm) and run `nvm install 20 && nvm use 20` before the commands below (this repo's dev environment needed exactly this).

```bash
cd mobile
npm install
cp .env.example .env
```

Edit `mobile/.env` and set `EXPO_PUBLIC_API_URL` to **your computer's LAN IP** (not `localhost` — see the testing guide below for why and how to find it):

```
EXPO_PUBLIC_API_URL=http://192.168.1.141:8000
```

Then start the dev server:

```bash
npx expo start
```

This prints a QR code in the terminal — see **"How to test on your phone"** below.

## How to test on your phone (Expo Go)

Your phone and computer are two separate devices. To run the app on your phone during development, you use **Expo Go** — a free app that downloads and runs your JavaScript bundle live from your computer, no App Store / Play Store build required.

### Step by step

1. **Same Wi-Fi network.** Your phone and your computer must be on the same Wi-Fi network. (A phone hotspot works too — connect your computer to the phone's hotspot instead.)

2. **Install Expo Go** on your phone:
   - Android: [Expo Go on Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - iOS: [Expo Go on the App Store](https://apps.apple.com/app/expo-go/id982107779)

3. **Find your computer's LAN IP address:**
   - Linux/Mac: `hostname -I` (Linux) or `ipconfig getifaddr en0` (Mac)
   - Windows: `ipconfig` and look for "IPv4 Address"
   - It looks like `192.168.x.x` or `10.x.x.x`.

4. **Put that IP in `mobile/.env`** as shown above, e.g. `EXPO_PUBLIC_API_URL=http://192.168.1.141:8000`. This is needed because the app running on your *phone* can't reach your computer via `localhost` — that would mean "the phone itself."

5. **Start the backend with `--host 0.0.0.0`** (already shown above) so it accepts connections from other devices on the network, not just from your own computer.

6. **Start Expo:** `cd mobile && npx expo start`

7. **Scan the QR code** that appears in your terminal:
   - Android: open Expo Go → "Scan QR Code"
   - iOS: open your phone's Camera app and point it at the QR code, then tap the notification that appears

8. The app bundles (~10-20s the first time) and opens on your phone. Log in with `AI001` / `password123` (Area Incharge) or `OHC001` / `password123` (OHC Team).

### Testing both roles at once

Log in as `AI001` on your phone (Expo Go), and open a second Expo Go session — or the web/simulator — logged in as `OHC001`, to watch the full loop: submit a flagged inspection on one device → see the refill request appear on the OHC dashboard on the other → upload refill evidence → get the "OHC has completed refill" notification back on the Area Incharge session → accept/reject.

### Testing real QR scanning

The "Scan QR Code" option uses your phone's real camera to read QR codes. To test it, generate a QR code that encodes one of the seeded box numbers (`FAB-101`, `FAB-102`, `FAB-201`, `FAB-202`, `FAB-301`) — any free QR generator website works — and display it on a second screen for your phone to scan. Otherwise, use "Select Manually" to pick a box from the list, which works without any QR code at all.

### Common issues

| Symptom | Cause | Fix |
|---|---|---|
| App loads but login fails / spins forever | Phone can't reach the backend | Confirm phone and computer are on the same network; confirm `EXPO_PUBLIC_API_URL` in `mobile/.env` uses your LAN IP, not `localhost`; confirm the backend was started with `--host 0.0.0.0` |
| "Could not reach the server" toast | Same as above, or a firewall is blocking port 8000 | Temporarily disable the firewall or allow inbound TCP on port 8000 |
| QR scanner shows a black screen | Camera permission denied | Re-enable camera permission for Expo Go in your phone's system Settings |
| Changed `.env` but app still uses the old URL | Expo caches env vars per bundler process | Stop Expo (`Ctrl+C`) and restart `npx expo start` |
| `EBADENGINE` warnings or Metro crash on `npm install` / `expo start` | Node version too old (Expo SDK 57 needs Node ≥ 20.19) | Install Node 20 via nvm: `nvm install 20 && nvm use 20`, then reinstall (`rm -rf node_modules && npm install`) |

### Building a real installable app (later)

For a shareable build that doesn't need Expo Go (e.g. to hand to someone for UAT), use [EAS Build](https://docs.expo.dev/build/introduction/): `npx eas build --platform android --profile preview`. That's a separate step beyond local dev testing and requires a free Expo account.
