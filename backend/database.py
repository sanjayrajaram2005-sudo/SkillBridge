from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = "sqlite:///./skillbridge.db"


engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)


SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


Base = declarative_base()


def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


def update_database():
    columns = {
        "education": "TEXT",
        "location": "TEXT",
        "career_goal": "TEXT",
        "about": "TEXT"
    }

    with engine.connect() as connection:

        existing_columns = connection.execute(
            text("PRAGMA table_info(users)")
        ).fetchall()

        existing_column_names = {
            column[1] for column in existing_columns
        }

        for column_name, column_type in columns.items():

            if column_name not in existing_column_names:

                connection.execute(
                    text(
                        f"ALTER TABLE users "
                        f"ADD COLUMN {column_name} {column_type}"
                    )
                )

        connection.commit()