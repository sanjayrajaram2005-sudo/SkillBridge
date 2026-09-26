import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Skills() {
  const navigate = useNavigate()

  const [skills, setSkills] = useState([])
  const [skillName, setSkillName] = useState("")
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  /* =====================================
     AUTH CHECK
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
     LOAD SKILLS
  ====================================== */

  const loadSkills = useCallback(async () => {
    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/skills`,
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
          "Unable to load your skills."
        )
      }

      const data = await response.json()

      const loadedSkills = Array.isArray(data)
        ? data
        : []

      setSkills(loadedSkills)

      /* Keep local cache synchronized */

      localStorage.setItem(
        "skills",
        JSON.stringify(loadedSkills)
      )
    } catch (error) {
      console.error(
        "Unable to load skills:",
        error
      )

      setError(
        "Unable to load your skills. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  /* =====================================
     LOAD ON PAGE OPEN
  ====================================== */

  useEffect(() => {
    loadSkills()
  }, [loadSkills])

  /* =====================================
     ADD SKILL
  ====================================== */

  const handleAddSkill = async (event) => {
    event.preventDefault()

    const cleanedName = skillName.trim()

    setError("")
    setSuccess("")

    if (!cleanedName) {
      setError("Please enter a skill.")
      return
    }

    const duplicate = skills.some(
      (skill) =>
        String(skill.name).trim().toLowerCase() ===
        cleanedName.toLowerCase()
    )

    if (duplicate) {
      setError(
        "This skill has already been added."
      )
      return
    }

    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setAdding(true)

    try {
      const response = await fetch(
        `${API_URL}/skills`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: cleanedName,
          }),
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            "Unable to add this skill."
        )
        return
      }

      setSkillName("")

      setSuccess(
        `"${cleanedName}" added successfully!`
      )

      await loadSkills()

      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error) {
      console.error(
        "Unable to add skill:",
        error
      )

      setError(
        "Something went wrong while adding the skill."
      )
    } finally {
      setAdding(false)
    }
  }

  /* =====================================
     REMOVE SKILL
  ====================================== */

  const handleRemoveSkill = async (skillId) => {
    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    const skillToRemove = skills.find(
      (skill) => skill.id === skillId
    )

    const confirmRemove = window.confirm(
      `Remove "${
        skillToRemove?.name || "this skill"
      }" from your profile?`
    )

    if (!confirmRemove) {
      return
    }

    setRemovingId(skillId)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(
        `${API_URL}/skills/${skillId}`,
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

      const data = await response.json()

      if (!response.ok) {
        setError(
          data.detail ||
            "Unable to remove this skill."
        )
        return
      }

      const updatedSkills = skills.filter(
        (skill) => skill.id !== skillId
      )

      setSkills(updatedSkills)

      localStorage.setItem(
        "skills",
        JSON.stringify(updatedSkills)
      )

      setSuccess("Skill removed successfully.")

      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (error) {
      console.error(
        "Unable to remove skill:",
        error
      )

      setError(
        "Something went wrong while removing the skill."
      )
    } finally {
      setRemovingId(null)
    }
  }

  /* =====================================
     QUICK SKILLS
  ====================================== */

  const suggestedSkills = [
    "Python",
    "Java",
    "C",
    "JavaScript",
    "React",
    "HTML",
    "CSS",
    "SQL",
    "Git",
    "Figma",
    "UI/UX Design",
    "Communication",
  ]

  const addSuggestedSkill = (name) => {
    setSkillName(name)
    setError("")
    setSuccess("")
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
              <span className="text-lg transition group-hover:scale-110">
                🏠
              </span>

              Dashboard
            </Link>

            <Link
              to="/profile"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg transition group-hover:scale-110">
                👤
              </span>

              Profile
            </Link>

            <Link
              to="/skills"
              className="group flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30"
            >
              <span className="text-lg">
                ⭐
              </span>

              Skills
            </Link>

            <Link
              to="/learning"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg transition group-hover:scale-110">
                📚
              </span>

              Learning
            </Link>

            <Link
              to="/quizzes"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg transition group-hover:scale-110">
                📝
              </span>

              Quizzes
            </Link>

            <Link
              to="/certificates"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg transition group-hover:scale-110">
                🏆
              </span>

              Certificates
            </Link>

            <Link
              to="/internships"
              className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              <span className="text-lg transition group-hover:scale-110">
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

        {/* =====================================
            HEADER
        ====================================== */}

        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">

            <div>

              <p className="text-sm font-medium text-slate-500">
                Skill Development
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                My Skills
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
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm"
            >
              ⭐ Skills
            </Link>

            <Link
              to="/learning"
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
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

        {/* =====================================
            CONTENT
        ====================================== */}

        <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

          {/* =====================================
              HERO
          ====================================== */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/5" />

            <div className="relative max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
                ⭐ Build your profile
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Showcase Your Skills
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Add the technical and professional skills
                you have developed. Your skills help build
                a stronger student profile and can support
                your internship journey.
              </p>

            </div>

          </section>

          {/* =====================================
              ADD SKILL + SUMMARY
          ====================================== */}

          <div className="grid gap-6 lg:grid-cols-3">

            {/* Add Skill */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md lg:col-span-2">

              <div>

                <h2 className="text-lg font-extrabold text-slate-900">
                  Add a New Skill
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter a skill you want to showcase.
                </p>

              </div>

              <form
                onSubmit={handleAddSkill}
                className="mt-5 flex flex-col gap-3 sm:flex-row"
              >

                <input
                  type="text"
                  value={skillName}
                  onChange={(event) => {
                    setSkillName(event.target.value)
                    setError("")
                    setSuccess("")
                  }}
                  placeholder="e.g. Python, React, Figma..."
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  disabled={adding}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {adding
                    ? "Adding..."
                    : "Add Skill"}
                </button>

              </form>

              {/* Messages */}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
                  ✓ {success}
                </div>
              )}

              {/* Suggestions */}

              <div className="mt-6">

                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Quick suggestions
                </p>

                <div className="mt-3 flex flex-wrap gap-2">

                  {suggestedSkills.map(
                    (suggestedSkill) => {
                      const alreadyAdded =
                        skills.some(
                          (skill) =>
                            String(
                              skill.name
                            )
                              .trim()
                              .toLowerCase() ===
                            suggestedSkill.toLowerCase()
                        )

                      return (
                        <button
                          key={suggestedSkill}
                          type="button"
                          disabled={alreadyAdded}
                          onClick={() =>
                            addSuggestedSkill(
                              suggestedSkill
                            )
                          }
                          className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                            alreadyAdded
                              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                              : "border-blue-100 bg-blue-50 text-blue-700 hover:-translate-y-0.5 hover:bg-blue-100"
                          }`}
                        >
                          {alreadyAdded
                            ? "✓ "
                            : "+ "}
                          {suggestedSkill}
                        </button>
                      )
                    }
                  )}

                </div>

              </div>

            </section>

            {/* Summary */}

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-2xl">
                ⭐
              </div>

              <p className="mt-5 text-sm font-bold text-slate-500">
                Total Skills
              </p>

              <p className="mt-1 text-4xl font-extrabold text-slate-900">
                {skills.length}
              </p>

              <p className="mt-3 text-sm leading-6 text-slate-500">
                Keep adding skills that represent
                your technical knowledge, tools and
                professional strengths.
              </p>

              <div className="mt-5 rounded-2xl bg-blue-50 p-4">

                <p className="text-xs font-bold uppercase tracking-wide text-blue-500">
                  Profile Tip
                </p>

                <p className="mt-1 text-sm font-semibold leading-5 text-blue-900">
                  Add skills you can explain confidently
                  during an interview.
                </p>

              </div>

            </section>

          </div>

          {/* =====================================
              MY SKILLS
          ====================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

              <div>

                <h2 className="text-xl font-extrabold text-slate-900">
                  My Skills
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Skills currently connected to your profile
                </p>

              </div>

              <span className="w-fit rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                {skills.length}{" "}
                {skills.length === 1
                  ? "skill"
                  : "skills"}
              </span>

            </div>

            {loading ? (

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse rounded-2xl border border-slate-200 p-5"
                  >

                    <div className="h-5 w-24 rounded bg-slate-200" />

                    <div className="mt-3 h-3 w-40 rounded bg-slate-100" />

                  </div>
                ))}

              </div>

            ) : skills.length === 0 ? (

              <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-100 text-3xl">
                  ⭐
                </div>

                <h3 className="mt-4 text-lg font-extrabold text-slate-800">
                  No skills added yet
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Start building your student profile by
                  adding your programming, design,
                  communication or other professional skills.
                </p>

                <button
                  onClick={() => {
                    document
                      .querySelector(
                        'input[placeholder*="Python"]'
                      )
                      ?.focus()
                  }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                >
                  Add Your First Skill
                </button>

              </div>

            ) : (

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {skills.map((skill, index) => (
                  <div
                    key={skill.id}
                    className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >

                    <div className="flex min-w-0 items-center gap-3">

                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-lg">
                        {index % 3 === 0
                          ? "⭐"
                          : index % 3 === 1
                          ? "💡"
                          : "🚀"}
                      </div>

                      <div className="min-w-0">

                        <h3 className="truncate font-extrabold text-slate-800">
                          {skill.name}
                        </h3>

                        <p className="mt-0.5 text-xs font-medium text-slate-400">
                          Skill #{index + 1}
                        </p>

                      </div>

                    </div>

                    <button
                      onClick={() =>
                        handleRemoveSkill(
                          skill.id
                        )
                      }
                      disabled={
                        removingId === skill.id
                      }
                      title="Remove skill"
                      className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {removingId === skill.id
                        ? "..."
                        : "🗑️"}
                    </button>

                  </div>
                ))}

              </div>

            )}

          </section>

          {/* =====================================
              SKILL BUILDING TIPS
          ====================================== */}

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

            <div>

              <h2 className="text-xl font-extrabold text-slate-900">
                Skill Building Tips
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Simple ways to make your skills profile stronger
              </p>

            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">

              <div className="rounded-2xl bg-blue-50 p-5">

                <div className="text-2xl">
                  🎯
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Focus on relevant skills
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add skills that match the roles,
                  internships and career paths you are
                  interested in.
                </p>

              </div>

              <div className="rounded-2xl bg-green-50 p-5">

                <div className="text-2xl">
                  🛠️
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Build projects
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Practice your skills by creating
                  projects that you can demonstrate
                  during interviews.
                </p>

              </div>

              <div className="rounded-2xl bg-purple-50 p-5">

                <div className="text-2xl">
                  📈
                </div>

                <h3 className="mt-3 font-extrabold text-slate-800">
                  Keep improving
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Learning new tools and technologies
                  regularly helps keep your profile
                  growing.
                </p>

              </div>

            </div>

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

export default Skills