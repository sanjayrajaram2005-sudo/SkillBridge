import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const PASS_PERCENTAGE = 80

const quizzes = [
  {
    id: "python",
    title: "Python Basics",
    description:
      "Test your understanding of Python fundamentals, syntax and programming concepts.",
    icon: "🐍",
    color: "from-blue-500 to-indigo-600",
    questions: [
      {
        question: "Which keyword is used to define a function in Python?",
        options: ["function", "def", "func", "define"],
        answer: "def",
      },
      {
        question: "Which of the following is a Python list?",
        options: ["(1, 2, 3)", "[1, 2, 3]", "{1, 2, 3}", "<1, 2, 3>"],
        answer: "[1, 2, 3]",
      },
      {
        question: "Which symbol is used for a single-line comment in Python?",
        options: ["//", "/*", "#", "--"],
        answer: "#",
      },
      {
        question: "Which function is used to display output in Python?",
        options: ["echo()", "print()", "display()", "output()"],
        answer: "print()",
      },
      {
        question: "Which data type stores True or False values?",
        options: ["String", "Integer", "Boolean", "Float"],
        answer: "Boolean",
      },
    ],
  },

  {
    id: "c",
    title: "C Programming",
    description:
      "Check your knowledge of C programming, variables, operators and basic syntax.",
    icon: "💻",
    color: "from-orange-500 to-red-500",
    questions: [
      {
        question: "Which function is the starting point of a C program?",
        options: ["start()", "main()", "begin()", "run()"],
        answer: "main()",
      },
      {
        question: "Which symbol ends a statement in C?",
        options: [".", ":", ";", ","],
        answer: ";",
      },
      {
        question: "Which data type is used to store an integer?",
        options: ["float", "char", "int", "double"],
        answer: "int",
      },
      {
        question: "Which header file is commonly used for printf()?",
        options: ["stdlib.h", "stdio.h", "string.h", "math.h"],
        answer: "stdio.h",
      },
      {
        question: "Which operator is used to assign a value?",
        options: ["==", "=", "!=", "=>"],
        answer: "=",
      },
    ],
  },

  {
    id: "java",
    title: "Java Basics",
    description:
      "Test your knowledge of Java syntax, classes, objects and programming fundamentals.",
    icon: "☕",
    color: "from-red-500 to-orange-600",
    questions: [
      {
        question: "Which keyword is used to create a class in Java?",
        options: ["class", "struct", "object", "define"],
        answer: "class",
      },
      {
        question: "Which method is the entry point of a Java application?",
        options: ["start()", "run()", "main()", "execute()"],
        answer: "main()",
      },
      {
        question: "Which keyword is used to inherit a class in Java?",
        options: ["inherits", "extends", "implements", "super"],
        answer: "extends",
      },
      {
        question: "Which data type is used for whole numbers?",
        options: ["String", "boolean", "int", "char"],
        answer: "int",
      },
      {
        question: "Which keyword creates an object in Java?",
        options: ["create", "object", "new", "make"],
        answer: "new",
      },
    ],
  },

  {
    id: "aptitude",
    title: "Aptitude",
    description:
      "Practice numerical reasoning and basic quantitative aptitude questions.",
    icon: "🧠",
    color: "from-purple-500 to-pink-600",
    questions: [
      {
        question: "What is 20% of 150?",
        options: ["20", "25", "30", "35"],
        answer: "30",
      },
      {
        question: "If a product costs ₹500 and has a 10% discount, what is the selling price?",
        options: ["₹450", "₹460", "₹475", "₹490"],
        answer: "₹450",
      },
      {
        question: "What is the average of 10, 20 and 30?",
        options: ["15", "20", "25", "30"],
        answer: "20",
      },
      {
        question: "If 5 workers complete a task in 10 days, how many worker-days are required?",
        options: ["15", "25", "50", "100"],
        answer: "50",
      },
      {
        question: "What is the next number: 2, 4, 8, 16, ?",
        options: ["20", "24", "30", "32"],
        answer: "32",
      },
    ],
  },
]

function Quizzes() {
  const navigate = useNavigate()

  const [selectedQuiz, setSelectedQuiz] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [score, setScore] = useState(0)
  const [quizFinished, setQuizFinished] = useState(false)

  const [quizResults, setQuizResults] = useState([])
  const [loadingResults, setLoadingResults] = useState(true)
  const [submitting, setSubmitting] = useState(false)

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
     LOAD QUIZ RESULTS
  ====================================== */

  const loadQuizResults = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setLoadingResults(true)

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

      if (!response.ok) {
        throw new Error("Unable to load quiz results.")
      }

      const data = await response.json()

      const results = Array.isArray(data) ? data : []

      setQuizResults(results)

      localStorage.setItem(
        "quizResults",
        JSON.stringify(results)
      )
    } catch (error) {
      console.error("Unable to load quiz results:", error)

      try {
        const cached = JSON.parse(
          localStorage.getItem("quizResults") || "[]"
        )

        setQuizResults(
          Array.isArray(cached) ? cached : []
        )
      } catch {
        setQuizResults([])
      }
    } finally {
      setLoadingResults(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    loadQuizResults()
  }, [loadQuizResults])

  /* =====================================
     START QUIZ
  ====================================== */

  const startQuiz = (quiz) => {
    setSelectedQuiz(quiz)
    setCurrentQuestion(0)
    setAnswers({})
    setScore(0)
    setQuizFinished(false)
    setError("")

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  /* =====================================
     SELECT ANSWER
  ====================================== */

  const selectAnswer = (answer) => {
    setAnswers((previous) => ({
      ...previous,
      [currentQuestion]: answer,
    }))
  }

  /* =====================================
     NEXT / FINISH
  ====================================== */

  const handleNext = async () => {
    if (!selectedQuiz) {
      return
    }

    if (!answers[currentQuestion]) {
      setError("Please select an answer before continuing.")
      return
    }

    setError("")

    if (
      currentQuestion <
      selectedQuiz.questions.length - 1
    ) {
      setCurrentQuestion((previous) => previous + 1)
      return
    }

    /* Calculate final score */

    let finalScore = 0

    selectedQuiz.questions.forEach(
      (question, index) => {
        if (answers[index] === question.answer) {
          finalScore += 1
        }
      }
    )

    const totalQuestions =
      selectedQuiz.questions.length

    const percentage = Math.round(
      (finalScore / totalQuestions) * 100
    )

    const passed =
      percentage >= PASS_PERCENTAGE

    setScore(finalScore)
    setQuizFinished(true)
    setSubmitting(true)

    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    try {
      const response = await fetch(
        `${API_URL}/quiz-results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            quiz_name: selectedQuiz.title,
            score: finalScore,
            total_questions: totalQuestions,
            percentage,
            passed,
          }),
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        const data = await response.json()

        throw new Error(
          data.detail ||
            "Unable to save quiz result."
        )
      }

      await loadQuizResults()
    } catch (error) {
      console.error(
        "Unable to save quiz result:",
        error
      )

      setError(
        "Quiz completed, but the result could not be saved to the server."
      )
    } finally {
      setSubmitting(false)
    }
  }

  /* =====================================
     RETRY
  ====================================== */

  const retryQuiz = () => {
    if (!selectedQuiz) {
      return
    }

    setCurrentQuestion(0)
    setAnswers({})
    setScore(0)
    setQuizFinished(false)
    setError("")
    setSubmitting(false)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  /* =====================================
     BACK TO QUIZZES
  ====================================== */

  const backToQuizzes = () => {
    setSelectedQuiz(null)
    setCurrentQuestion(0)
    setAnswers({})
    setScore(0)
    setQuizFinished(false)
    setError("")
    setSubmitting(false)

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  /* =====================================
     RESULT HELPERS
  ====================================== */

  const getLatestResult = (quizTitle) => {
    const matchingResults = quizResults.filter(
      (result) =>
        result.quiz_name === quizTitle
    )

    if (matchingResults.length === 0) {
      return null
    }

    return matchingResults[
      matchingResults.length - 1
    ]
  }

  const getResultPercentage = (result) => {
    if (!result) {
      return 0
    }

    if (
      typeof result.percentage === "number"
    ) {
      return result.percentage
    }

    if (
      result.total_questions > 0
    ) {
      return Math.round(
        (result.score / result.total_questions) *
          100
      )
    }

    return 0
  }

  /* =====================================
     DASHBOARD STATS
  ====================================== */

  const attemptedCount = new Set(
    quizResults.map(
      (result) => result.quiz_name
    )
  ).size

  const passedCount = quizResults.filter(
    (result) =>
      result.passed === true ||
      result.passed === 1 ||
      getResultPercentage(result) >=
        PASS_PERCENTAGE
  ).length

  const averageScore =
    quizResults.length > 0
      ? Math.round(
          quizResults.reduce(
            (total, result) =>
              total +
              getResultPercentage(result),
            0
          ) / quizResults.length
        )
      : 0

  /* =====================================
     QUIZ SCREEN
  ====================================== */

  if (selectedQuiz) {
    const question =
      selectedQuiz.questions[currentQuestion]

    const totalQuestions =
      selectedQuiz.questions.length

    const progress = quizFinished
      ? 100
      : Math.round(
          ((currentQuestion + 1) /
            totalQuestions) *
            100
        )

    const finalPercentage = Math.round(
      (score / totalQuestions) * 100
    )

    const passed =
      finalPercentage >= PASS_PERCENTAGE

    return (
      <div className="min-h-screen bg-slate-100">

        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">

            <button
              onClick={backToQuizzes}
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              ← Back to Quizzes
            </button>

            <Link
              to="/dashboard"
              className="text-xl font-extrabold tracking-tight text-slate-900"
            >
              Skill
              <span className="text-blue-600">
                Bridge
              </span>
            </Link>

          </div>

        </header>

        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">

          {/* QUIZ HEADER */}

          <section
            className={`overflow-hidden rounded-3xl bg-gradient-to-br ${selectedQuiz.color} p-6 text-white shadow-xl sm:p-8`}
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                  {selectedQuiz.icon}
                </div>

                <h1 className="mt-5 text-2xl font-extrabold sm:text-3xl">
                  {selectedQuiz.title}
                </h1>

                <p className="mt-2 text-sm text-white/80">
                  {quizFinished
                    ? "Quiz completed"
                    : `Question ${
                        currentQuestion + 1
                      } of ${totalQuestions}`}
                </p>

              </div>

              {!quizFinished && (
                <div className="rounded-2xl bg-white/10 px-4 py-3 text-center backdrop-blur">

                  <p className="text-xs font-bold text-white/70">
                    Progress
                  </p>

                  <p className="mt-1 text-xl font-extrabold">
                    {progress}%
                  </p>

                </div>
              )}

            </div>

            {!quizFinished && (
              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/20">

                <div
                  className="h-full rounded-full bg-white transition-all duration-500"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>
            )}

          </section>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              ⚠️ {error}
            </div>
          )}

          {/* RESULT */}

          {quizFinished ? (

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-10">

              <div
                className={`mx-auto flex h-24 w-24 items-center justify-center rounded-full text-4xl ${
                  passed
                    ? "bg-green-100"
                    : "bg-orange-100"
                }`}
              >
                {passed ? "🏆" : "📚"}
              </div>

              <p
                className={`mt-5 text-sm font-extrabold uppercase tracking-wider ${
                  passed
                    ? "text-green-600"
                    : "text-orange-600"
                }`}
              >
                {passed
                  ? "Quiz Passed"
                  : "Keep Practicing"}
              </p>

              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
                {score} / {totalQuestions}
              </h2>

              <p className="mt-2 text-slate-500">
                You scored{" "}
                <span className="font-extrabold text-slate-800">
                  {finalPercentage}%
                </span>
              </p>

              <div className="mx-auto mt-7 max-w-md">

                <div className="h-4 overflow-hidden rounded-full bg-slate-100">

                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      passed
                        ? "bg-green-500"
                        : "bg-orange-500"
                    }`}
                    style={{
                      width: `${finalPercentage}%`,
                    }}
                  />

                </div>

              </div>

              <div className="mx-auto mt-6 max-w-md rounded-2xl bg-slate-50 p-4">

                <p className="text-sm font-semibold text-slate-600">
                  Passing score:{" "}
                  <span className="font-extrabold text-slate-900">
                    {PASS_PERCENTAGE}%
                  </span>
                </p>

                {passed ? (
                  <p className="mt-2 text-sm leading-6 text-green-700">
                    Great work! Your result has been
                    saved to your SkillBridge profile.
                  </p>
                ) : (
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Review the topic and try the quiz
                    again to improve your score.
                  </p>
                )}

              </div>

              {submitting && (
                <p className="mt-4 text-xs font-semibold text-slate-400">
                  Saving your result...
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">

                <button
                  onClick={retryQuiz}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  🔄 Retry Quiz
                </button>

                <button
                  onClick={backToQuizzes}
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Choose Another Quiz
                </button>

                <Link
                  to="/dashboard"
                  className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Dashboard
                </Link>

              </div>

            </section>

          ) : (

            /* QUESTION */

            <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">

              <div className="flex items-center justify-between">

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  Question {currentQuestion + 1}
                </span>

                <span className="text-sm font-bold text-slate-400">
                  {totalQuestions} Questions
                </span>

              </div>

              <h2 className="mt-7 text-xl font-extrabold leading-8 text-slate-900 sm:text-2xl">
                {question.question}
              </h2>

              <div className="mt-7 space-y-3">

                {question.options.map(
                  (option, index) => {

                    const selected =
                      answers[
                        currentQuestion
                      ] === option

                    return (
                      <button
                        key={option}
                        onClick={() =>
                          selectAnswer(
                            option
                          )
                        }
                        className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                          selected
                            ? "border-blue-500 bg-blue-50 shadow-sm"
                            : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                        }`}
                      >

                        <span
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                            selected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {String.fromCharCode(
                            65 + index
                          )}
                        </span>

                        <span
                          className={`text-sm font-bold ${
                            selected
                              ? "text-blue-900"
                              : "text-slate-700"
                          }`}
                        >
                          {option}
                        </span>

                        {selected && (
                          <span className="ml-auto text-lg text-blue-600">
                            ✓
                          </span>
                        )}

                      </button>
                    )
                  }
                )}

              </div>

              <div className="mt-8 flex justify-end">

                <button
                  onClick={handleNext}
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-7 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {currentQuestion ===
                  totalQuestions - 1
                    ? "Finish Quiz"
                    : "Next Question →"}
                </button>

              </div>

            </section>
          )}

        </main>

      </div>
    )
  }

  /* =====================================
     MAIN QUIZZES PAGE
  ====================================== */

  return (
    <div className="min-h-screen bg-slate-100">

      {/* DESKTOP SIDEBAR */}

      <aside className="fixed left-0 top-0 hidden h-screen w-64 bg-slate-950 text-white shadow-2xl lg:block">

        <div className="flex h-full flex-col">

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
              className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30"
            >
              📝 Quizzes
            </Link>

            <Link
              to="/certificates"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
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
              🚪 Logout
            </button>

          </div>

        </div>

      </aside>

      {/* MAIN */}

      <main className="lg:ml-64">

        {/* HEADER */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Test Your Knowledge
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Quizzes
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
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
            >
              📝 Quizzes
            </Link>

            <Link
              to="/certificates"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
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
              className="flex shrink-0 items-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-600"
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
                🧠 Test your knowledge
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Learn. Practice. Improve.
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Take quick quizzes to test your knowledge,
                track your performance and identify areas
                where you can improve.
              </p>

            </div>

          </section>

          {/* STATS */}

          <div className="grid gap-4 sm:grid-cols-3">

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Quizzes Attempted
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loadingResults
                      ? "..."
                      : attemptedCount}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl">
                  📝
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Passed Attempts
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loadingResults
                      ? "..."
                      : passedCount}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-100 text-xl">
                  🏆
                </div>

              </div>

            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    Average Score
                  </p>

                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {loadingResults
                      ? "..."
                      : `${averageScore}%`}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 text-xl">
                  📈
                </div>

              </div>

            </div>

          </div>

          {/* QUIZZES */}

          <section>

            <div className="mb-5">

              <h2 className="text-2xl font-extrabold text-slate-900">
                Available Quizzes
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Choose a topic and test your knowledge.
              </p>

            </div>

            <div className="grid gap-6 md:grid-cols-2">

              {quizzes.map((quiz) => {

                const latestResult =
                  getLatestResult(
                    quiz.title
                  )

                const latestPercentage =
                  getResultPercentage(
                    latestResult
                  )

                const latestPassed =
                  latestPercentage >=
                  PASS_PERCENTAGE

                return (
                  <div
                    key={quiz.id}
                    className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                  >

                    <div
                      className={`bg-gradient-to-br ${quiz.color} p-6 text-white`}
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl backdrop-blur">
                          {quiz.icon}
                        </div>

                        {latestResult && (
                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur ${
                              latestPassed
                                ? "bg-green-400/20 text-white"
                                : "bg-white/15 text-white"
                            }`}
                          >
                            {latestPassed
                              ? "✓ Passed"
                              : "Attempted"}
                          </span>
                        )}

                      </div>

                      <h3 className="mt-6 text-2xl font-extrabold">
                        {quiz.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-white/80">
                        {quiz.description}
                      </p>

                    </div>

                    <div className="p-6">

                      <div className="flex flex-wrap gap-2">

                        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                          📝 {quiz.questions.length} Questions
                        </span>

                        <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
                          🎯 Pass: {PASS_PERCENTAGE}%
                        </span>

                      </div>

                      {latestResult && (
                        <div className="mt-5 rounded-2xl bg-slate-50 p-4">

                          <div className="flex items-center justify-between">

                            <div>

                              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                                Latest Score
                              </p>

                              <p className="mt-1 text-xl font-extrabold text-slate-900">
                                {latestResult.score}/
                                {
                                  latestResult.total_questions
                                }
                              </p>

                            </div>

                            <div className="text-right">

                              <p className="text-2xl font-extrabold text-blue-600">
                                {latestPercentage}%
                              </p>

                              <p
                                className={`text-xs font-bold ${
                                  latestPassed
                                    ? "text-green-600"
                                    : "text-orange-600"
                                }`}
                              >
                                {latestPassed
                                  ? "Passed"
                                  : "Try Again"}
                              </p>

                            </div>

                          </div>

                          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">

                            <div
                              className={`h-full rounded-full ${
                                latestPassed
                                  ? "bg-green-500"
                                  : "bg-orange-500"
                              }`}
                              style={{
                                width: `${latestPercentage}%`,
                              }}
                            />

                          </div>

                        </div>
                      )}

                      <button
                        onClick={() =>
                          startQuiz(quiz)
                        }
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                      >
                        {latestResult
                          ? "Retake Quiz"
                          : "Start Quiz"}
                        <span>→</span>
                      </button>

                    </div>

                  </div>
                )
              })}

            </div>

          </section>

          {/* TIPS */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <h2 className="text-xl font-extrabold text-slate-900">
              Quiz Tips
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A few simple ways to get better results
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl bg-blue-50 p-5">

                <div className="text-2xl">
                  📖
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Revise first
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Review your course lessons before
                  attempting a quiz.
                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-5">

                <div className="text-2xl">
                  🧘
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Take your time
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Read every question carefully before
                  selecting your answer.
                </p>

              </div>

              <div className="rounded-2xl bg-purple-50 p-5">

                <div className="text-2xl">
                  🔄
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Learn from mistakes
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  If you don't pass, review the topic
                  and attempt the quiz again.
                </p>

              </div>

            </div>

          </section>

          {/* QUICK ACTIONS */}

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
                Continue your Python course.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                Go to Learning →
              </span>

            </Link>

            <Link
              to="/certificates"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-xl">
                🏆
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                My Certificates
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                View your earned certificates.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                View Certificates →
              </span>

            </Link>

            <Link
              to="/dashboard"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-xl">
                🏠
              </div>

              <h3 className="mt-4 font-extrabold text-slate-800">
                Dashboard
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Return to your SkillBridge overview.
              </p>

              <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                Dashboard →
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

export default Quizzes