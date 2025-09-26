from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models
from ..database import get_db
from ..schemas.role import Role, RoleCreate, RoleUpdate
from ..auth import get_current_user, has_permission

router = APIRouter(
    prefix="/roles",
    tags=["Roles"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/", response_model=List[Role], dependencies=[Depends(has_permission("read_roles"))])
def get_all_roles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Retrieve all roles.
    """
    roles = crud.get_roles(db, skip=skip, limit=limit)
    return roles

@router.post("/", response_model=Role, dependencies=[Depends(has_permission("create_role"))])
def create_new_role(role: RoleCreate, db: Session = Depends(get_db)):
    """
    Create a new role.
    """
    db_role = crud.get_role_by_name(db, name=role.name)
    if db_role:
        raise HTTPException(status_code=400, detail="Role with this name already exists")
    return crud.create_role(db=db, role=role)

@router.put("/{role_id}", response_model=Role, dependencies=[Depends(has_permission("update_role"))])
def update_existing_role(role_id: int, role: RoleUpdate, db: Session = Depends(get_db)):
    """
    Update an existing role.
    """
    db_role = crud.get_role(db, role_id=role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    return crud.update_role(db=db, role_id=role_id, role=role)

@router.delete("/{role_id}", response_model=Role, dependencies=[Depends(has_permission("delete_role"))])
def delete_existing_role(role_id: int, db: Session = Depends(get_db)):
    """
    Delete an existing role.
    """
    db_role = crud.get_role(db, role_id=role_id)
    if not db_role:
        raise HTTPException(status_code=404, detail="Role not found")
    return crud.delete_role(db=db, role_id=role_id)
