
import asyncio
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from backend.db.base import Base
from backend.models import appointment, bed, dispensation, invoice, medicine, patient, permission, role, role_permission, staff

DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def verify_admin_permissions():
    db = SessionLocal()
    try:
        # Find the Admin role
        admin_role_query = text("SELECT id FROM role WHERE name = 'Admin'")
        admin_role_result = db.execute(admin_role_query).fetchone()
        if not admin_role_result:
            print("Admin role not found.")
            return
        admin_role_id = admin_role_result[0]

        # Find the delete_staff permission
        delete_staff_permission_query = text("SELECT id FROM permission WHERE name = 'delete_staff'")
        delete_staff_permission_result = db.execute(delete_staff_permission_query).fetchone()
        if not delete_staff_permission_result:
            print("delete_staff permission not found.")
            return
        delete_staff_permission_id = delete_staff_permission_result[0]

        # Check for the link in role_permission
        link_query = text(
            "SELECT 1 FROM role_permission WHERE role_id = :role_id AND permission_id = :permission_id"
        )
        link_result = db.execute(
            link_query,
            {"role_id": admin_role_id, "permission_id": delete_staff_permission_id},
        ).fetchone()

        if link_result:
            print("Admin role HAS the delete_staff permission.")
        else:
            print("Admin role does NOT have the delete_staff permission.")

    finally:
        db.close()

if __name__ == "__main__":
    Base.metadata.create_all(bind=engine)
    verify_admin_permissions()
