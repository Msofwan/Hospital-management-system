import asyncio
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.db.base import Base
from backend.models.role import Role
from backend.models.permission import Permission
from backend.models.role_permission import RolePermission

DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost/postgres"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Define all permissions used in the application
PERMISSIONS = [
    "create_staff", "read_staff", "update_staff", "delete_staff",
    "create_role", "read_roles", "update_role", "delete_role",
    "create_patient", "read_patients", "update_patient", "delete_patient",
    "create_appointment", "read_appointments", "update_appointment", "delete_appointment",
    "create_bed", "read_beds", "update_bed", "delete_bed",
    "create_invoice", "read_invoices", "update_invoice",
    "create_medicine", "read_medicines", "update_medicine", "delete_medicine", "restock_medicine",
    "create_dispensation", "read_dispensations"
]

# Define roles and their associated permissions
ROLES = {
    "Admin": [
        "create_staff", "read_staff", "update_staff", "delete_staff",
        "create_role", "read_roles", "update_role", "delete_role",
        "create_patient", "read_patients", "update_patient", "delete_patient",
        "create_appointment", "read_appointments", "update_appointment", "delete_appointment",
        "create_bed", "read_beds", "update_bed", "delete_bed",
        "create_invoice", "read_invoices", "update_invoice",
        "create_medicine", "read_medicines", "update_medicine", "delete_medicine", "restock_medicine",
        "create_dispensation", "read_dispensations"
    ],
    "Doctor": [
        "read_patients",
        "read_appointments", "update_appointment",
        "read_beds",
        "read_medicines",
        "read_dispensations"
    ],
    "Nurse": [
        "read_patients", "update_patient",
        "read_appointments",
        "read_beds", "update_bed",
        "read_dispensations"
    ],
    "Pharmacist": [
        "read_medicines", "update_medicine", "restock_medicine",
        "create_dispensation", "read_dispensations"
    ]
}

async def create_initial_data():
    """
    Creates all permissions and roles, and associates them.
    This is idempotent and can be run safely multiple times.
    """
    db = SessionLocal()
    try:
        # --- Step 1: Create all permissions ---
        all_db_permissions = {}
        for name in PERMISSIONS:
            db_permission = db.query(Permission).filter(Permission.name == name).first()
            if not db_permission:
                db_permission = Permission(name=name, description=f"Permission to {name.replace('_', ' ')}")
                db.add(db_permission)
        # We need to flush to get potential new permission IDs, but we don't commit yet.
        db.flush()

        # --- Step 2: Create all roles ---
        all_db_roles = {}
        for role_name in ROLES:
            db_role = db.query(Role).filter(Role.name == role_name).first()
            if not db_role:
                db_role = Role(name=role_name, description=f"The {role_name} role")
                db.add(db_role)
        # Flush again to get potential new role IDs
        db.flush()

        # --- Step 3: Populate dictionaries with all roles and permissions ---
        for p in db.query(Permission).all():
            all_db_permissions[p.name] = p
        for r in db.query(Role).all():
            all_db_roles[r.name] = r

        # --- Step 4: Create the links in a single transaction ---
        for role_name, permission_names in ROLES.items():
            db_role = all_db_roles[role_name]
            for permission_name in permission_names:
                db_permission = all_db_permissions[permission_name]
                
                # Check if the association already exists
                existing_link = db.query(RolePermission).filter_by(role_id=db_role.id, permission_id=db_permission.id).first()
                if not existing_link:
                    link = RolePermission(role_id=db_role.id, permission_id=db_permission.id)
                    db.add(link)

        # --- Step 5: Commit everything at once ---
        db.commit()
        print("Successfully created and linked initial roles and permissions.")

    finally:
        db.close()

if __name__ == "__main__":
    # Create the tables if they don't exist
    Base.metadata.create_all(bind=engine)
    asyncio.run(create_initial_data())