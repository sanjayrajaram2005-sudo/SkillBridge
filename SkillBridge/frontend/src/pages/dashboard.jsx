import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const COURSE_NAME = "Python Programming"
const TOTAL_LESSONS = 10

function Dashboard() {
  const navigate = useNavigate()

  const [skills, setSkills] = useState([])
  const [certificates, setCertificates] = useState([])
  const [quizResults, setQuizResults] = useState([])
  const [profile, setProfile] = useState({})
  const [savedInternships, setSavedInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [completedLessons, setCompletedLessons] = useState([])

  const [progressLoading, setProgressLoading] = useState(true)
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [removingInternship, setRemovingInternship] = useState(null)

  /* =====================================
     UNAUTHORIZED
  ====================================== */

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("isLoggedIn")

    navigate("/login", {
      replace: true,
      state: {
        message:
          "Your login session has expired. Please log in again.",
      },
    })
  }, [navigate])

  /* =====================================
     LOAD DASHBOARD DATA
  ====================================== */

  const loadDashboardData = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      setDashboardLoading(false)
      setProgressLoading(false)

      navigate("/login", {
        replace: true,
      })

      return
    }

    setDashboardLoading(true)
    setProgressLoading(true)

    try {
      /* ============================
         SKILLS
      ============================ */

      let savedSkills = []

      try {
        const response = await fetch(`${API_URL}/skills`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          savedSkills = await response.json()
        }
      } catch (error) {
        console.error("Unable to load skills:", error)
      }

      /* ============================
         QUIZ RESULTS
      ============================ */

      let savedQuizzes = []

      try {
        const response = await fetch(`${API_URL}/quiz-results`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          savedQuizzes = await response.json()

          const sortedQuizzes = [...savedQuizzes].sort(
            (a, b) => Number(b.id || 0) - Number(a.id || 0)
          )

          const localQuizResults = sortedQuizzes.map((quiz) => ({
            id: quiz.id,
            quiz: quiz.quiz_name,
            score: quiz.score,
            total: quiz.total_questions,
            percentage: quiz.percentage,
            passed: quiz.passed,
            completed: true,
          }))

          localStorage.setItem(
            "quizResults",
            JSON.stringify(localQuizResults)
          )

          savedQuizzes = sortedQuizzes
        }
      } catch (error) {
        console.error("Unable to load quiz results:", error)
      }

      /* ============================
         CERTIFICATES
      ============================ */

      let savedCertificates = []

      try {
        const response = await fetch(`${API_URL}/certificates`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          savedCertificates = await response.json()
        }
      } catch (error) {
        console.error("Unable to load certificates:", error)
      }

      /* ============================
         PROFILE
      ============================ */

      let savedProfile =
        JSON.parse(localStorage.getItem("profile")) || {}

      try {
        const response = await fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          const backendProfile = await response.json()

          savedProfile = {
            ...savedProfile,
            fullName: backendProfile.name,
            email: backendProfile.email,
            education: backendProfile.education,
            location: backendProfile.location,
            careerGoal: backendProfile.career_goal,
            about: backendProfile.about,
          }

          localStorage.setItem(
            "profile",
            JSON.stringify(savedProfile)
          )
        }
      } catch (error) {
        console.error("Unable to load profile:", error)
      }

      /* ============================
         SAVED INTERNSHIPS
      ============================ */

      let savedInternshipsData = []

      try {
        const response = await fetch(
          `${API_URL}/saved-internships`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          savedInternshipsData = await response.json()
        }
      } catch (error) {
        console.error(
          "Unable to load saved internships:",
          error
        )
      }

      /* ============================
         APPLICATIONS
      ============================ */

      let applicationsData = []

      try {
        const response = await fetch(
          `${API_URL}/internship-applications`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          applicationsData = await response.json()
        }
      } catch (error) {
        console.error(
          "Unable to load applications:",
          error
        )
      }

      /* ============================
         PYTHON COURSE PROGRESS
      ============================ */

      let savedLessons = []

      try {
        const response = await fetch(
          `${API_URL}/course-progress/${encodeURIComponent(
            COURSE_NAME
          )}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (response.ok) {
          const progressData = await response.json()

          savedLessons = Array.isArray(
            progressData.completed_lessons
          )
            ? progressData.completed_lessons
            : []

          savedLessons = [
            ...new Set(
              savedLessons
                .map(Number)
                .filter(
                  (lesson) =>
                    lesson >= 1 &&
                    lesson <= TOTAL_LESSONS
                )
            ),
          ].sort((a, b) => a - b)

          localStorage.setItem(
            "pythonCompletedLessons",
            JSON.stringify(savedLessons)
          )
        } else {
          savedLessons =
            JSON.parse(
              localStorage.getItem(
                "pythonCompletedLessons"
              )
            ) || []
        }
      } catch (error) {
        console.error(
          "Unable to load course progress:",
          error
        )

        savedLessons =
          JSON.parse(
            localStorage.getItem(
              "pythonCompletedLessons"
            )
          ) || []
      }

      /* ============================
         UPDATE STATE
      ============================ */

      setSkills(
        Array.isArray(savedSkills)
          ? savedSkills
          : []
      )

      setCertificates(
        Array.isArray(savedCertificates)
          ? savedCertificates
          : []
      )

      setQuizResults(
        Array.isArray(savedQuizzes)
          ? savedQuizzes
          : []
      )

      setProfile(savedProfile)

      setSavedInternships(
        Array.isArray(savedInternshipsData)
          ? savedInternshipsData
          : []
      )

      setApplications(
        Array.isArray(applicationsData)
          ? applicationsData
          : []
      )

      setCompletedLessons(
        Array.isArray(savedLessons)
          ? savedLessons
          : []
      )
    } catch (error) {
      console.error(
        "Unable to load dashboard:",
        error
      )
    } finally {
      setDashboardLoading(false)
      setProgressLoading(false)
    }
  }, [handleUnauthorized, navigate])

  /* =====================================
     LOAD ON PAGE OPEN / FOCUS
  ====================================== */

  useEffect(() => {
    loadDashboardData()

    const handleFocus = () => {
      loadDashboardData()
    }

    const handleStorage = () => {
      loadDashboardData()
    }

    window.addEventListener(
      "focus",
      handleFocus
    )

    window.addEventListener(
      "storage",
      handleStorage
    )

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      )

      window.removeEventListener(
        "storage",
        handleStorage
      )
    }
  }, [loadDashboardData])

  /* =====================================
     CALCULATIONS
  ====================================== */

  const pythonProgress = Math.min(
    100,
    Math.round(
      (completedLessons.length / TOTAL_LESSONS) * 100
    )
  )

  const pythonCertificateExists =
    certificates.some(
      (certificate) =>
        certificate.course_name === COURSE_NAME
    )

  const courseCount =
    completedLessons.length > 0 ||
    pythonCertificateExists
      ? 1
      : 0

  const quizCount = quizResults.length

  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce(
            (total, quiz) => {
              const percentage =
                Number(
                  quiz.percentage ??
                    (
                      (Number(quiz.score || 0) /
                        Number(
                          quiz.total_questions ||
                            quiz.total ||
                            1
                        )) *
                      100
                    )
                )

              return total + percentage
            },
            0
          ) / quizResults.length
        )
      : 0

  const certificateCount = certificates.length
  const savedInternshipCount = savedInternships.length
  const applicationCount = applications.length

  const studentName =
    profile.fullName ||
    profile.name ||
    "Student"

  const latestQuiz =
    quizResults.length > 0
      ? quizResults[0]
      : null

  /* =====================================
     LOGOUT
  ====================================== */

  const handleLogout = () => {
    const confirmLogout = window.confirm(
      "Are you sure you want to logout?"
    )

    if (!confirmLogout) {
      return
    }

    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("accessToken")

    navigate("/login")
  }

  /* =====================================
     REMOVE SAVED INTERNSHIP
  ====================================== */

  const removeSavedInternship = async (savedId) => {
    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setRemovingInternship(savedId)

    try {
      const response = await fetch(
        `${API_URL}/saved-internships/${savedId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        const data = await response.json()

        alert(
          data.detail ||
            "Unable to remove internship."
        )

        return
      }

      setSavedInternships((current) =>
        current.filter(
          (internship) =>
            internship.id !== savedId
        )
      )
    } catch (error) {
      console.error(
        "Unable to remove saved internship:",
        error
      )

      alert(
        "Something went wrong while removing the internship."
      )
    } finally {
      setRemovingInternship(null)
    }
  }

  /* =====================================
     SIDEBAR LINKS
  ====================================== */

  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: "🏠",
    },
    {
      name: "Profile",
      path: "/profile",
      icon: "👤",
    },
    {
      name: "Skills",
      path: "/skills",
      icon: "⭐",
    },
    {
      name: "Learning",
      path: "/learning",
      icon: "📚",
    },
    {
      name: "Quizzes",
      path: "/quizzes",
      icon: "📝",
    },
    {
      name: "Certificates",
      path: "/certificates",
      icon: "🏆",
    },
    {
      name: "Internships",
      path: "/internships",
      icon: "💼",
    },
  ]

  /* =====================================
     RECENT ACTIVITY
  ====================================== */

  const recentActivities = []

  if (skills.length > 0) {
    recentActivities.push({
      icon: "⭐",
      title: `${skills.length} skill${
        skills.length === 1 ? "" : "s"
      } added`,
      description:
        "Your skills profile has been updated.",
    })
  }

  if (completedLessons.length > 0) {
    recentActivities.push({
      icon: "📚",
      title: `${completedLessons.length}/10 Python lessons completed`,
      description:
        pythonProgress === 100
          ? "Python course completed successfully."
          : "Keep learning to complete the Python course.",
    })
  }

  if (latestQuiz) {
    recentActivities.push({
      icon: "📝",
      title: `${
        latestQuiz.quiz_name ||
        latestQuiz.quiz ||
        "Quiz"
      } completed`,
      description: `Score: ${
        latestQuiz.percentage ?? 0
      }%`,
    })
  }

  if (certificateCount > 0) {
    recentActivities.push({
      icon: "🏆",
      title: `${certificateCount} certificate${
        certificateCount === 1 ? "" : "s"
      } earned`,
      description:
        "Your completed certificates are available.",
    })
  }

  if (savedInternshipCount > 0) {
    recentActivities.push({
      icon: "💼",
      title: `${savedInternshipCount} internship${
        savedInternshipCount === 1 ? "" : "s"
      } saved`,
      description:
        "Your saved internship opportunities.",
    })
  }

  if (applicationCount > 0) {
    recentActivities.push({
      icon: "📋",
      title: `${applicationCount} application${
        applicationCount === 1 ? "" : "s"
      } submitted`,
      description:
        "Track your internship applications.",
    })
  }

  /* =====================================
     UI
  ====================================== */

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================
          DESKTOP SIDEBAR
      ====================================== */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white shadow-2xl lg:block">

        <div className="flex h-full flex-col">

          {/* Logo */}

          <div className="border-b border-slate-800 px-6 py-6">

            <Link
              to="/dashboard"
              className="inline-block text-2xl font-extrabold tracking-tight"
            >
              Skill
              <span className="text-blue-400">
                Bridge
              </span>
            </Link>

            <p className="mt-1 text-xs text-slate-400">
              Student Career Platform
            </p>

          </div>

          {/* Navigation */}

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-6">

            {sidebarLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  item.path === "/dashboard"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-900/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-lg transition-transform duration-200 group-hover:scale-110">
                  {item.icon}
                </span>

                <span>{item.name}</span>
              </Link>
            ))}

          </nav>

          {/* Logout */}

          <div className="border-t border-slate-800 p-4">

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>

          </div>

        </div>

      </aside>

      {/* =====================================
          MAIN AREA
      ====================================== */}

      <main className="lg:ml-64">

        {/* =====================================
            TOP HEADER
        ====================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

            <div className="min-w-0">

              <p className="text-sm font-medium text-slate-500">
                Welcome back 👋
              </p>

              <h1 className="truncate text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                {studentName}
              </h1>

            </div>

            <Link
              to="/profile"
              className="flex shrink-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition duration-200 hover:border-blue-200 hover:bg-blue-50 hover:shadow-md"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg text-white shadow-sm">
                👤
              </div>

              <div className="hidden text-left sm:block">

                <p className="text-sm font-bold text-slate-800">
                  {studentName}
                </p>

                <p className="max-w-[180px] truncate text-xs text-slate-500">
                  {profile.email || "View profile"}
                </p>

              </div>

            </Link>

          </div>

        </header>

        {/* =====================================
            MOBILE NAV
        ====================================== */}

        <div className="border-b border-slate-200 bg-white lg:hidden">

          <div className="flex gap-2 overflow-x-auto px-4 py-3">

            {sidebarLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  item.path === "/dashboard"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}

            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>

          </div>

        </div>

        {/* =====================================
            PAGE CONTENT
        ====================================== */}

        <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

          {/* =====================================
              HERO
          ====================================== */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

            <div className="absolute -bottom-28 right-10 h-64 w-64 rounded-full bg-white/5" />

            <div className="absolute right-1/3 top-10 h-20 w-20 rounded-full bg-white/5" />

            <div className="relative flex flex-col justify-between gap-8 md:flex-row md:items-center">

              <div className="max-w-2xl">

                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
                  🚀 Your learning journey
                </div>

                <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                  Build Your Skills.
                  <br />
                  Build Your Future.
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
                  Continue learning, improve your skills,
                  complete quizzes, earn certificates and
                  discover internship opportunities.
                </p>

                <div className="mt-6 flex flex-wrap gap-3">

                  <Link
                    to="/learning"
                    className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-blue-700 shadow-lg transition duration-200 hover:-translate-y-1 hover:bg-blue-50"
                  >
                    Continue Learning →
                  </Link>

                  <Link
                    to="/internships"
                    className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition duration-200 hover:-translate-y-1 hover:bg-white/20"
                  >
                    Explore Internships
                  </Link>

                </div>

              </div>

              <div className="hidden select-none pr-8 text-8xl opacity-25 md:block">
                🎓
              </div>

            </div>

          </section>

          {/* =====================================
              OVERVIEW
          ====================================== */}

          <section>

            <div className="mb-4 flex items-end justify-between">

              <div>
                <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                  Your Overview
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your SkillBridge activity
                </p>
              </div>

              {dashboardLoading && (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />
                  Updating...
                </div>
              )}

            </div>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">

              {/* Skills */}

              <Link
                to="/skills"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-yellow-200 hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-xl transition duration-200 group-hover:scale-110">
                    ⭐
                  </div>

                  <span className="text-2xl font-extrabold text-slate-900">
                    {skills.length}
                  </span>

                </div>

                <p className="mt-4 text-sm font-bold text-slate-500">
                  Skills
                </p>

              </Link>

              {/* Courses */}

              <Link
                to="/learning"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl transition duration-200 group-hover:scale-110">
                    📚
                  </div>

                  <span className="text-2xl font-extrabold text-slate-900">
                    {courseCount}
                  </span>

                </div>

                <p className="mt-4 text-sm font-bold text-slate-500">
                  Courses
                </p>

              </Link>

              {/* Quizzes */}

              <Link
                to="/quizzes"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-purple-200 hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl transition duration-200 group-hover:scale-110">
                    📝
                  </div>

                  <span className="text-2xl font-extrabold text-slate-900">
                    {quizCount}
                  </span>

                </div>

                <p className="mt-4 text-sm font-bold text-slate-500">
                  {quizCount === 1 ? "Quiz" : "Quizzes"}
                </p>

              </Link>

              {/* Certificates */}

              <Link
                to="/certificates"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-xl transition duration-200 group-hover:scale-110">
                    🏆
                  </div>

                  <span className="text-2xl font-extrabold text-slate-900">
                    {certificateCount}
                  </span>

                </div>

                <p className="mt-4 text-sm font-bold text-slate-500">
                  {certificateCount === 1
                    ? "Certificate"
                    : "Certificates"}
                </p>

              </Link>

              {/* Saved */}

              <Link
                to="/internships"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-green-200 hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl transition duration-200 group-hover:scale-110">
                    💼
                  </div>

                  <span className="text-2xl font-extrabold text-slate-900">
                    {savedInternshipCount}
                  </span>

                </div>

                <p className="mt-4 text-sm font-bold text-slate-500">
                  Saved
                </p>

              </Link>

              {/* Applications */}

              <Link
                to="/internships"
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
              >

                <div className="flex items-center justify-between">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-xl transition duration-200 group-hover:scale-110">
                    📋
                  </div>

                  <span className="text-2xl font-extrabold text-slate-900">
                    {applicationCount}
                  </span>

                </div>

                <p className="mt-4 text-sm font-bold text-slate-500">
                  Applications
                </p>

              </Link>

            </div>

          </section>

          {/* =====================================
              COURSE + PROFILE
          ====================================== */}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Python */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-2xl">
                    🐍
                  </div>

                  <div>
                    <h2 className="font-extrabold text-slate-900">
                      Python Programming
                    </h2>

                    <p className="text-sm text-slate-500">
                      Beginner Course
                    </p>
                  </div>

                </div>

                <span className="rounded-full bg-blue-100 px-3 py-1.5 text-sm font-extrabold text-blue-700">
                  {pythonProgress}%
                </span>

              </div>

              <div className="mt-7">

                <div className="mb-2 flex justify-between text-sm">

                  <span className="font-semibold text-slate-500">
                    Course Progress
                  </span>

                  <span className="font-bold text-slate-700">
                    {completedLessons.length}/{TOTAL_LESSONS} lessons
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-700"
                    style={{
                      width: `${pythonProgress}%`,
                    }}
                  />

                </div>

              </div>

              <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="text-sm font-semibold text-slate-500">

                  {progressLoading
                    ? "Loading progress..."
                    : pythonProgress === 100
                    ? "Course completed 🎉"
                    : completedLessons.length === 0
                    ? "Start your course today"
                    : "Keep going — you're doing great!"}

                </div>

                <Link
                  to="/learning/python"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-center text-sm font-bold text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
                >
                  {pythonProgress === 0
                    ? "Start Course"
                    : pythonProgress === 100
                    ? "Review Course"
                    : "Continue"}
                </Link>

              </div>

            </section>

            {/* Profile */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Profile Summary
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Keep your profile updated
                  </p>
                </div>

                <Link
                  to="/profile"
                  className="rounded-lg px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Edit
                </Link>

              </div>

              <div className="mt-6 flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-3xl shadow-sm">
                  👤
                </div>

                <div className="min-w-0">

                  <h3 className="truncate text-lg font-extrabold text-slate-900">
                    {studentName}
                  </h3>

                  <p className="truncate text-sm text-slate-500">
                    {profile.email || "Email not added"}
                  </p>

                </div>

              </div>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Education
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-slate-700">
                    {profile.education || "Not added"}
                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Location
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-slate-700">
                    {profile.location || "Not added"}
                  </p>

                </div>

                <div className="rounded-2xl bg-slate-50 p-4 transition hover:bg-slate-100 sm:col-span-2">

                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Career Goal
                  </p>

                  <p className="mt-1 truncate text-sm font-bold text-slate-700">
                    {profile.careerGoal || "Not added"}
                  </p>

                </div>

              </div>

            </section>

          </div>

          {/* =====================================
              QUIZ + QUICK ACTIONS
          ====================================== */}

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Quiz Performance */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md lg:col-span-2">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Quiz Performance
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your overall quiz progress
                  </p>
                </div>

                <Link
                  to="/quizzes"
                  className="rounded-lg px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
                >
                  Take Quiz →
                </Link>

              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/60 p-5">

                  <p className="text-sm font-bold text-blue-600">
                    Total Quizzes
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-blue-900">
                    {quizCount}
                  </p>

                </div>

                <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-green-100/60 p-5">

                  <p className="text-sm font-bold text-green-600">
                    Average Score
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-green-900">
                    {averageScore}%
                  </p>

                </div>

                <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-purple-100/60 p-5">

                  <p className="text-sm font-bold text-purple-600">
                    Latest Score
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-purple-900">
                    {latestQuiz
                      ? `${latestQuiz.percentage ?? 0}%`
                      : "—"}
                  </p>

                </div>

              </div>

              {latestQuiz && (
                <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <p className="text-sm font-bold text-slate-800">
                      {latestQuiz.quiz_name ||
                        latestQuiz.quiz ||
                        "Latest Quiz"}
                    </p>

                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Score:{" "}
                      {latestQuiz.score ?? 0}/
                      {latestQuiz.total_questions ??
                        latestQuiz.total ??
                        0}
                    </p>

                  </div>

                  <span
                    className={`w-fit rounded-full px-3 py-1.5 text-xs font-bold ${
                      latestQuiz.passed
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {latestQuiz.passed
                      ? "✓ Passed"
                      : "Needs Improvement"}
                  </span>

                </div>
              )}

            </section>

            {/* Quick Actions */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">

              <h2 className="font-extrabold text-slate-900">
                Quick Actions
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Jump back into SkillBridge
              </p>

              <div className="mt-5 space-y-3">

                <Link
                  to="/skills"
                  className="group flex items-center gap-3 rounded-2xl border border-yellow-100 bg-yellow-50 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:bg-yellow-100"
                >
                  <span className="text-xl transition group-hover:scale-110">
                    ⭐
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Manage Skills
                    </p>

                    <p className="text-xs text-slate-500">
                      Add or update your skills
                    </p>
                  </div>
                </Link>

                <Link
                  to="/learning"
                  className="group flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-100"
                >
                  <span className="text-xl transition group-hover:scale-110">
                    📚
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Continue Learning
                    </p>

                    <p className="text-xs text-slate-500">
                      Continue your course
                    </p>
                  </div>
                </Link>

                <Link
                  to="/quizzes"
                  className="group flex items-center gap-3 rounded-2xl border border-purple-100 bg-purple-50 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:bg-purple-100"
                >
                  <span className="text-xl transition group-hover:scale-110">
                    📝
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Take a Quiz
                    </p>

                    <p className="text-xs text-slate-500">
                      Test your knowledge
                    </p>
                  </div>
                </Link>

                <Link
                  to="/internships"
                  className="group flex items-center gap-3 rounded-2xl border border-green-100 bg-green-50 p-3.5 transition duration-200 hover:-translate-y-0.5 hover:bg-green-100"
                >
                  <span className="text-xl transition group-hover:scale-110">
                    💼
                  </span>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Find Internships
                    </p>

                    <p className="text-xs text-slate-500">
                      Explore opportunities
                    </p>
                  </div>
                </Link>

              </div>

            </section>

          </div>

          {/* =====================================
              MY SKILLS
          ====================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-extrabold text-slate-900">
                  My Skills
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills added to your profile
                </p>
              </div>

              <Link
                to="/skills"
                className="rounded-lg px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Manage Skills →
              </Link>

            </div>

            {skills.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                <div className="text-4xl">
                  ⭐
                </div>

                <h3 className="mt-3 font-bold text-slate-800">
                  No skills added yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add your skills to build your profile.
                </p>

                <Link
                  to="/skills"
                  className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Add Skills
                </Link>

              </div>
            ) : (
              <div className="mt-5 flex flex-wrap gap-3">

                {skills.slice(0, 10).map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700 transition hover:-translate-y-0.5 hover:bg-blue-100"
                  >
                    {skill.name}
                  </span>
                ))}

                {skills.length > 10 && (
                  <Link
                    to="/skills"
                    className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-200"
                  >
                    +{skills.length - 10} more
                  </Link>
                )}

              </div>
            )}

          </section>

          {/* =====================================
              SAVED INTERNSHIPS
          ====================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-extrabold text-slate-900">
                  Saved Internships
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Opportunities you saved for later
                </p>
              </div>

              <Link
                to="/internships"
                className="rounded-lg px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                Explore More →
              </Link>

            </div>

            {savedInternships.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                <div className="text-4xl">
                  💼
                </div>

                <h3 className="mt-3 font-bold text-slate-800">
                  No saved internships
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Save interesting internship opportunities here.
                </p>

                <Link
                  to="/internships"
                  className="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Find Internships
                </Link>

              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2">

                {savedInternships
                  .slice(0, 4)
                  .map((internship) => (
                    <div
                      key={internship.id}
                      className="rounded-2xl border border-slate-200 p-5 transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="truncate font-extrabold text-slate-900">
                            {internship.role}
                          </h3>

                          <p className="mt-1 text-sm font-bold text-blue-600">
                            {internship.company}
                          </p>

                        </div>

                        <button
                          onClick={() =>
                            removeSavedInternship(
                              internship.id
                            )
                          }
                          disabled={
                            removingInternship ===
                            internship.id
                          }
                          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {removingInternship ===
                          internship.id
                            ? "Removing..."
                            : "Remove"}
                        </button>

                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          📍 {internship.location}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          💻 {internship.mode}
                        </span>

                        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">
                          💰 {internship.stipend}
                        </span>

                      </div>

                    </div>
                  ))}

              </div>
            )}

          </section>

          {/* =====================================
              APPLICATIONS
          ====================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-extrabold text-slate-900">
                  My Applications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track your internship applications
                </p>
              </div>

              <Link
                to="/internships"
                className="rounded-lg px-3 py-2 text-sm font-bold text-blue-600 transition hover:bg-blue-50"
              >
                View Internships →
              </Link>

            </div>

            {applications.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                <div className="text-4xl">
                  📋
                </div>

                <h3 className="mt-3 font-bold text-slate-800">
                  No applications yet
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Apply to internships that match your skills.
                </p>

              </div>
            ) : (
              <div className="mt-5 space-y-3">

                {applications
                  .slice(0, 5)
                  .map((application) => (
                    <div
                      key={application.id}
                      className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 p-4 transition duration-200 hover:border-blue-200 hover:shadow-sm sm:flex-row sm:items-center"
                    >

                      <div>

                        <h3 className="font-bold text-slate-900">
                          {application.role}
                        </h3>

                        <p className="mt-1 text-sm font-bold text-blue-600">
                          {application.company}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          📍 {application.location}
                          {" • "}
                          {application.mode}
                        </p>

                      </div>

                      <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                        {application.status ||
                          "Application Submitted"}
                      </span>

                    </div>
                  ))}

              </div>
            )}

          </section>

          {/* =====================================
              RECENT ACTIVITY
          ====================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:shadow-md">

            <div>

              <h2 className="font-extrabold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your latest SkillBridge activity
              </p>

            </div>

            {recentActivities.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">

                <div className="text-4xl">
                  🚀
                </div>

                <h3 className="mt-3 font-bold text-slate-800">
                  Start your SkillBridge journey
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Add a skill, start learning or take your first quiz.
                </p>

              </div>
            ) : (
              <div className="mt-5 divide-y divide-slate-100">

                {recentActivities
                  .slice(0, 6)
                  .map((activity, index) => (
                    <div
                      key={`${activity.title}-${index}`}
                      className="flex items-center gap-4 py-4"
                    >

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xl">
                        {activity.icon}
                      </div>

                      <div className="min-w-0">

                        <p className="text-sm font-bold text-slate-800">
                          {activity.title}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {activity.description}
                        </p>

                      </div>

                    </div>
                  ))}

              </div>
            )}

          </section>

          {/* =====================================
              FOOTER
          ====================================== */}

          <footer className="border-t border-slate-200 py-7 text-center">

            <p className="text-sm text-slate-500">
              © 2026{" "}
              <span className="font-bold text-slate-700">
                SkillBridge
              </span>
              . Build Your Skills. Build Your Future.
            </p>

          </footer>

        </div>

      </main>

    </div>
  )
}

export default Dashboard