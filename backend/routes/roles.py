from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models
from ..database import get_db
from ..schemas.role import Role, RoleCreate
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
