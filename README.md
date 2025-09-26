# Hospital Management System

This project is a comprehensive Hospital Management System (HMS) designed to streamline hospital operations and improve patient engagement. It is built with a modern, decoupled architecture consisting of a central backend API and two distinct frontend applications: one for patients and one for internal staff.

---

## Architecture Overview

The system is designed as a three-component, service-oriented architecture. This separation of concerns ensures the application is scalable, maintainable, and flexible for future development (e.g., adding a native mobile app).

```
+--------------------------+      +------------------------+      +--------------------------+
|                          |      |                        |      |                          |
|  Public Website          |      |      Backend API       |      |  Internal HMS Dashboard  |
|  (Next.js / React)       |----->|     (Python/FastAPI)   |----->|  (React / MUI)           |
|  (Patient-Facing)        |      |                        |      |  (Staff-Facing)          |
|                          |      |                        |      |                          |
+--------------------------+      +-----------+------------+      +--------------------------+
                                        |
                                        |
                                        v
                                +----------------+
                                |                |
                                |   Database     |
                                |  (PostgreSQL)  |
                                |                |
                                +----------------+
```

---

## Technology Stack

| Component         | Technology                               | Purpose                                                 |
| ----------------- | ---------------------------------------- | ------------------------------------------------------- |
| **Backend**       | Python (FastAPI), Uvicorn                | Core business logic, API endpoints, data processing.    |
| **Database**      | PostgreSQL                               | Secure and reliable storage for all hospital data.      |
| **Public Frontend** | React (Next.js), Bootstrap CSS           | Fast, SEO-friendly, and responsive patient website.     |
| **Internal Frontend**| React, Material-UI (MUI)                 | Rich, data-heavy dashboard for internal hospital staff. |
| **Deployment**    | Docker (recommended)                     | Containerize each service for consistent environments.  |

---

## Component Breakdown

### 1. Backend (`/backend`)

This is the central engine of the entire system. It handles all data, logic, and security.

*   **Implemented Models:** `Patient`, `Appointment`, `Bed`.
*   **API:** Exposes a secure RESTful API for the frontend applications to consume.
*   **To Run:**
    ```bash
    cd backend
    # Set up virtual environment
    python -m venv venv
    source venv/bin/activate
    # Install dependencies
    pip install -r requirements.txt
    # Run the server
    uvicorn main:app --reload
    ```

### 2. Public Frontend (`/public-frontend`)

The public-facing website for patients. It's focused on providing information and easy access to services like appointment booking.

*   **Core Features:** Homepage (scaffolded), Doctor Directory, Department Information, Appointment Booking, Contact/Location.
*   **To Run:**
    ```bash
    cd public-frontend
    # Install dependencies
    npm install
    # Run the development server
    npm run dev
    ```

### 3. Internal Frontend (`/internal-frontend`)

A secure and comprehensive dashboard for hospital staff to manage operations.

*   **Implemented Features:** `Patient Management (CRUD)`, `Appointment Management (CRUD)`, `Bed Management`.
*   **To Run:**
    ```bash
    cd internal-frontend
    # Install dependencies
    npm install
    # Run the development server
    npm run dev
    ```

---

## Getting Started

To run the full system locally, follow these steps.

### Prerequisites

*   **Node.js** (v18 or later)
*   **Python** (v3.9 or later)
*   **Docker** (for running PostgreSQL easily)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd hospital-management-system
    ```

2.  **Set up the Database:**
    *   The easiest way to run PostgreSQL is with Docker.
    ```bash
    # This command will start a PostgreSQL container
    docker run --name hms-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
    ```
    *   You will need a `.env` file in the `/backend` directory with the database connection string.

3.  **Configure and run the Backend API:**
    *   Navigate to `/backend`, create a virtual environment, install dependencies from `requirements.txt`, and start the server (see instructions above).

4.  **Configure and run the Frontend Applications:**
    *   For both `/public-frontend` and `/internal-frontend`, navigate into the directory, run `npm install` to install dependencies, and then run the development server.

5.  **Access the Applications:**
    *   **Backend API Docs:** `http://127.0.0.1:8000/docs`
    *   **Public Website:** `http://localhost:3000`
    *   **Internal HMS:** `http://localhost:3001` (or as configured)
