# Hospital Management System

Modern, end-to-end hospital management platform featuring a FastAPI backend, an internal operations dashboard, and a public-facing patient portal. Recent work expanded the domain model, implemented public-to-internal appointment workflows, enhanced accessibility, and introduced containerized deployment.

---

## System Architecture

```
+--------------------------+      +------------------------+      +--------------------------+
|  Public Website          | ---> |      Backend API       | ---> |  Internal HMS Dashboard  |
|  (Next.js, Bootstrap)    |      |  (FastAPI, SQLAlchemy) |      |  (React 19, MUI v7)      |
+--------------------------+      +-----------+------------+      +--------------------------+
                                       |
                                       v
                                 PostgreSQL 15
```

The public site captures appointment inquiries and patient portal access requests. The backend orchestrates scheduling, EMR, billing, pharmacy, admissions, and authentication workflows. The internal dashboard provides staff-facing management tools.

---

## Key Capabilities

### Backend (FastAPI / SQLAlchemy)
- Rich data model including patients, staff, roles & permissions, appointments, admissions, doctor schedules, prescriptions, lab results, medicines, dispensations, invoices, beds, and appointment requests.
- Appointment intake pipeline with status transitions, decision notes, conversion into scheduled appointments, and handler attribution.
- Patient portal authentication via short-lived JWT (email + date-of-birth verification).
- Public API endpoints for doctor directory, availability slot computation (21-day horizon), and appointment request submission with logging.
- Role-based access control with seeded permissions for Admin, Doctor, Nurse, and Pharmacist personas.
- Sample data population scripts (`create_samples.py`, `create_admin.py`).

### Internal Dashboard (React 19 + Vite + MUI v7)
- Shared Axios API client with JWT handling and TypeScript models.
- Operational modules: Patient Management (EMR viewer with visits, prescriptions, lab results, admissions), Appointment management, Bed management with occupancy tracking, Staff & Role administration, Pharmacy dispensing, Billing, Doctor schedules, and Appointment request triage.
- Dialog workflows for CRUD operations, visit documentation, prescription & lab result capture, admissions and discharge, plus appointment request approval/rejection.
- Accessibility improvements: skip-to-content link, `aria-current` navigation state, descriptive aria labels on action menus, keyboard-friendly modals, and consistent focus management.

### Public Website (Next.js 15 + Bootstrap 5)
- Pages for home, services, doctors, appointment booking, patient portal, and contact.
- Doctor directory with search, department filters, slot suggestions, and availability highlights.
- Appointment booking form that suggests provider slots and submits to the public API.
- Patient portal login form that issues tokens and previews upcoming appointments and invoices.
- Accessibility enhancements including skip links, proper nav state announcement, and semantic form labelling.

---

## Technology Stack

| Layer                 | Tech & Libraries                                                                 |
| --------------------- | -------------------------------------------------------------------------------- |
| Backend               | FastAPI, SQLAlchemy, PostgreSQL, Pydantic, python-jose, passlib, bcrypt          |
| Internal Dashboard    | React 19, Vite, TypeScript, MUI 7, Axios, date-fns                               |
| Public Website        | Next.js 15 (App Router), React 19, Bootstrap 5, Axios                           |
| DevOps                | Docker, Docker Compose, uvicorn, npm, pytest, ESLint                             |

---

## Running with Docker Compose

The backend and PostgreSQL database can be launched together using Docker Compose.

```bash
# From the repository root
docker compose build
docker compose up
```

Services:
- **db** – PostgreSQL 15 with persistent volume (`postgres-data`).
- **backend** – FastAPI application served via uvicorn, exposed on `http://localhost:8000`.

The backend reads `DATABASE_URL` from the environment (set automatically in `docker-compose.yml`).

---

## Local Development

### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate  # On Windows (use `source .venv/bin/activate` on macOS/Linux)
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:password@localhost:5432/postgres  # adjust as needed
uvicorn main:app --reload
# API docs: http://localhost:8000/docs
```

### Internal Dashboard (Vite)
```bash
cd internal-frontend
npm install
npm run dev  # default: http://localhost:5173
npm run lint
npm run build
```

### Public Website (Next.js)
```bash
cd public-frontend
npm install
npm run dev      # default: http://localhost:3000
npm run lint
npm run build && npm run start
```

Both frontends expect the backend API to be reachable at `http://localhost:8000` during development; adjust Axios base URLs if needed.

---

## Testing & Quality

- **Backend**: `python -m pytest` (current suite collects fixtures; expand with unit/integration tests as features grow).
- **Internal Dashboard**: `npm run lint`, `npm run build`.
- **Public Website**: `npm run lint`, `npm run build` (static generation).

---

## Accessibility Improvements

- Added keyboard-accessible skip links to both internal and public applications.
- Highlighted active navigation links with `aria-current` attributes and visual indicators.
- Provided explicit aria labels for action menus and icons (appointment, patient, staff, schedule tables).
- Ensured modals/forms include descriptive headings, labels, and consistent focus handling.
- Bootstrap/MUI components configured for semantic HTML structure and responsive layouts.

---

## Repository Structure

```
backend/               # FastAPI application, SQLAlchemy models, routers, auth, CRUD logic
internal-frontend/     # Staff dashboard (React + Vite + MUI)
public-frontend/       # Public Next.js site for patients
docker-compose.yml     # Backend + PostgreSQL stack
create_admin.py        # Helper script to bootstrap admin users
create_samples.py      # Data seeding utility
```

Use this document as the canonical reference for the current capabilities, frameworks, and operational workflows implemented during this phase of development.
