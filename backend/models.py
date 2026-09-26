from sqlalchemy import Column, Integer, String, ForeignKey
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)

    education = Column(String, nullable=True)
    location = Column(String, nullable=True)
    career_goal = Column(String, nullable=True)
    about = Column(String, nullable=True)


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


class CourseProgress(Base):
    __tablename__ = "course_progress"

    id = Column(Integer, primary_key=True, index=True)
    course_name = Column(String, nullable=False)
    completed_lessons = Column(String, nullable=False, default="")
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    quiz_name = Column(String, nullable=False)
    score = Column(Integer, nullable=False)
    total_questions = Column(Integer, nullable=False)
    percentage = Column(Integer, nullable=False)
    passed = Column(Integer, nullable=False, default=0)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_id = Column(String, unique=True, index=True, nullable=False)
    course_name = Column(String, nullable=False)
    issued_at = Column(String, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)


# ==========================================
# SAVED INTERNSHIPS
# ==========================================

class SavedInternship(Base):
    __tablename__ = "saved_internships"

    id = Column(Integer, primary_key=True, index=True)

    internship_id = Column(Integer, nullable=False)

    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    category = Column(String, nullable=False)
    location = Column(String, nullable=False)
    mode = Column(String, nullable=False)
    stipend = Column(String, nullable=False)
    duration = Column(String, nullable=False)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )


# ==========================================
# INTERNSHIP APPLICATIONS
# ==========================================

class InternshipApplication(Base):
    __tablename__ = "internship_applications"

    id = Column(Integer, primary_key=True, index=True)

    internship_id = Column(Integer, nullable=False)

    company = Column(String, nullable=False)
    role = Column(String, nullable=False)
    location = Column(String, nullable=False)
    mode = Column(String, nullable=False)

    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    resume = Column(String, nullable=False)
    cover_letter = Column(String, nullable=True)

    status = Column(
        String,
        nullable=False,
        default="Application Submitted"
    )

    applied_at = Column(
        String,
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )