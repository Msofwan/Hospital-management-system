
import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend.models.role import Role
from backend.models.staff import Staff
from backend.security import get_password_hash

DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def create_admin_user():
    """
    Creates the default admin user if it doesn't exist.
    """
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(Staff).filter(Staff.email == "admin@example.com").first()
        if admin_user:
            print("Admin user already exists.")
            return

        # Get the Admin role
        admin_role = db.query(Role).filter(Role.name == "Admin").first()
        if not admin_role:
            print("Admin role not found. Please run create_samples.py first.")
            return

        # Create the admin user
        hashed_password = get_password_hash("admin")
        new_admin = Staff(
            first_name="Admin",
            last_name="User",
            email="admin@example.com",
            contact_number="0000000000",
            hashed_password=hashed_password,
            role_id=admin_role.id
        )
        db.add(new_admin)
        db.commit()
        print("Successfully created admin user.")
        print("Email: admin@example.com")
        print("Password: admin")

    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()
