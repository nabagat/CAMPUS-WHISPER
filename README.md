# CampusVoice — Privacy-Focused Anonymous Campus Feedback & Discussion Platform

![CampusVoice Platform](https://img.shields.io/badge/Architecture-Full--Stack%20MERN-emerald?style=for-the-badge)
![AI-Assisted](https://img.shields.io/badge/AI-Gemini%203.8%20Flash-indigo?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-By--Design-teal?style=for-the-badge)
![Tests](https://img.shields.io/badge/Tests-10%2F10%20Passing-brightgreen?style=for-the-badge)

**CampusVoice** is a production-quality full-stack MERN application that gives university students a safe, constructive, and anonymous channel to discuss and report campus issues — including academic policies, faculty concerns, hostel amenities, mess food quality, and infrastructure deficiencies — without fear of academic or social retaliation.

---

## 🌟 Core Philosophy: Ethical Privacy by Design

Unlike superficial anonymous apps that make misleading claims of "100% untraceable cryptographic immunity," CampusVoice adopts **transparent, ethical privacy-by-design**:
- **Identity Severance:** Authentication credentials (`email`, `password`) are strictly isolated from the content domain.
- **Unselected Database Fields:** The author link on posts is stored with `select: false` — it is never transmitted to the public feed, nor exposed to campus moderators.
- **Dynamic Pseudonyms:** Authors are represented by rotating, friendly aliases (e.g. *"Courageous Owl #42"*) with deterministic SVG identicons.
- **No Voter Profiling:** Upvotes and downvotes use salted HMAC tokens (`HMAC(userId + targetId, salt)`) ensuring unique votes without tracking student reading habits.
- **Minimal Server Telemetry:** Server loggers strip IP addresses, cookies, and query strings.
- **Zero PII to AI:** Student names and roll numbers are sanitized before content is screened by Google Gemini AI.

---

## 🚀 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Plus Jakarta Sans, React Router v6, TanStack Query v5, Lucide Icons |
| **Backend** | Node.js, Express.js, Helmet, Express-Rate-Limit, Sanitize-HTML, Zod |
| **Database** | Inbuilt Firebase/Firestore Persistent Document Storage Engine (`server/data/firebase_db.json`) |
| **AI Engine** | Google Gemini 3.8 Flash (`@google/genai` SDK) with robust local NLP fallback |
| **Deployment** | Vercel Serverless Ready (`vercel.json`), GitHub Actions compatible |
| **Testing** | Node.js Native Test Runner (`node --test`), Supertest (10/10 Passing) |

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login)

The platform comes pre-seeded with realistic campus discussions, threaded comments, and demo accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Student** | `student@campus.edu` | `Password123!` | Create posts, comment anonymously, upvote, report |
| **Moderator** | `moderator@campus.edu` | `Password123!` | Review pending queue, resolve user reports, audit log |
| **Admin** | `admin@campus.edu` | `Password123!` | Campus pulse analytics, user management, system metrics |

> **Evaluator Tip:** Use the **Role Switcher** in the top navigation bar to seamlessly toggle between roles with a single click.

---

## 📁 Repository Structure

```
CAMPUS VOICE/
├── client/                     # Frontend (React + Vite + Tailwind)
│   ├── src/
│   │   ├── components/         # Reusable UI, PostCard, VoteButtons, Badges
│   │   ├── context/            # AuthContext with demo role switching
│   │   ├── pages/              # Landing, Feed, Details, Create, Mod, Admin, etc.
│   │   ├── services/           # Centralized API client
│   │   └── App.jsx             # React Router routing
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/             # Database (Atlas + in-memory fallback), AI client, ENV
│   │   ├── controllers/        # Auth, Post, Comment, Vote, Report, Mod, Admin, Analytics
│   │   ├── middleware/         # Auth, RBAC, RateLimiter, SanitizeInputs, PrivacyLogger
│   │   ├── models/             # User, Post, Comment, Vote, Report, AuditLog, IssueCluster
│   │   ├── routes/             # Express API routes
│   │   ├── services/           # Gemini AI moderation, NLP fallback, Pseudonym generator
│   │   ├── utils/              # Database seed script
│   │   ├── app.js              # Express app setup
│   │   └── server.js           # Server launcher
│   ├── tests/                  # Automated integration tests
│   ├── package.json
│   └── .env.example
├── docs/                       # Comprehensive Architecture Docs
│   ├── SCHEMA.md               # Complete MongoDB schema & index reference
│   ├── API.md                  # REST API endpoints & request/response formats
│   └── THREAT_MODEL.md         # Security & privacy threat analysis
├── .env.example                # Root environment template
├── package.json                # Orchestration scripts (concurrently dev, seed, test)
└── README.md                   # Project overview & documentation
```

---

## ⚡ Quickstart & Local Setup

### Prerequisites
- Node.js **v18+** (tested on Node v24)
- npm **v9+**

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Install server and client dependencies
cd server && npm install
cd ../client && npm install
cd ..
```

### Step 2: Configure Environment (Optional)
A `.env.example` is provided in both root and `server/`.
If you leave `MONGODB_URI` blank, the server **automatically boots an embedded in-memory MongoDB instance** and seeds realistic campus data!

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=
JWT_SECRET=campus_voice_secure_jwt_secret_dev_2026
GEMINI_API_KEY=
```

### Step 3: Run the Application
You can run both client and server concurrently from the root:
```bash
# Starts both Backend (port 5000) and Frontend (port 5173)
npm run dev
```

Or run them individually in separate terminals:
```bash
# Terminal 1: Backend
cd server && npm run dev

# Terminal 2: Frontend
cd client && npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🧪 Running the Test Suite

The automated integration test suite tests authentication, privacy-by-design field isolation, AI pre-checks, voting, and role-based access control:

```bash
cd server
npm test
```

**Test Results:**
```
✔ GET /api/health - Returns 200 and system status
✔ POST /api/auth/login - Allows valid student login
✔ POST /api/auth/login - Rejects invalid credentials
✔ POST /api/posts/precheck - Provides AI pre-moderation and tagging preview
✔ POST /api/posts - Creates anonymous post and NEVER exposes author identity in public response
✔ GET /api/posts - Lists public posts with category and status filter
✔ POST /api/votes - Casts upvote on a post and recalculates score
✔ POST /api/reports - Submits user report on post
✔ RBAC - Moderator can access pending queue, normal student cannot
✔ GET /api/analytics/pulse - Returns public campus transparency pulse and sentiment

ℹ tests 10 | pass 10 | fail 0
```

---

## 🤖 AI Moderation Pipeline (Gemini 3.8 Flash)

CampusVoice integrates Google's latest **Gemini 3.8 Flash** model via the official `@google/genai` SDK:

```
[Student Submits Post]
         │
         ▼
[PII Sanitization Layer] ──> Redacts emails, phone numbers, roll numbers
         │
         ▼
[Gemini 3.8 Flash Screening] ──> Toxicity, Harassment, Spam, Threat scoring
         │
         ├── Low Risk (< 0.35) ───> Instant Public Publish ("Active")
         ├── Medium Risk (0.35-0.75) ─> Sent to Moderator Review Queue ("Under Review")
         └── High Risk (> 0.75) ──> Held / Quarantined ("Rejected")
```

**Resilient Fallback:** If `GEMINI_API_KEY` is not provided, the platform automatically activates an embedded rule-based NLP classifier, ensuring 100% offline functionality.

---

## 📑 Required Pages

1. **Landing Page (`/`):** Hero banner, live campus stats, privacy pillars, 1-click evaluator login.
2. **Campus Feed (`/feed`):** Category filters, sorting (Trending, Latest, Top Voted, Discussed, Resolved), serious issue filter.
3. **Post Details (`/post/:id`):** Full discussion, pseudonymous author badge, OP badges, threaded comments.
4. **Create Post (`/create`):** Rich editor, category selector, real-time AI Pre-Check preview, pseudonym preview.
5. **Categories Overview (`/categories`):** Visual directory of all 8 campus discussion hubs with activity counts.
6. **Search & Filter (`/search`):** Multi-faceted search by keyword, category, tag, and status.
7. **Privacy & Anonymity Center (`/privacy`):** In-depth transparency report, threat model explanation, technical boundaries.
8. **Community Guidelines (`/guidelines`):** Conduct code, prohibited behaviors, appeal procedures.
9. **Report Issue (`/report-issue`):** High-severity grievance channel with emergency campus phone hotlines.
10. **Moderator Dashboard (`/moderator`):** Pending moderation queue with AI risk scores, user reports, and audit logs.
11. **Admin Dashboard (`/admin`):** Campus pulse telemetry, AI aggregated concerns, recurring issue clusters, user account management.
12. **Authentication (`/login`, `/register`):** Domain validation and test credential shortcuts.

---

## 🛡️ Security & Privacy Architecture

See [`docs/THREAT_MODEL.md`](file:///c:/Users/nabag/OneDrive/Desktop/CAMPUS%20WHISPER/docs/THREAT_MODEL.md) for full threat analysis.
- **XSS Mitigation:** `sanitize-html` deep cleans all string inputs.
- **NoSQL Injection Shield:** Keys prefixed with `$` are recursively stripped.
- **Brute Force Protection:** Tiered `express-rate-limit` limits login attempts and post creation bursts.
- **Security Headers:** `helmet` sets HTTP protections against clickjacking and MIME-sniffing.
- **RBAC:** Strict middleware gating ensures students cannot access moderator or admin endpoints.

---

## 📜 License

MIT License. Designed for university communities and student advocacy.
