import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Certificates() {
  const navigate = useNavigate()

  const [certificates, setCertificates] = useState([])
  const [quizResults, setQuizResults] = useState([])
  const [profile, setProfile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState(null)

  const [error, setError] = useState("")

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
     LOAD CERTIFICATES
  ====================================== */

  const loadCertificates = useCallback(async () => {
    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setLoading(true)
    setError("")

    try {
      const [
        certificatesResponse,
        quizResponse,
        profileResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/certificates`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),

        fetch(`${API_URL}/quiz-results`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),

        fetch(`${API_URL}/profile`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),
      ])

      if (
        certificatesResponse.status === 401 ||
        quizResponse.status === 401 ||
        profileResponse.status === 401
      ) {
        handleUnauthorized()
        return
      }

      if (!certificatesResponse.ok) {
        throw new Error(
          "Unable to load certificates."
        )
      }

      const certificatesData =
        await certificatesResponse.json()

      const quizData =
        quizResponse.ok
          ? await quizResponse.json()
          : []

      const profileData =
        profileResponse.ok
          ? await profileResponse.json()
          : null

      const loadedCertificates =
        Array.isArray(certificatesData)
          ? certificatesData
          : []

      const loadedQuizResults =
        Array.isArray(quizData)
          ? quizData
          : []

      setCertificates(
        loadedCertificates
      )

      setQuizResults(
        loadedQuizResults
      )

      setProfile(profileData)

      /* Local cache */

      localStorage.setItem(
        "certificates",
        JSON.stringify(
          loadedCertificates
        )
      )

      if (profileData) {
        localStorage.setItem(
          "profile",
          JSON.stringify(profileData)
        )
      }

      localStorage.setItem(
        "quizResults",
        JSON.stringify(
          loadedQuizResults
        )
      )
    } catch (error) {
      console.error(
        "Unable to load certificates:",
        error
      )

      /* Use cached data if available */

      try {
        const cachedCertificates =
          JSON.parse(
            localStorage.getItem(
              "certificates"
            ) || "[]"
          )

        const cachedQuizResults =
          JSON.parse(
            localStorage.getItem(
              "quizResults"
            ) || "[]"
          )

        const cachedProfile =
          JSON.parse(
            localStorage.getItem(
              "profile"
            ) || "null"
          )

        setCertificates(
          Array.isArray(
            cachedCertificates
          )
            ? cachedCertificates
            : []
        )

        setQuizResults(
          Array.isArray(
            cachedQuizResults
          )
            ? cachedQuizResults
            : []
        )

        setProfile(cachedProfile)

        setError(
          "Unable to refresh certificate data from the server."
        )
      } catch {
        setCertificates([])
        setQuizResults([])
        setProfile(null)

        setError(
          "Unable to load certificate data."
        )
      }
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  /* =====================================
     LOAD ON PAGE OPEN
  ====================================== */

  useEffect(() => {
    loadCertificates()
  }, [loadCertificates])

  /* =====================================
     DOWNLOAD CERTIFICATE
  ====================================== */

  const handleDownload = async (
    certificateId
  ) => {
    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setDownloadingId(certificateId)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/certificates/${encodeURIComponent(
          certificateId
        )}/download`,
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
        let message =
          "Unable to download certificate."

        try {
          const data =
            await response.json()

          message =
            data.detail || message
        } catch {
          // Ignore JSON parsing error.
        }

        throw new Error(message)
      }

      const blob =
        await response.blob()

      const url =
        window.URL.createObjectURL(blob)

      const link =
        document.createElement("a")

      link.href = url

      link.download =
        `${certificateId}.pdf`

      document.body.appendChild(link)

      link.click()

      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(
        "Unable to download certificate:",
        error
      )

      setError(
        error.message ||
          "Unable to download certificate."
      )
    } finally {
      setDownloadingId(null)
    }
  }

  /* =====================================
     HELPERS
  ====================================== */

  const studentName =
    profile?.fullName ||
    profile?.name ||
    "Student"

  const passedPythonQuiz =
    quizResults.some(
      (result) =>
        result.quiz_name ===
          "Python Basics" &&
        (
          result.passed === true ||
          result.passed === 1 ||
          Number(result.percentage) >= 80
        )
    )

  const getCertificateDate = (
    certificate
  ) => {
    if (!certificate?.issued_at) {
      return "Date unavailable"
    }

    const date =
      new Date(
        certificate.issued_at
      )

    if (Number.isNaN(date.getTime())) {
      return certificate.issued_at
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    )
  }

  /* =====================================
     LOGOUT
  ====================================== */

  const handleLogout = () => {
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
  }

  /* =====================================
     MAIN UI
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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              🏠 Dashboard
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              👤 Profile
            </Link>

            <Link
              to="/skills"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              ⭐ Skills
            </Link>

            <Link
              to="/learning"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              📚 Learning
            </Link>

            <Link
              to="/quizzes"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              📝 Quizzes
            </Link>

            <Link
              to="/certificates"
              className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30"
            >
              🏆 Certificates
            </Link>

            <Link
              to="/internships"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              💼 Internships
            </Link>

          </nav>

          {/* Logout */}

          <div className="border-t border-slate-800 p-4">

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              🚪 Logout
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
                Achievements
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Certificates
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

        {/* =====================================
            MOBILE NAV
        ====================================== */}

        <div className="border-b border-slate-200 bg-white lg:hidden">

          <div className="flex gap-2 overflow-x-auto px-4 py-3">

            <Link
              to="/dashboard"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              🏠 Dashboard
            </Link>

            <Link
              to="/profile"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              👤 Profile
            </Link>

            <Link
              to="/skills"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              ⭐ Skills
            </Link>

            <Link
              to="/learning"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              📚 Learning
            </Link>

            <Link
              to="/quizzes"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              📝 Quizzes
            </Link>

            <Link
              to="/certificates"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
            >
              🏆 Certificates
            </Link>

            <Link
              to="/internships"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              💼 Internships
            </Link>

            <button
              onClick={handleLogout}
              className="flex shrink-0 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
            >
              🚪 Logout
            </button>

          </div>

        </div>

        {/* =====================================
            CONTENT
        ====================================== */}

        <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

          {/* HERO */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 p-6 text-white shadow-xl sm:p-8">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/5" />

            <div className="relative max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-orange-100 backdrop-blur">
                🏆 Your achievements
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Celebrate Your Progress
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-100 sm:text-base">
                Your certificates recognize the courses
                you have successfully completed on
                SkillBridge.
              </p>

            </div>

          </section>

          {/* STATS */}

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-slate-500">
                    Certificates Earned
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loading
                      ? "..."
                      : certificates.length}
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-xl">
                  🏆
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-slate-500">
                    Quiz Requirement
                  </p>

                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {passedPythonQuiz
                      ? "Completed"
                      : "In Progress"}
                  </p>

                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl text-xl ${
                    passedPythonQuiz
                      ? "bg-green-100"
                      : "bg-orange-100"
                  }`}
                >
                  {passedPythonQuiz
                    ? "✓"
                    : "📝"}
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm font-semibold text-slate-500">
                    Student
                  </p>

                  <p className="mt-2 max-w-[180px] truncate text-xl font-extrabold text-slate-900">
                    {studentName}
                  </p>

                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl">
                  👤
                </div>

              </div>

            </div>

          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-700">
              ⚠️ {error}
            </div>
          )}

          {/* LOADING */}

          {loading ? (

            <section className="grid gap-6 md:grid-cols-2">

              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >

                  <div className="h-40 bg-slate-200" />

                  <div className="space-y-4 p-6">

                    <div className="h-5 w-48 rounded bg-slate-200" />

                    <div className="h-4 w-64 rounded bg-slate-100" />

                    <div className="h-10 w-full rounded bg-slate-100" />

                  </div>

                </div>
              ))}

            </section>

          ) : certificates.length === 0 ? (

            /* =====================================
               EMPTY STATE
            ====================================== */

            <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm sm:p-12">

              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow-100 text-4xl">
                🏆
              </div>

              <h2 className="mt-6 text-2xl font-extrabold text-slate-900">
                No Certificates Yet
              </h2>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Complete the required course lessons
                and pass the required quiz to earn
                your first SkillBridge certificate.
              </p>

              {/* Requirements */}

              <div className="mx-auto mt-7 max-w-md rounded-2xl bg-slate-50 p-5 text-left">

                <p className="text-sm font-extrabold text-slate-800">
                  Python Certificate Requirements
                </p>

                <div className="mt-4 space-y-3">

                  <div className="flex items-center gap-3">

                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                        passedPythonQuiz
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {passedPythonQuiz
                        ? "✓"
                        : "1"}
                    </span>

                    <span className="text-sm font-semibold text-slate-600">
                      Pass Python Basics quiz with 80%+
                    </span>

                  </div>

                  <div className="flex items-center gap-3">

                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-sm font-bold text-slate-500">
                      2
                    </span>

                    <span className="text-sm font-semibold text-slate-600">
                      Complete all 10 Python lessons
                    </span>

                  </div>

                </div>

              </div>

              <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">

                <Link
                  to="/learning"
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  📚 Continue Learning
                </Link>

                <Link
                  to="/quizzes"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  📝 Take a Quiz
                </Link>

              </div>

            </section>

          ) : (

            /* =====================================
               CERTIFICATE CARDS
            ====================================== */

            <section>

              <div className="mb-5">

                <h2 className="text-2xl font-extrabold text-slate-900">
                  My Certificates
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Certificates you have earned through
                  SkillBridge.
                </p>

              </div>

              <div className="grid gap-6 md:grid-cols-2">

                {certificates.map(
                  (certificate) => (
                    <div
                      key={
                        certificate.id ||
                        certificate.certificate_id
                      }
                      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-yellow-200 hover:shadow-xl"
                    >

                      {/* Certificate Preview */}

                      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 p-6 text-white">

                        <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-white/10" />

                        <div className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full border border-white/10" />

                        <div className="relative">

                          <div className="flex items-start justify-between">

                            <div>

                              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                                SkillBridge
                              </p>

                              <h3 className="mt-3 text-2xl font-extrabold">
                                Certificate
                              </h3>

                            </div>

                            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-yellow-300/60 bg-yellow-400/10 text-2xl">
                              🏆
                            </div>

                          </div>

                          <div className="mt-8">

                            <p className="text-xs font-medium text-slate-400">
                              This certificate is proudly awarded to
                            </p>

                            <p className="mt-1 text-xl font-extrabold text-white">
                              {studentName}
                            </p>

                            <div className="mt-5 h-px bg-white/10" />

                            <p className="mt-4 text-xs font-medium text-slate-400">
                              Successfully completed
                            </p>

                            <p className="mt-1 text-lg font-bold text-blue-200">
                              {certificate.course_name}
                            </p>

                          </div>

                          <div className="mt-6 flex items-end justify-between">

                            <div>

                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Issued
                              </p>

                              <p className="mt-1 text-sm font-semibold text-slate-300">
                                {getCertificateDate(
                                  certificate
                                )}
                              </p>

                            </div>

                            <div className="text-right">

                              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                Certificate ID
                              </p>

                              <p className="mt-1 text-xs font-bold text-slate-300">
                                {
                                  certificate.certificate_id
                                }
                              </p>

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* Card Actions */}

                      <div className="p-5">

                        <div className="flex flex-col gap-3 sm:flex-row">

                          <button
                            onClick={() =>
                              handleDownload(
                                certificate.certificate_id
                              )
                            }
                            disabled={
                              downloadingId ===
                              certificate.certificate_id
                            }
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {downloadingId ===
                            certificate.certificate_id
                              ? "Preparing PDF..."
                              : "⬇ Download Certificate"}
                          </button>

                          <Link
                            to="/learning"
                            className="flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                          >
                            📚 Learning
                          </Link>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>

            </section>

          )}

          {/* =====================================
              HOW CERTIFICATES WORK
          ====================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-extrabold text-slate-900">
              How to Earn a Certificate
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Follow these simple steps to complete a course.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl bg-blue-50 p-5">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                  1
                </div>

                <h3 className="mt-4 font-extrabold text-slate-800">
                  Learn
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete all lessons in the selected
                  SkillBridge course.
                </p>

              </div>

              <div className="rounded-2xl bg-purple-50 p-5">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-xl text-white">
                  2
                </div>

                <h3 className="mt-4 font-extrabold text-slate-800">
                  Pass
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Complete the required quiz with the
                  required passing score.
                </p>

              </div>

              <div className="rounded-2xl bg-yellow-50 p-5">

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-500 text-xl text-white">
                  3
                </div>

                <h3 className="mt-4 font-extrabold text-slate-800">
                  Earn
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your SkillBridge certificate becomes
                  available after the requirements are met.
                </p>

              </div>

            </div>

          </section>

          {/* =====================================
              QUICK ACTIONS
          ====================================== */}

          <section className="grid gap-4 sm:grid-cols-3">

            <Link
              to="/learning"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                📚
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                Continue Learning
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Complete lessons and work toward your next certificate.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                Go to Learning →
              </span>

            </Link>

            <Link
              to="/quizzes"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-xl">
                📝
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                Take a Quiz
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Test your knowledge and improve your score.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                Take Quiz →
              </span>

            </Link>

            <Link
              to="/internships"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                💼
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                Find Internships
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Use your growing skills to explore opportunities.
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

export default Certificates