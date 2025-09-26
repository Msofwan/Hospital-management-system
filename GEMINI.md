# Project Overview

This is a Hospital Management System with a web-based interface. The project is divided into three main parts:

*   **Backend:** A FastAPI application that provides a RESTful API for managing hospital data, including patients, appointments, staff, and more. It uses a PostgreSQL database and SQLAlchemy for data persistence.
*   **Internal Frontend:** A React application built with Vite and Material-UI. This is an internal-facing dashboard for hospital staff to manage the hospital's operations. It includes role-based access control to restrict access to certain functionalities.
*   **Public Frontend:** A Next.js application that serves as the public-facing website for the hospital. It provides information about the hospital, its doctors, and allows patients to book appointments.

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

## Technology Stack

| Component         | Technology                               | Purpose                                                 |
| ----------------- | ---------------------------------------- | ------------------------------------------------------- |
| **Backend**       | Python (FastAPI), Uvicorn                | Core business logic, API endpoints, data processing.    |
| **Database**      | PostgreSQL                               | Secure and reliable storage for all hospital data.      |
| **Public Frontend** | React (Next.js), Bootstrap CSS           | Fast, SEO-friendly, and responsive patient website.     |
| **Internal Frontend**| React, Material-UI (MUI)                 | Rich, data-heavy dashboard for internal hospital staff. |
| **Deployment**    | Docker (recommended)                     | Containerize each service for consistent environments.  |

## Building and Running

### Backend

To run the backend server, you need to have Python and the required packages installed.

1.  Install the required packages:
    ```bash
    pip install -r backend/requirements.txt
    ```
2.  Run the development server:
    ```bash
    uvicorn backend.main:app --reload
    ```

### Internal Frontend

To run the internal frontend, you need to have Node.js and npm (or yarn) installed.

1.  Install the required packages:
    ```bash
    cd internal-frontend
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```

### Public Frontend

To run the public frontend, you need to have Node.js and npm (or yarn) installed.

1.  Install the required packages:
    ```bash
    cd public-frontend
    npm install
    ```
2.  Run the development server:
    ```bash
    npm run dev
    ```

## Development Conventions

*   **Backend:** The backend follows the standard FastAPI project structure. It uses routers to separate different functionalities and SQLAlchemy models to define the database schema.
*   **Internal Frontend:** The internal frontend uses Material-UI for its components and has a role-based access control system. It uses JWT for authentication.
*   **Public Frontend:** The public frontend uses Bootstrap for styling and is built with Next.js.