# MediAI Free Hosting & Live Deployment Guide

This guide provides step-by-step instructions to access your MediAI platform online immediately for free, as well as deploy it permanently to production using free cloud tiers (Vercel + Render / Railway).

---

## 🚀 Option 1: Instant Live Public URL (Zero-Configuration, Active Right Now)

Your local development server has been exposed to the public internet using a secure cloud tunnel. Anyone anywhere in the world (including your uncle, family, and testers on smartphones or laptops) can access it immediately:

- **Live Public URL:** `https://young-pianos-peel.loca.lt`
- **When Opening the Link for the First Time:**
  Localtunnel will display a simple friendly prompt asking for the **Tunnel Password / Public IP**. 
  - Simply enter your public IP (or click **"Click to Continue"**) on the screen to immediately access the application.
- **To Start/Restart Tunnel Anytime:**
  Open a terminal and run:
  ```bash
  npx -y localtunnel --port 3000
  ```

---

## 🌐 Option 2: 100% Free Permanent Cloud Hosting (Vercel + Render)

For a permanent `https://your-app.vercel.app` domain that never turns off, follow this 5-minute setup:

### Step 1: Deploy Frontend on Vercel (Free Forever)
1. Push your project to a GitHub repository:
   ```bash
   git add .
   git commit -m "MediAI production deployment"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) (free with GitHub).
3. Click **"Add New Project"** and select your `MediAi` repository.
4. Set **Root Directory** to `frontend`.
5. The included [frontend/vercel.json](file:///c:/Users/conta/OneDrive/Desktop/MediAi/frontend/vercel.json) will automatically configure Vite SPA routing and build scripts.
6. Click **Deploy**. In ~60 seconds, you have a live HTTPS URL (e.g., `https://mediai-health.vercel.app`).

### Step 2: Deploy Backend on Render (Free Forever)
1. Log in to [Render](https://render.com) (free with GitHub).
2. Click **"Blueprints"** -> **"New Blueprint Instance"**.
3. Select your GitHub repository.
4. Render will automatically read the included [render.yaml](file:///c:/Users/conta/OneDrive/Desktop/MediAi/render.yaml) file:
   - Sets up Python 3.11 with Daphne ASGI server (supporting WebSockets & REST APIs).
   - Runs database migrations (`python manage.py migrate`).
   - Collects static assets automatically.
5. Click **Apply**. Render will deploy your backend to `https://mediai-backend.onrender.com`.

---

## ⚡ Option 3: Containerized Docker Deployment

If you prefer self-hosting or deploying to a cloud VM (AWS EC2, DigitalOcean, Hetzner, Linode):

```bash
# In backend directory
docker build -t mediai-backend .
docker run -p 8000:8000 mediai-backend

# In frontend directory
docker build -t mediai-frontend .
docker run -p 3000:3000 mediai-frontend
```

---

## 🔑 Demo Accounts & Pre-Seeded Specialists

The platform includes pre-seeded verified clinical specialists, published medical content, and instant demo test accounts:

| Role | Email | Password | Features Accessible |
| :--- | :--- | :--- | :--- |
| **Patient (1-Click Demo)** | `patient@mediai.com` | `patient123` | Patient Dashboard, AI Triage, Encrypted Records Upload, Chat Media |
| **Doctor (1-Click Demo)** | `doctor@mediai.com` | `doctor123` | Doctor Dashboard, Consultations, Credential Verification, Direct Chat |
| **Admin (1-Click Demo)** | `admin@mediai.com` | `admin123` | Admin Audit Dashboard, Doctor Document Inspection & Approval |
| **Patient (Alternate)** | `david.miller@gmail.com` | `MediAi2026!` | AI Triage Assessment, Specialist Booking, Direct Chat & Media Upload |
| **Doctor / Specialist** | `sarah.chen@mediai.org` | `MediAi2026!` | Doctor Dashboard, Consultations, Creator Studio, Article Publishing |

---

## 📋 Architectural Highlights Included in this Release

1. **4-Tier Triage Engine (`EMERGENCY`, `URGENT`, `ROUTINE`, `SELF_CARE`)**:
   - Strict red-flag gating eliminates false 911 emergency alarms for postural, mechanical, and gastrointestinal back pain.
   - Positional sitting/standing locks and peptic ulcer flare-ups route to `URGENT` or `ROUTINE` with non-NSAID safety guidance (Paracetamol).
2. **Decluttered Production UI/UX**:
   - Clean neutral canvas (`#F8FAFC`), white cards, subtle borders, soft shadows, and status-only pill badges.
   - Consolidated **Clinical Analysis** card and unified **Recommended Next Steps** action flow.
3. **Full Media Chat Uploads**:
   - Direct file picker for Photos (`image/*`), Video recordings (`video/*`), and Medical PDFs/reports.
   - In-app thumbnail previews, HTML5 inline video players, and full-screen lightbox modal.
