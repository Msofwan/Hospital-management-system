from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# TODO: Move this to a .env file for security
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:mysecretpassword@localhost/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Dependency to get a DB session for each request
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

