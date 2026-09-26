from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from pwdlib import PasswordHash
from datetime import datetime, timezone
import uuid
from io import BytesIO

from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib import colors
from reportlab.pdfgen import canvas


from models import (
    User,
    Skill,
    CourseProgress,
    QuizResult,
    Certificate,
    SavedInternship,
    InternshipApplication,
)

from schemas import (
    UserCreate,
    UserLogin,
    SkillCreate,
    ProfileUpdate,
    CourseProgressUpdate,
    QuizResultCreate,
    SavedInternshipCreate,
    InternshipApplicationCreate,
)

from database import get_db
from models import User, Skill, CourseProgress, QuizResult, Certificate
from schemas import (
    UserCreate,
    UserLogin,
    SkillCreate,
    ProfileUpdate,
    CourseProgressUpdate,
    QuizResultCreate
)
from auth import create_access_token, verify_token


router = APIRouter()

password_hash = PasswordHash.recommended()


# ==========================================
# REGISTER
# ==========================================

@router.post("/register")
def register_user(
    user: UserCreate,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_hash.hash(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User registered successfully",
        "user_id": new_user.id
    }


# ==========================================
# LOGIN
# ==========================================

@router.post("/login")
def login_user(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not existing_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    password_correct = password_hash.verify(
        user.password,
        existing_user.password
    )

    if not password_correct:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    access_token = create_access_token(
        data={
            "sub": str(existing_user.id),
            "email": existing_user.email
        }
    )

    return {
        "message": "Login successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": existing_user.id,
        "name": existing_user.name,
        "email": existing_user.email
    }


# ==========================================
# GET PROFILE
# ==========================================

@router.get("/profile")
def get_profile(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == int(current_user["user_id"])
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "education": user.education or "",
        "location": user.location or "",
        "career_goal": user.career_goal or "",
        "about": user.about or ""
    }


# ==========================================
# UPDATE PROFILE
# ==========================================

@router.put("/profile")
def update_profile(
    profile: ProfileUpdate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.id == int(current_user["user_id"])
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    existing_email = db.query(User).filter(
        User.email == profile.email,
        User.id != user.id
    ).first()

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered by another user"
        )

    user.name = profile.name
    user.email = profile.email
    user.education = profile.education
    user.location = profile.location
    user.career_goal = profile.career_goal
    user.about = profile.about

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated successfully",
        "profile": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "education": user.education or "",
            "location": user.location or "",
            "career_goal": user.career_goal or "",
            "about": user.about or ""
        }
    }


# ==========================================
# ADD SKILL
# ==========================================

@router.post("/skills")
def add_skill(
    skill: SkillCreate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    new_skill = Skill(
        name=skill.name,
        user_id=int(current_user["user_id"])
    )

    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)

    return {
        "message": "Skill added successfully",
        "skill": {
            "id": new_skill.id,
            "name": new_skill.name
        }
    }


# ==========================================
# GET SKILLS
# ==========================================

@router.get("/skills")
def get_skills(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    skills = db.query(Skill).filter(
        Skill.user_id == int(current_user["user_id"])
    ).all()

    return [
        {
            "id": skill.id,
            "name": skill.name
        }
        for skill in skills
    ]


# ==========================================
# DELETE SKILL
# ==========================================

@router.delete("/skills/{skill_id}")
def delete_skill(
    skill_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    skill = db.query(Skill).filter(
        Skill.id == skill_id,
        Skill.user_id == int(current_user["user_id"])
    ).first()

    if not skill:
        raise HTTPException(
            status_code=404,
            detail="Skill not found"
        )

    db.delete(skill)
    db.commit()

    return {
        "message": "Skill deleted successfully"
    }


# ==========================================
# COURSE PROGRESS
# ==========================================

@router.get("/course-progress/{course_name}")
def get_course_progress(
    course_name: str,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    progress = db.query(CourseProgress).filter(
        CourseProgress.user_id == int(current_user["user_id"]),
        CourseProgress.course_name == course_name
    ).first()

    if not progress:
        return {
            "course_name": course_name,
            "completed_lessons": []
        }

    if not progress.completed_lessons:
        completed_lessons = []
    else:
        completed_lessons = [
            int(lesson)
            for lesson in progress.completed_lessons.split(",")
            if lesson.strip()
        ]

    return {
        "course_name": course_name,
        "completed_lessons": completed_lessons
    }


# ==========================================
# UPDATE COURSE PROGRESS
# ==========================================

@router.put("/course-progress/{course_name}")
def update_course_progress(
    course_name: str,
    progress_data: CourseProgressUpdate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    progress = db.query(CourseProgress).filter(
        CourseProgress.user_id == user_id,
        CourseProgress.course_name == course_name
    ).first()

    completed_lessons = sorted(
        set(progress_data.completed_lessons)
    )

    completed_lessons_string = ",".join(
        str(lesson)
        for lesson in completed_lessons
    )

    if progress:
        progress.completed_lessons = completed_lessons_string
    else:
        progress = CourseProgress(
            course_name=course_name,
            completed_lessons=completed_lessons_string,
            user_id=user_id
        )

        db.add(progress)

    db.commit()
    db.refresh(progress)

    return {
        "message": "Course progress saved successfully",
        "course_name": course_name,
        "completed_lessons": completed_lessons
    }


# ==========================================
# SAVE QUIZ RESULT
# ==========================================

@router.post("/quiz-results")
def save_quiz_result(
    quiz_result: QuizResultCreate,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    new_result = QuizResult(
        quiz_name=quiz_result.quiz_name,
        score=quiz_result.score,
        total_questions=quiz_result.total_questions,
        percentage=quiz_result.percentage,
        passed=1 if quiz_result.passed else 0,
        user_id=user_id
    )

    db.add(new_result)
    db.commit()
    db.refresh(new_result)

    return {
        "message": "Quiz result saved successfully",
        "result": {
            "id": new_result.id,
            "quiz_name": new_result.quiz_name,
            "score": new_result.score,
            "total_questions": new_result.total_questions,
            "percentage": new_result.percentage,
            "passed": bool(new_result.passed)
        }
    }


# ==========================================
# GET ALL QUIZ RESULTS
# ==========================================

@router.get("/quiz-results")
def get_quiz_results(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    results = db.query(QuizResult).filter(
        QuizResult.user_id == int(current_user["user_id"])
    ).order_by(
        QuizResult.id.desc()
    ).all()

    return [
        {
            "id": result.id,
            "quiz_name": result.quiz_name,
            "score": result.score,
            "total_questions": result.total_questions,
            "percentage": result.percentage,
            "passed": bool(result.passed)
        }
        for result in results
    ]


# ==========================================
# DELETE QUIZ RESULT
# ==========================================

@router.delete("/quiz-results/{result_id}")
def delete_quiz_result(
    result_id: int,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    result = db.query(QuizResult).filter(
        QuizResult.id == result_id,
        QuizResult.user_id == int(current_user["user_id"])
    ).first()

    if not result:
        raise HTTPException(
            status_code=404,
            detail="Quiz result not found"
        )

    db.delete(result)
    db.commit()

    return {
        "message": "Quiz result deleted successfully"
    }

# ==========================================
# GENERATE CERTIFICATE
# ==========================================

@router.post("/certificates/{course_name}")
def generate_certificate(
    course_name: str,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    # Check course progress
    progress = db.query(CourseProgress).filter(
        CourseProgress.user_id == user_id,
        CourseProgress.course_name == course_name
    ).first()

    if not progress:
        raise HTTPException(
            status_code=400,
            detail="Course progress not found"
        )

    if not progress.completed_lessons:
        completed_lessons = []
    else:
        completed_lessons = [
            int(lesson)
            for lesson in progress.completed_lessons.split(",")
            if lesson.strip()
        ]

    # Python Programming has 10 lessons
    if course_name == "Python Programming":
        if len(set(completed_lessons)) < 10:
            raise HTTPException(
                status_code=400,
                detail="Complete all 10 lessons before generating the certificate"
            )

        # Check final Python quiz
        final_quiz = db.query(QuizResult).filter(
            QuizResult.user_id == user_id,
            QuizResult.quiz_name == "Python Basics",
            QuizResult.passed == 1
        ).order_by(
            QuizResult.id.desc()
        ).first()

        if not final_quiz:
            raise HTTPException(
                status_code=400,
                detail="Pass the Python Basics quiz before generating the certificate"
            )

    # Check if certificate already exists
    existing_certificate = db.query(Certificate).filter(
        Certificate.user_id == user_id,
        Certificate.course_name == course_name
    ).first()

    if existing_certificate:
        return {
            "message": "Certificate already exists",
            "certificate": {
                "id": existing_certificate.id,
                "certificate_id": existing_certificate.certificate_id,
                "course_name": existing_certificate.course_name,
                "issued_at": existing_certificate.issued_at
            }
        }

    # Generate unique certificate ID
    certificate_id = f"SB-{uuid.uuid4().hex[:10].upper()}"

    issued_at = datetime.now(timezone.utc).isoformat()

    new_certificate = Certificate(
        certificate_id=certificate_id,
        course_name=course_name,
        issued_at=issued_at,
        user_id=user_id
    )

    db.add(new_certificate)
    db.commit()
    db.refresh(new_certificate)

    return {
        "message": "Certificate generated successfully",
        "certificate": {
            "id": new_certificate.id,
            "certificate_id": new_certificate.certificate_id,
            "course_name": new_certificate.course_name,
            "issued_at": new_certificate.issued_at
        }
    }


# ==========================================
# GET CERTIFICATES
# ==========================================

@router.get("/certificates")
def get_certificates(
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    certificates = db.query(Certificate).filter(
        Certificate.user_id == int(current_user["user_id"])
    ).order_by(
        Certificate.id.desc()
    ).all()

    return [
        {
            "id": certificate.id,
            "certificate_id": certificate.certificate_id,
            "course_name": certificate.course_name,
            "issued_at": certificate.issued_at
        }
        for certificate in certificates
    ]

# ==========================================
# DOWNLOAD CERTIFICATE PDF
# ==========================================

@router.get("/certificates/{certificate_id}/download")
def download_certificate(
    certificate_id: str,
    current_user: dict = Depends(verify_token),
    db: Session = Depends(get_db)
):
    user_id = int(current_user["user_id"])

    certificate = db.query(Certificate).filter(
        Certificate.certificate_id == certificate_id,
        Certificate.user_id == user_id
    ).first()

    if not certificate:
        raise HTTPException(
            status_code=404,
            detail="Certificate not found"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    # Create PDF in memory
    buffer = BytesIO()

    page_width, page_height = landscape(A4)

    pdf = canvas.Canvas(
        buffer,
        pagesize=(page_width, page_height)
    )

    # ==========================================
    # BACKGROUND
    # ==========================================

    pdf.setFillColor(colors.HexColor("#F8FAFC"))
    pdf.rect(
        0,
        0,
        page_width,
        page_height,
        fill=1,
        stroke=0
    )

    # ==========================================
    # OUTER BORDER
    # ==========================================

    pdf.setStrokeColor(colors.HexColor("#2563EB"))
    pdf.setLineWidth(4)

    pdf.rect(
        25,
        25,
        page_width - 50,
        page_height - 50,
        fill=0,
        stroke=1
    )

    pdf.setStrokeColor(colors.HexColor("#93C5FD"))
    pdf.setLineWidth(1)

    pdf.rect(
        35,
        35,
        page_width - 70,
        page_height - 70,
        fill=0,
        stroke=1
    )

    # ==========================================
    # TITLE
    # ==========================================

    pdf.setFillColor(colors.HexColor("#1E3A8A"))

    pdf.setFont(
        "Helvetica-Bold",
        30
    )

    pdf.drawCentredString(
        page_width / 2,
        page_height - 90,
        "SKILLBRIDGE"
    )

    pdf.setFillColor(colors.HexColor("#334155"))

    pdf.setFont(
        "Helvetica-Bold",
        24
    )

    pdf.drawCentredString(
        page_width / 2,
        page_height - 130,
        "CERTIFICATE OF COMPLETION"
    )

    # ==========================================
    # PRESENTED TO
    # ==========================================

    pdf.setFillColor(colors.HexColor("#64748B"))

    pdf.setFont(
        "Helvetica",
        13
    )

    pdf.drawCentredString(
        page_width / 2,
        page_height - 175,
        "This certificate is proudly presented to"
    )

    # ==========================================
    # STUDENT NAME
    # ==========================================

    pdf.setFillColor(colors.HexColor("#111827"))

    pdf.setFont(
        "Helvetica-Bold",
        28
    )

    pdf.drawCentredString(
        page_width / 2,
        page_height - 220,
        user.name
    )

    # ==========================================
    # DESCRIPTION
    # ==========================================

    pdf.setFillColor(colors.HexColor("#475569"))

    pdf.setFont(
        "Helvetica",
        13
    )

    pdf.drawCentredString(
        page_width / 2,
        page_height - 260,
        "for successfully completing the course"
    )

    # ==========================================
    # COURSE NAME
    # ==========================================

    pdf.setFillColor(colors.HexColor("#2563EB"))

    pdf.setFont(
        "Helvetica-Bold",
        22
    )

    pdf.drawCentredString(
        page_width / 2,
        page_height - 300,
        certificate.course_name
    )

    # ==========================================
    # DETAILS
    # ==========================================

    try:
        issued_date = datetime.fromisoformat(
            certificate.issued_at.replace("Z", "+00:00")
        ).strftime("%d %B %Y")
    except Exception:
        issued_date = certificate.issued_at

    pdf.setFillColor(colors.HexColor("#64748B"))

    pdf.setFont(
        "Helvetica",
        11
    )

    pdf.drawCentredString(
        page_width / 2,
        page_height - 340,
        f"Issued on {issued_date}"
    )

    # ==========================================
    # CERTIFICATE ID
    # ==========================================

    pdf.setFillColor(colors.HexColor("#334155"))

    pdf.setFont(
        "Helvetica-Bold",
        11
    )

    pdf.drawCentredString(
        page_width / 2,
        80,
        f"Certificate ID: {certificate.certificate_id}"
    )

    # ==========================================
    # FOOTER
    # ==========================================

    pdf.setFillColor(colors.HexColor("#64748B"))

    pdf.setFont(
        "Helvetica",
        10
    )

    pdf.drawCentredString(
        page_width / 2,
        58,
        "SkillBridge • Learn. Build. Grow."
    )

    # Finish PDF
    pdf.showPage()
    pdf.save()

    buffer.seek(0)

    filename = (
        f"{certificate.course_name.replace(' ', '_')}"
        f"_Certificate.pdf"
    )

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"'
        }
    )

# ==========================================
# SAVED INTERNSHIPS
# ==========================================

@router.post("/saved-internships")
def save_internship(
    internship: SavedInternshipCreate,
    current_user=Depends(verify_token),
    db: Session = Depends(get_db)
):
    existing = db.query(SavedInternship).filter(
        SavedInternship.internship_id == internship.internship_id,
        SavedInternship.user_id == int(current_user["user_id"])
    ).first()

    if existing:
        return {
            "message": "Internship already saved",
            "id": existing.id
        }

    new_internship = SavedInternship(
        internship_id=internship.internship_id,
        company=internship.company,
        role=internship.role,
        category=internship.category,
        location=internship.location,
        mode=internship.mode,
        stipend=internship.stipend,
        duration=internship.duration,
        user_id=int(current_user["user_id"])
    )

    db.add(new_internship)
    db.commit()
    db.refresh(new_internship)

    return {
        "message": "Internship saved successfully",
        "id": new_internship.id
    }


@router.get("/saved-internships")
def get_saved_internships(
    current_user=Depends(verify_token),
    db: Session = Depends(get_db)
):
    internships = db.query(SavedInternship).filter(
        SavedInternship.user_id == int(current_user["user_id"])
    ).all()

    return internships


@router.delete("/saved-internships/{saved_id}")
def delete_saved_internship(
    saved_id: int,
    current_user=Depends(verify_token),
    db: Session = Depends(get_db)
):
    internship = db.query(SavedInternship).filter(
        SavedInternship.id == saved_id,
        SavedInternship.user_id == int(current_user["user_id"])
    ).first()

    if not internship:
        raise HTTPException(
            status_code=404,
            detail="Saved internship not found"
        )

    db.delete(internship)
    db.commit()

    return {
        "message": "Saved internship removed successfully"
    }


# ==========================================
# INTERNSHIP APPLICATIONS
# ==========================================

@router.post("/internship-applications")
def create_internship_application(
    application: InternshipApplicationCreate,
    current_user=Depends(verify_token),
    db: Session = Depends(get_db)
):
    existing = db.query(
        InternshipApplication
    ).filter(
        InternshipApplication.internship_id
        == application.internship_id,
        InternshipApplication.user_id
        == int(current_user["user_id"])
    ).first()

    if existing:
        raise HTTPException(
            status_code=400,
            detail="You have already applied for this internship"
        )

    new_application = InternshipApplication(
        internship_id=application.internship_id,
        company=application.company,
        role=application.role,
        location=application.location,
        mode=application.mode,
        name=application.name,
        email=application.email,
        phone=application.phone,
        resume=application.resume,
        cover_letter=application.cover_letter,
        status="Application Submitted",
        applied_at=datetime.now(
            timezone.utc
        ).isoformat(),
        user_id=int(current_user["user_id"])
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return {
        "message": "Application submitted successfully",
        "id": new_application.id
    }


@router.get("/internship-applications")
def get_internship_applications(
    current_user=Depends(verify_token),
    db: Session = Depends(get_db)
):
    applications = db.query(
        InternshipApplication
    ).filter(
        InternshipApplication.user_id
        == int(current_user["user_id"])
    ).all()

    return applications


@router.delete("/internship-applications/{application_id}")
def delete_internship_application(
    application_id: int,
    current_user=Depends(verify_token),
    db: Session = Depends(get_db)
):
    application = db.query(
        InternshipApplication
    ).filter(
        InternshipApplication.id == application_id,
        InternshipApplication.user_id
        == int(current_user["user_id"])
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()

    return {
        "message": "Application removed successfully"
    }