import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const COURSE_NAME = "Python Programming"
const TOTAL_LESSONS = 10

function Learning() {
  const navigate = useNavigate()

  const [completedLessons, setCompletedLessons] = useState([])
  const [loading, setLoading] = useState(true)

  /* =====================================
     AUTH
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
     LOAD COURSE PROGRESS
  ====================================== */

  const loadProgress = useCallback(async () => {
    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setLoading(true)

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

      if (!response.ok) {
        throw new Error(
          "Unable to load course progress."
        )
      }

      const data = await response.json()

      const lessons = Array.isArray(
        data.completed_lessons
      )
        ? data.completed_lessons
        : []

      const cleanedLessons = [
        ...new Set(
          lessons
            .map(Number)
            .filter(
              (lesson) =>
                Number.isInteger(lesson) &&
                lesson >= 1 &&
                lesson <= TOTAL_LESSONS
            )
        ),
      ].sort((a, b) => a - b)

      setCompletedLessons(cleanedLessons)

      localStorage.setItem(
        "pythonCompletedLessons",
        JSON.stringify(cleanedLessons)
      )
    } catch (error) {
      console.error(
        "Unable to load learning progress:",
        error
      )

      /* Use cached progress if backend is temporarily unavailable */

      try {
        const cached = JSON.parse(
          localStorage.getItem(
            "pythonCompletedLessons"
          ) || "[]"
        )

        if (Array.isArray(cached)) {
          setCompletedLessons(cached)
        }
      } catch {
        setCompletedLessons([])
      }
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  /* =====================================
     COURSE DATA
  ====================================== */

  const courses = [
    {
      id: "python",
      title: "Python Programming",
      description:
        "Learn Python from the fundamentals and build a strong programming foundation.",
      level: "Beginner",
      lessons: 10,
      duration: "4–6 Hours",
      icon: "🐍",
      color:
        "from-blue-500 to-indigo-600",
      available: true,
    },
    {
      id: "web",
      title: "Web Development",
      description:
        "Learn HTML, CSS and JavaScript to create modern websites.",
      level: "Beginner",
      lessons: 12,
      duration: "6–8 Hours",
      icon: "🌐",
      color:
        "from-orange-500 to-red-500",
      available: false,
    },
    {
      id: "java",
      title: "Java Programming",
      description:
        "Understand Java programming, OOP concepts and application development.",
      level: "Beginner",
      lessons: 10,
      duration: "5–7 Hours",
      icon: "☕",
      color:
        "from-red-500 to-orange-600",
      available: false,
    },
    {
      id: "uiux",
      title: "UI/UX Design",
      description:
        "Learn design principles, wireframes, user experience and Figma.",
      level: "Beginner",
      lessons: 8,
      duration: "4–5 Hours",
      icon: "🎨",
      color:
        "from-purple-500 to-pink-500",
      available: false,
    },
  ]

  /* =====================================
     PROGRESS
  ====================================== */

  const safeCompletedCount = Math.min(
    TOTAL_LESSONS,
    completedLessons.length
  )

  const pythonProgress = Math.min(
    100,
    Math.round(
      (safeCompletedCount / TOTAL_LESSONS) * 100
    )
  )

  const pythonCompleted =
    safeCompletedCount === TOTAL_LESSONS

  /* =====================================
     COURSE BUTTON
  ====================================== */

  const getCourseButton = (course) => {
    if (!course.available) {
      return "Coming Soon"
    }

    if (pythonCompleted) {
      return "Review Course"
    }

    if (safeCompletedCount > 0) {
      return "Continue Learning"
    }

    return "Start Learning"
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

          <nav className="flex-1 space-y-2 px-4 py-6">

            <Link
              to="/dashboard"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">
                🏠
              </span>
              Dashboard
            </Link>

            <Link
              to="/profile"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">
                👤
              </span>
              Profile
            </Link>

            <Link
              to="/skills"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">
                ⭐
              </span>
              Skills
            </Link>

            <Link
              to="/learning"
              className="group flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30"
            >
              <span className="text-lg">
                📚
              </span>
              Learning
            </Link>

            <Link
              to="/quizzes"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">
                📝
              </span>
              Quizzes
            </Link>

            <Link
              to="/certificates"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">
                🏆
              </span>
              Certificates
            </Link>

            <Link
              to="/internships"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg">
                💼
              </span>
              Internships
            </Link>

          </nav>

          {/* Logout */}

          <div className="border-t border-slate-800 p-4">

            <button
              onClick={() => {
                const confirmLogout =
                  window.confirm(
                    "Are you sure you want to logout?"
                  )

                if (!confirmLogout) {
                  return
                }

                localStorage.removeItem(
                  "isLoggedIn"
                )

                localStorage.removeItem(
                  "accessToken"
                )

                navigate("/login")
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <span>🚪</span>
              Logout
            </button>

          </div>

        </div>

      </aside>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="lg:ml-64">

        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Learn & Grow
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Learning
              </h1>

            </div>

            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:shadow-md"
            >

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg text-white">
                👤
              </div>

              <span className="hidden text-sm font-bold text-slate-700 sm:block">
                Profile
              </span>

            </Link>

          </div>

        </header>

        {/* MOBILE NAV */}

        <div className="border-b border-slate-200 bg-white lg:hidden">

          <div className="flex gap-2 overflow-x-auto px-4 py-3">

            <Link
              to="/dashboard"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              🏠 Dashboard
            </Link>

            <Link
              to="/profile"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              👤 Profile
            </Link>

            <Link
              to="/skills"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              ⭐ Skills
            </Link>

            <Link
              to="/learning"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
            >
              📚 Learning
            </Link>

            <Link
              to="/quizzes"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              📝 Quizzes
            </Link>

            <Link
              to="/certificates"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              🏆 Certificates
            </Link>

            <Link
              to="/internships"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              💼 Internships
            </Link>

            <button
              onClick={() => {
                const confirmLogout =
                  window.confirm(
                    "Are you sure you want to logout?"
                  )

                if (!confirmLogout) {
                  return
                }

                localStorage.removeItem(
                  "isLoggedIn"
                )

                localStorage.removeItem(
                  "accessToken"
                )

                navigate("/login")
              }}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
            >
              🚪 Logout
            </button>

          </div>

        </div>

        {/* CONTENT */}

        <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

          {/* HERO */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/5" />

            <div className="relative max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
                📚 Learn at your own pace
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Build Skills That Move Your Career Forward
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Learn practical technologies, complete
                lessons, test your knowledge and build
                confidence for internships and placements.
              </p>

            </div>

          </section>

          {/* CURRENT PROGRESS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  🐍
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    Current Course
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                    Python Programming
                  </h2>

                </div>

              </div>

              <div className="w-full md:max-w-md">

                <div className="mb-2 flex items-center justify-between text-sm">

                  <span className="font-semibold text-slate-500">
                    Course Progress
                  </span>

                  <span className="font-extrabold text-blue-600">
                    {loading
                      ? "..."
                      : `${pythonProgress}%`}
                  </span>

                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                    style={{
                      width: `${pythonProgress}%`,
                    }}
                  />

                </div>

                <p className="mt-2 text-xs font-medium text-slate-400">
                  {safeCompletedCount} of{" "}
                  {TOTAL_LESSONS} lessons completed
                </p>

              </div>

            </div>

          </section>

          {/* COURSE LIST */}

          <section>

            <div className="mb-5">

              <h2 className="text-2xl font-extrabold text-slate-900">
                Explore Courses
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose a course and start building your skills.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              {courses.map((course) => {

                const isPython =
                  course.id === "python"

                const progress =
                  isPython
                    ? pythonProgress
                    : 0

                return (
                  <div
                    key={course.id}
                    className={`group relative overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 ${
                      course.available
                        ? "border-slate-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                        : "border-slate-200 opacity-90"
                    }`}
                  >

                    {/* Course header */}

                    <div
                      className={`relative overflow-hidden bg-gradient-to-br ${course.color} p-6 text-white`}
                    >

                      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10" />

                      <div className="relative flex items-start justify-between">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                          {course.icon}
                        </div>

                        {!course.available && (
                          <span className="rounded-full bg-white/20 px-3 py-1.5 text-xs font-bold backdrop-blur">
                            Coming Soon
                          </span>
                        )}

                        {course.available &&
                          pythonCompleted && (
                            <span className="rounded-full bg-green-400/20 px-3 py-1.5 text-xs font-bold text-white backdrop-blur">
                              ✓ Completed
                            </span>
                          )}

                      </div>

                      <h3 className="relative mt-6 text-2xl font-extrabold">
                        {course.title}
                      </h3>

                      <p className="relative mt-2 text-sm leading-6 text-white/80">
                        {course.description}
                      </p>

                    </div>

                    {/* Course details */}

                    <div className="p-6">

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                          📊 {course.level}
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                          📖 {course.lessons} Lessons
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                          ⏱️ {course.duration}
                        </span>

                      </div>

                      {/* Python progress */}

                      {isPython && (
                        <div className="mt-6">

                          <div className="mb-2 flex justify-between text-xs">

                            <span className="font-bold text-slate-500">
                              Your Progress
                            </span>

                            <span className="font-extrabold text-blue-600">
                              {progress}%
                            </span>

                          </div>

                          <div className="h-2 overflow-hidden rounded-full bg-slate-100">

                            <div
                              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700"
                              style={{
                                width: `${progress}%`,
                              }}
                            />

                          </div>

                        </div>
                      )}

                      {/* Button */}

                      <div className="mt-6">

                        {course.available ? (
                          <Link
                            to="/python-course"
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                          >
                            {getCourseButton(course)}
                            <span>→</span>
                          </Link>
                        ) : (
                          <button
                            disabled
                            className="w-full cursor-not-allowed rounded-xl bg-slate-100 px-5 py-3 text-sm font-bold text-slate-400"
                          >
                            Coming Soon
                          </button>
                        )}

                      </div>

                    </div>

                  </div>
                )
              })}

            </div>

          </section>

          {/* LEARNING TIPS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>

              <h2 className="text-xl font-extrabold text-slate-900">
                Learning Tips
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Make your learning journey more effective
              </p>

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl bg-blue-50 p-5">

                <div className="text-2xl">
                  🎯
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Learn consistently
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Spend a little time learning every day
                  instead of trying to complete everything
                  at once.
                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-5">

                <div className="text-2xl">
                  💻
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Practice what you learn
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Turn concepts into small programs and
                  projects so the knowledge becomes practical.
                </p>

              </div>

              <div className="rounded-2xl bg-purple-50 p-5">

                <div className="text-2xl">
                  🧠
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Test yourself
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use quizzes to identify what you understand
                  and what you need to revise.
                </p>

              </div>

            </div>

          </section>

          {/* QUICK ACTIONS */}

          <section className="grid gap-4 sm:grid-cols-3">

            <Link
              to="/skills"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-xl">
                ⭐
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                Manage Skills
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Update the skills on your profile.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                Go to Skills →
              </span>

            </Link>

            <Link
              to="/quizzes"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                📝
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                Take a Quiz
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Test your programming knowledge.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                Take Quiz →
              </span>

            </Link>

            <Link
              to="/internships"
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                💼
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                Find Internships
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Explore opportunities matching your skills.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                Explore →
              </span>

            </Link>

          </section>

          {/* FOOTER */}

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

export default Learning