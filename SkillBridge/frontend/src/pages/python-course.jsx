import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const COURSE_NAME = "Python Programming"
const QUIZ_NAME = "Python Basics"

function PythonCourse() {
  const navigate = useNavigate()

  const lesson2Ref = useRef(null)
  const lesson3Ref = useRef(null)
  const lesson4Ref = useRef(null)
  const lesson5Ref = useRef(null)
  const lesson6Ref = useRef(null)
  const lesson7Ref = useRef(null)
  const lesson8Ref = useRef(null)
  const lesson9Ref = useRef(null)
  const lesson10Ref = useRef(null)

  const [completed, setCompleted] = useState([])
  const [answers, setAnswers] = useState({})
  const [quizResult, setQuizResult] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [certificateCreated, setCertificateCreated] =
    useState(false)

  // ==========================================
  // FINAL QUIZ
  // ==========================================

  const finalQuiz = [
    {
      question:
        "1. Which function is used to display output in Python?",
      options: [
        "input()",
        "print()",
        "display()",
        "output()",
      ],
      answer: "print()",
    },

    {
      question:
        "2. Which data type is used to store True or False?",
      options: [
        "String",
        "Integer",
        "Boolean",
        "Float",
      ],
      answer: "Boolean",
    },

    {
      question:
        "3. Which keyword is used to define a function?",
      options: [
        "function",
        "define",
        "def",
        "func",
      ],
      answer: "def",
    },

    {
      question:
        "4. Which collection stores data using key-value pairs?",
      options: [
        "List",
        "Tuple",
        "Set",
        "Dictionary",
      ],
      answer: "Dictionary",
    },

    {
      question:
        "5. Which keyword is used to handle errors in Python?",
      options: [
        "error",
        "try",
        "catch",
        "handle",
      ],
      answer: "try",
    },
  ]

  // ==========================================
  // HANDLE UNAUTHORIZED
  // ==========================================

  const handleUnauthorized = () => {
    localStorage.removeItem("accessToken")
    localStorage.removeItem("isLoggedIn")

    navigate("/login", {
      replace: true,
      state: {
        message:
          "Your login session has expired. Please log in again.",
      },
    })
  }

  // ==========================================
  // LOAD COURSE DATA
  // ==========================================

  useEffect(() => {
    const loadCourseData = async () => {
      const token =
        localStorage.getItem("accessToken")

      if (!token) {
        setLoading(false)

        navigate("/login", {
          replace: true,
          state: {
            message:
              "Please log in to access your Python course.",
          },
        })

        return
      }

      try {
        setLoading(true)
        setError("")

        // ==========================================
        // LOAD COURSE PROGRESS
        // ==========================================

        const progressResponse = await fetch(
          `${API_URL}/course-progress/${encodeURIComponent(
            COURSE_NAME
          )}`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        )

        if (progressResponse.status === 401) {
          handleUnauthorized()
          return
        }

        if (!progressResponse.ok) {
          throw new Error(
            "Unable to load course progress."
          )
        }

        const progressData =
          await progressResponse.json()

        const lessons = Array.isArray(
          progressData.completed_lessons
        )
          ? progressData.completed_lessons
          : []

        setCompleted(lessons)

        localStorage.setItem(
          "pythonCompletedLessons",
          JSON.stringify(lessons)
        )

        // ==========================================
        // LOAD QUIZ RESULTS
        // ==========================================

        try {
          const quizResponse = await fetch(
            `${API_URL}/quiz-results`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          )

          if (quizResponse.status === 401) {
            handleUnauthorized()
            return
          }

          if (quizResponse.ok) {
            const quizData =
              await quizResponse.json()

            const pythonQuizResults =
              Array.isArray(quizData)
                ? quizData.filter(
                    (quiz) =>
                      quiz.quiz_name === QUIZ_NAME
                  )
                : []

            if (pythonQuizResults.length > 0) {
              const latestQuiz =
                pythonQuizResults[
                  pythonQuizResults.length - 1
                ]

              setQuizResult({
                score: Number(latestQuiz.score),
                percentage: Number(
                  latestQuiz.percentage
                ),
                passed:
                  Boolean(latestQuiz.passed) ||
                  Number(latestQuiz.percentage) >= 80,
              })
            }

            const formattedQuizzes =
              Array.isArray(quizData)
                ? quizData.map((quiz) => ({
                    id: quiz.id,
                    quiz: quiz.quiz_name,
                    score: quiz.score,
                    total: quiz.total_questions,
                    percentage: quiz.percentage,
                    passed: quiz.passed,
                    completed: true,
                  }))
                : []

            localStorage.setItem(
              "quizResults",
              JSON.stringify(formattedQuizzes)
            )
          }
        } catch (quizError) {
          console.error(
            "Unable to load quiz results:",
            quizError
          )
        }
      } catch (error) {
        console.error(
          "Unable to load course data:",
          error
        )

        setError(
          "Unable to load your course data. Please make sure the backend is running."
        )
      } finally {
        setLoading(false)
      }
    }

    loadCourseData()
  }, [])

  // ==========================================
  // COURSE PROGRESS
  // ==========================================

  const progress = Math.min(
    100,
    Math.round(
      (completed.length / 10) * 100
    )
  )

  // ==========================================
  // CHECK LESSON COMPLETION
  // ==========================================

  const isCompleted = (lesson) =>
    completed.includes(lesson)

  // ==========================================
  // SAVE LESSON PROGRESS
  // ==========================================

  const markComplete = async (lesson) => {
    const token =
      localStorage.getItem("accessToken")

    if (!token) {
      handleUnauthorized()
      return
    }

    if (completed.includes(lesson)) {
      return
    }

    // ==========================================
    // LESSON 10 REQUIREMENTS
    // ==========================================

    if (lesson === 10) {
      const previousLessonsCompleted =
        [1, 2, 3, 4, 5, 6, 7, 8, 9].every(
          (lessonNumber) =>
            completed.includes(lessonNumber)
        )

      if (!previousLessonsCompleted) {
        alert(
          "Please complete Lessons 1–9 before completing Lesson 10."
        )
        return
      }

      if (
        !quizResult ||
        !quizResult.passed
      ) {
        alert(
          "Please pass the Final Quiz with at least 80% first."
        )
        return
      }
    }

    const updatedCompleted = [
      ...completed,
      lesson,
    ].sort((a, b) => a - b)

    setSaving(true)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/course-progress/${encodeURIComponent(
          COURSE_NAME
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            completed_lessons:
              updatedCompleted,
          }),
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save course progress."
        )
      }

      const savedLessons =
        Array.isArray(
          data.completed_lessons
        )
          ? data.completed_lessons
          : updatedCompleted

      setCompleted(savedLessons)

      localStorage.setItem(
        "pythonCompletedLessons",
        JSON.stringify(savedLessons)
      )

      // ==========================================
      // COURSE COMPLETION CACHE
      // ==========================================

      if (savedLessons.length === 10) {
        localStorage.setItem(
          "courseResults",
          JSON.stringify([
            {
              course: COURSE_NAME,
              completed: true,
              completedLessons:
                savedLessons,
              completedAt:
                new Date().toISOString(),
            },
          ])
        )
      }

      // ==========================================
      // CREATE CERTIFICATE
      // ==========================================

      if (
        savedLessons.length === 10 &&
        quizResult &&
        quizResult.passed
      ) {
        await createCertificate(token)
      }
    } catch (error) {
      console.error(
        "Unable to save course progress:",
        error
      )

      setError(
        error.message ||
          "Unable to save course progress."
      )

      alert(
        error.message ||
          "Unable to save course progress."
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // CREATE CERTIFICATE
  // ==========================================

  const createCertificate = async (token) => {
    try {
      const response = await fetch(
        `${API_URL}/certificates/${encodeURIComponent(
          COURSE_NAME
        )}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create certificate."
        )
      }

      setCertificateCreated(true)

      return data
    } catch (error) {
      console.error(
        "Certificate creation error:",
        error
      )

      setError(
        error.message ||
          "Course completed, but the certificate could not be created."
      )
    }
  }

  // ==========================================
  // SCROLL TO LESSON
  // ==========================================

  const scrollToLesson = (ref) => {
    ref.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  // ==========================================
  // HANDLE QUIZ ANSWER
  // ==========================================

  const handleAnswer = (
    questionIndex,
    answer
  ) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionIndex]: answer,
    }))
  }

  // ==========================================
  // SUBMIT FINAL QUIZ
  // ==========================================

  const submitQuiz = async () => {
    const token =
      localStorage.getItem("accessToken")

    if (
      Object.keys(answers).length !==
      finalQuiz.length
    ) {
      alert(
        "Please answer all 5 questions before submitting the quiz."
      )
      return
    }

    if (!token) {
      handleUnauthorized()
      return
    }

    let score = 0

    finalQuiz.forEach(
      (question, index) => {
        if (
          answers[index] ===
          question.answer
        ) {
          score++
        }
      }
    )

    const percentage = Math.round(
      (score / finalQuiz.length) * 100
    )

    const passed =
      percentage >= 80

    setSaving(true)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/quiz-results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quiz_name: QUIZ_NAME,
            score: score,
            total_questions:
              finalQuiz.length,
            percentage: percentage,
            passed: passed,
          }),
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to save quiz result."
        )
      }

      const newQuizResult = {
        score: score,
        percentage: percentage,
        passed: passed,
      }

      setQuizResult(newQuizResult)

      // ==========================================
      // UPDATE LOCAL QUIZ CACHE
      // ==========================================

      let existingResults = []

      try {
        existingResults =
          JSON.parse(
            localStorage.getItem(
              "quizResults"
            )
          ) || []
      } catch (error) {
        existingResults = []
      }

      const newResult = {
        id: data.id,
        quiz: QUIZ_NAME,
        score: score,
        total: finalQuiz.length,
        percentage: percentage,
        passed: passed,
        completed: true,
      }

      const filteredResults =
        existingResults.filter(
          (quiz) =>
            quiz.quiz !== QUIZ_NAME
        )

      localStorage.setItem(
        "quizResults",
        JSON.stringify([
          ...filteredResults,
          newResult,
        ])
      )

      alert(
        passed
          ? "🎉 Quiz passed and result saved successfully!"
          : "Quiz result saved. You need at least 80% to pass."
      )

      // ==========================================
      // IF COURSE IS ALREADY COMPLETE,
      // CREATE CERTIFICATE
      // ==========================================

      if (
        passed &&
        completed.length === 10
      ) {
        await createCertificate(token)
      }
    } catch (error) {
      console.error(
        "Quiz save error:",
        error
      )

      setError(
        error.message ||
          "Unable to save quiz result."
      )

      alert(
        error.message ||
          "Unable to save quiz result."
      )
    } finally {
      setSaving(false)
    }
  }

  // ==========================================
  // RESET QUIZ
  // ==========================================

  const resetQuiz = () => {
    setAnswers({})
    setQuizResult(null)
    setCertificateCreated(false)
  }

  // ==========================================
  // COMPLETE LESSON 10
  // ==========================================

  const completeLesson10 = async () => {
    const previousLessonsCompleted =
      [1, 2, 3, 4, 5, 6, 7, 8, 9].every(
        (lessonNumber) =>
          completed.includes(
            lessonNumber
          )
      )

    if (!previousLessonsCompleted) {
      alert(
        "Please complete Lessons 1–9 before completing Lesson 10."
      )
      return
    }

    if (
      !quizResult ||
      !quizResult.passed
    ) {
      alert(
        "Please pass the Final Quiz with at least 80% first."
      )
      return
    }

    await markComplete(10)
  }

  // ==========================================
  // LOADING SCREEN
  // ==========================================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">

        <div className="rounded-xl bg-white p-8 text-center shadow">

          <div className="mb-3 text-3xl">
            📚
          </div>

          <p className="text-lg font-semibold text-slate-800">
            Loading your course progress...
          </p>

          <p className="mt-2 text-sm text-slate-500">
            Please wait a moment.
          </p>

        </div>

      </div>
    )
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ========================================
          HEADER
      ======================================== */}

      <header className="bg-blue-600 px-8 py-5 text-white">

        <div className="mx-auto flex max-w-5xl items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold">
              SkillBridge
            </h1>

            <p className="mt-1 text-sm text-blue-100">
              Python Programming Course
            </p>

          </div>

          <button
            onClick={() =>
              navigate("/learning")
            }
            className="rounded-lg border border-blue-300 px-4 py-2 text-sm font-semibold transition hover:bg-blue-700"
          >
            ← Learning
          </button>

        </div>

      </header>

      <main className="mx-auto max-w-5xl p-8">

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (

          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">

            <p className="font-semibold">
              Something went wrong
            </p>

            <p className="mt-1 text-sm">
              {error}
            </p>

          </div>

        )}

        {/* ========================================
            SAVING
        ======================================== */}

        {saving && (

          <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-700">

            <p className="font-semibold">
              Saving your progress...
            </p>

          </div>

        )}

        {/* ========================================
            CERTIFICATE CREATED
        ======================================== */}

        {certificateCreated && (

          <div className="mb-6 rounded-xl border border-emerald-300 bg-emerald-50 p-5">

            <h3 className="text-lg font-bold text-emerald-700">
              🏆 Certificate Earned!
            </h3>

            <p className="mt-1 text-sm text-emerald-700">
              Congratulations! Your Python Programming
              certificate has been created successfully.
            </p>

            <button
              onClick={() =>
                navigate("/certificates")
              }
              className="mt-4 rounded-lg bg-emerald-600 px-5 py-2 font-semibold text-white transition hover:bg-emerald-700"
            >
              View Certificate →
            </button>

          </div>

        )}

        {/* ========================================
            COURSE HEADER
        ======================================== */}

        <div className="mb-8 rounded-xl bg-white p-6 shadow">

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div>

              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
                Course
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-800">
                Python Programming
              </h2>

              <p className="mt-2 text-slate-600">
                Learn Python from basics to advanced concepts.
              </p>

            </div>

            <div className="rounded-xl bg-blue-50 px-5 py-4 text-center">

              <p className="text-sm text-slate-500">
                Progress
              </p>

              <p className="mt-1 text-2xl font-bold text-blue-600">
                {progress}%
              </p>

            </div>

          </div>

          {/* PROGRESS */}

          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">

            <div className="mb-2 flex items-center justify-between">

              <span className="font-semibold text-slate-800">
                Course Progress
              </span>

              <span className="font-bold text-blue-600">
                {completed.length}/10 Lessons
              </span>

            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">

              <div
                className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${progress}%`,
                }}
              ></div>

            </div>

          </div>

        </div>

        {/* ========================================
            LESSON NAVIGATION
        ======================================== */}

        <div className="mb-8 rounded-xl bg-white p-6 shadow">

          <h3 className="mb-4 text-xl font-bold text-slate-800">
            Course Lessons
          </h3>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

            <button
              onClick={() =>
                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                })
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                1. Python Basics
              </span>

              {isCompleted(1) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson2Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                2. Variables and Data Types
              </span>

              {isCompleted(2) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson3Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                3. Conditions and Loops
              </span>

              {isCompleted(3) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson4Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                4. Functions
              </span>

              {isCompleted(4) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson5Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                5. Lists, Tuples and Sets
              </span>

              {isCompleted(5) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson6Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                6. Dictionaries
              </span>

              {isCompleted(6) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson7Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                7. Strings and File Handling
              </span>

              {isCompleted(7) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson8Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                8. Object-Oriented Programming
              </span>

              {isCompleted(8) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson9Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                9. Error Handling and Modules
              </span>

              {isCompleted(9) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

            <button
              onClick={() =>
                scrollToLesson(lesson10Ref)
              }
              className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-left transition hover:bg-blue-50"
            >
              <span>
                10. Mini Project and Final Quiz
              </span>

              {isCompleted(10) && (
                <span className="font-bold text-green-600">
                  ✓
                </span>
              )}
            </button>

          </div>

        </div>

        {/* ========================================
            LESSON 1
        ======================================== */}

        <div className="mb-6 rounded-xl bg-white p-6 shadow">

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 1: Python Basics
          </h3>

          <p className="mb-4 text-gray-700">
            Python is a high-level programming language known
            for its simple syntax and readability.
          </p>

          <h4 className="mb-2 font-bold">
            Your first Python program:
          </h4>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`print("Hello, World!")`}
          </pre>

          <p className="mb-4 text-gray-700">
            The <strong>print()</strong> function displays
            information on the screen.
          </p>

          <button
            onClick={() => markComplete(1)}
            disabled={
              saving || isCompleted(1)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(1)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(1)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 2
        ======================================== */}

        <div
          ref={lesson2Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 2: Variables and Data Types
          </h3>

          <p className="mb-4 text-gray-700">
            Variables are used to store data in Python.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`name = "Sanjay"
age = 21
height = 5.8
is_student = True

print(name)
print(age)
print(height)
print(is_student)`}
          </pre>

          <p className="mb-4 text-gray-700">
            Common Python data types include String,
            Integer, Float and Boolean.
          </p>

          <button
            onClick={() => markComplete(2)}
            disabled={
              saving || isCompleted(2)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(2)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(2)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 3
        ======================================== */}

        <div
          ref={lesson3Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 3: Conditions and Loops
          </h3>

          <p className="mb-4 text-gray-700">
            Conditions allow Python programs to make decisions.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`age = 20

if age >= 18:
    print("Adult")
else:
    print("Minor")`}
          </pre>

          <h4 className="mb-2 font-bold">
            For loop:
          </h4>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`for i in range(5):
    print(i)`}
          </pre>

          <button
            onClick={() => markComplete(3)}
            disabled={
              saving || isCompleted(3)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(3)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(3)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 4
        ======================================== */}

        <div
          ref={lesson4Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 4: Functions
          </h3>

          <p className="mb-4 text-gray-700">
            Functions are reusable blocks of code.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`def greet(name):
    print("Hello", name)

greet("Sanjay")`}
          </pre>

          <p className="mb-4 text-gray-700">
            Functions help make programs organized and reusable.
          </p>

          <button
            onClick={() => markComplete(4)}
            disabled={
              saving || isCompleted(4)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(4)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(4)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 5
        ======================================== */}

        <div
          ref={lesson5Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 5: Lists, Tuples and Sets
          </h3>

          <p className="mb-4 text-gray-700">
            Python provides different collection types for
            storing multiple values.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`numbers = [10, 20, 30]
print(numbers)

colors = ("red", "green", "blue")
print(colors)

unique_numbers = {1, 2, 3, 3}
print(unique_numbers)`}
          </pre>

          <button
            onClick={() => markComplete(5)}
            disabled={
              saving || isCompleted(5)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(5)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(5)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 6
        ======================================== */}

        <div
          ref={lesson6Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 6: Dictionaries
          </h3>

          <p className="mb-4 text-gray-700">
            Dictionaries store information using key-value pairs.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`student = {
    "name": "Sanjay",
    "age": 21,
    "course": "ECE"
}

print(student["name"])
print(student["course"])`}
          </pre>

          <button
            onClick={() => markComplete(6)}
            disabled={
              saving || isCompleted(6)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(6)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(6)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 7
        ======================================== */}

        <div
          ref={lesson7Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 7: Strings and File Handling
          </h3>

          <p className="mb-4 text-gray-700">
            Strings are sequences of characters.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`message = "Python Programming"

print(message)
print(message.upper())
print(message.lower())`}
          </pre>

          <h4 className="mb-2 font-bold">
            File handling:
          </h4>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`with open("example.txt", "w") as file:
    file.write("Hello Python")`}
          </pre>

          <button
            onClick={() => markComplete(7)}
            disabled={
              saving || isCompleted(7)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(7)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(7)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 8
        ======================================== */}

        <div
          ref={lesson8Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 8: Object-Oriented Programming
          </h3>

          <p className="mb-4 text-gray-700">
            Object-Oriented Programming allows us to create
            classes and objects.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`class Student:
    def __init__(self, name):
        self.name = name

    def display(self):
        print(self.name)

student = Student("Sanjay")
student.display()`}
          </pre>

          <button
            onClick={() => markComplete(8)}
            disabled={
              saving || isCompleted(8)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(8)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(8)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 9
        ======================================== */}

        <div
          ref={lesson9Ref}
          className="mb-6 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 9: Error Handling and Modules
          </h3>

          <p className="mb-4 text-gray-700">
            Error handling prevents programs from crashing unexpectedly.
          </p>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`try:
    number = int(input("Enter a number: "))
    print(number)
except ValueError:
    print("Please enter a valid number.")`}
          </pre>

          <h4 className="mb-2 font-bold">
            Modules:
          </h4>

          <pre className="mb-4 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`import math

print(math.sqrt(25))`}
          </pre>

          <button
            onClick={() => markComplete(9)}
            disabled={
              saving || isCompleted(9)
            }
            className={`rounded-lg px-5 py-2 font-semibold text-white ${
              isCompleted(9)
                ? "cursor-not-allowed bg-green-600"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isCompleted(9)
              ? "Lesson Completed ✓"
              : "Mark Lesson Complete"}
          </button>

        </div>

        {/* ========================================
            LESSON 10
        ======================================== */}

        <div
          ref={lesson10Ref}
          className="mb-8 rounded-xl bg-white p-6 shadow"
        >

          <h3 className="mb-3 text-2xl font-bold text-slate-800">
            Lesson 10: Mini Project and Final Quiz
          </h3>

          <p className="mb-4 text-gray-700">
            In this final lesson, combine the Python concepts
            you learned to create a simple student management
            program.
          </p>

          <pre className="mb-6 overflow-x-auto rounded-lg bg-gray-900 p-4 text-white">
{`students = []

def add_student(name, age):
    student = {
        "name": name,
        "age": age
    }

    students.append(student)

add_student("Sanjay", 21)

for student in students:
    print(student)`}
          </pre>

          {/* ========================================
              FINAL QUIZ
          ======================================== */}

          <div className="border-t pt-6">

            <h4 className="mb-2 text-2xl font-bold">
              📝 Final Python Quiz
            </h4>

            <p className="mb-6 text-gray-600">
              Answer all 5 questions. You need at least
              4 correct answers to pass the quiz.
            </p>

            {finalQuiz.map(
              (question, index) => (

                <div
                  key={index}
                  className="mb-6 rounded-xl bg-gray-50 p-5"
                >

                  <p className="mb-4 font-bold text-gray-800">
                    {question.question}
                  </p>

                  <div className="space-y-2">

                    {question.options.map(
                      (option) => (

                        <label
                          key={option}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 ${
                            answers[index] === option
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:bg-gray-50"
                          }`}
                        >

                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={
                              answers[index] ===
                              option
                            }
                            onChange={() =>
                              handleAnswer(
                                index,
                                option
                              )
                            }
                          />

                          <span>
                            {option}
                          </span>

                        </label>

                      )
                    )}

                  </div>

                </div>

              )
            )}

            {/* SUBMIT */}

            {!quizResult && (

              <button
                onClick={submitQuiz}
                disabled={saving}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? "Saving Quiz..."
                  : "Submit Final Quiz"}
              </button>

            )}

            {/* ========================================
                QUIZ RESULT
            ======================================== */}

            {quizResult && (

              <div
                className={`mt-6 rounded-xl border p-6 ${
                  quizResult.passed
                    ? "border-green-300 bg-green-50"
                    : "border-red-300 bg-red-50"
                }`}
              >

                <h4
                  className={`mb-2 text-2xl font-bold ${
                    quizResult.passed
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {quizResult.passed
                    ? "🎉 Quiz Passed!"
                    : "❌ Quiz Failed"}
                </h4>

                <p
                  className={`font-semibold ${
                    quizResult.passed
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  Your Score:{" "}
                  {quizResult.score}/5 —{" "}
                  {quizResult.percentage}%
                </p>

                {quizResult.passed ? (

                  <p className="mt-2 text-green-700">
                    Excellent! Complete Lesson 10 to finish
                    the course.
                  </p>

                ) : (

                  <p className="mt-2 text-red-700">
                    You need at least 80% to pass.
                    Please try again.
                  </p>

                )}

                <button
                  onClick={resetQuiz}
                  disabled={saving}
                  className="mt-4 rounded-lg bg-gray-700 px-5 py-2 text-white transition hover:bg-gray-800 disabled:opacity-50"
                >
                  Try Quiz Again
                </button>

              </div>

            )}

          </div>

          {/* ========================================
              LESSON 10 COMPLETION
          ======================================== */}

          <div className="mt-8 border-t pt-6">

            <p className="mb-4 text-gray-700">
              Complete Lessons 1–9 and pass the final quiz
              with at least 80% to finish the Python Programming
              course.
            </p>

            <button
              onClick={completeLesson10}
              disabled={
                isCompleted(10) ||
                saving
              }
              className={`rounded-lg px-5 py-2 font-semibold text-white ${
                isCompleted(10)
                  ? "cursor-not-allowed bg-green-600"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isCompleted(10)
                ? "Lesson Completed ✓"
                : "Complete Lesson 10"}
            </button>

          </div>

        </div>

        {/* ========================================
            COURSE COMPLETED
        ======================================== */}

        {completed.length === 10 && (

          <div className="mb-8 rounded-xl border border-green-300 bg-green-100 p-6 text-center">

            <h3 className="mb-2 text-2xl font-bold text-green-700">
              🎉 Course Completed!
            </h3>

            <p className="text-green-700">
              You have successfully completed all 10
              Python lessons.
            </p>

            <p className="mt-2 font-semibold text-green-700">
              Final Quiz Passed ✓
            </p>

            <p className="mt-2 font-semibold text-green-700">
              Your course completion has been saved.
            </p>

            <button
              onClick={() =>
                navigate("/certificates")
              }
              className="mt-5 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              🏆 View Your Certificate
            </button>

          </div>

        )}

        {/* ========================================
            BACK TO LEARNING
        ======================================== */}

        <div className="flex flex-wrap justify-center gap-4">

          <button
            onClick={() =>
              navigate("/learning")
            }
            className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Back to Learning
          </button>

          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to Dashboard
          </button>

          {completed.length === 10 && (
            <button
              onClick={() =>
                navigate("/certificates")
              }
              className="rounded-lg bg-amber-500 px-5 py-3 font-semibold text-white transition hover:bg-amber-600"
            >
              🏆 Certificates
            </button>
          )}

        </div>

      </main>

    </div>
  )
}

export default PythonCourse