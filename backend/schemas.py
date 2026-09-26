from pydantic import BaseModel, EmailStr


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class SkillCreate(BaseModel):
    name: str


class ProfileUpdate(BaseModel):
    name: str
    email: EmailStr
    education: str | None = None
    location: str | None = None
    career_goal: str | None = None
    about: str | None = None


class CourseProgressUpdate(BaseModel):
    completed_lessons: list[int]


class QuizResultCreate(BaseModel):
    quiz_name: str
    score: int
    total_questions: int
    percentage: int
    passed: bool


# ==========================================
# SAVED INTERNSHIP SCHEMAS
# ==========================================

class SavedInternshipCreate(BaseModel):
    internship_id: int
    company: str
    role: str
    category: str
    location: str
    mode: str
    stipend: str
    duration: str


# ==========================================
# INTERNSHIP APPLICATION SCHEMAS
# ==========================================

class InternshipApplicationCreate(BaseModel):
    internship_id: int
    company: str
    role: str
    location: str
    mode: str

    name: str
    email: EmailStr
    phone: str
    resume: str
    cover_letter: str | None = None