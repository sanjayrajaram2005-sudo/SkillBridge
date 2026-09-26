import { useCallback, useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const INTERNSHIPS = [
  {
    id: 1,
    company: "TechNova Solutions",
    role: "Web Development Intern",
    category: "Web Development",
    location: "Coimbatore",
    mode: "On-site",
    stipend: "₹8,000 / month",
    duration: "3 Months",
    skills: ["React", "JavaScript", "HTML", "CSS"],
    description:
      "Work on modern web applications and gain practical experience with frontend development.",
  },
  {
    id: 2,
    company: "CodeCraft Technologies",
    role: "Python Developer Intern",
    category: "Python",
    location: "Coimbatore",
    mode: "On-site",
    stipend: "₹10,000 / month",
    duration: "3 Months",
    skills: ["Python", "FastAPI", "SQL"],
    description:
      "Build backend applications and APIs while working with Python and database technologies.",
  },
  {
    id: 3,
    company: "InnovateLabs",
    role: "UI/UX Design Intern",
    category: "UI/UX Design",
    location: "Bangalore",
    mode: "Hybrid",
    stipend: "₹12,000 / month",
    duration: "2 Months",
    skills: ["Figma", "UI Design", "UX Research"],
    description:
      "Create user-friendly interfaces and contribute to real-world product design projects.",
  },
  {
    id: 4,
    company: "DataVision Technologies",
    role: "Data Analyst Intern",
    category: "Data Analytics",
    location: "Chennai",
    mode: "Hybrid",
    stipend: "₹10,000 / month",
    duration: "3 Months",
    skills: ["Python", "Power BI", "SQL"],
    description:
      "Analyze business data, create dashboards, and support data-driven decision making.",
  },
  {
    id: 5,
    company: "AppWorks",
    role: "Mobile App Developer Intern",
    category: "Mobile Development",
    location: "Remote",
    mode: "Remote",
    stipend: "₹7,000 / month",
    duration: "3 Months",
    skills: ["Flutter", "Dart", "Firebase"],
    description:
      "Develop mobile applications and learn how production-ready apps are designed and deployed.",
  },
  {
    id: 6,
    company: "EmbeddedTech",
    role: "Embedded Systems Intern",
    category: "Embedded Systems",
    location: "Coimbatore",
    mode: "On-site",
    stipend: "₹9,000 / month",
    duration: "3 Months",
    skills: ["Arduino", "C", "Embedded Systems"],
    description:
      "Work with microcontrollers, sensors, and embedded systems in practical engineering projects.",
  },
]

const CATEGORIES = [
  "All",
  "Web Development",
  "Python",
  "UI/UX Design",
  "Data Analytics",
  "Mobile Development",
  "Embedded Systems",
]

function Internships() {
  const navigate = useNavigate()

  const [savedInternships, setSavedInternships] = useState([])
  const [applications, setApplications] = useState([])
  const [profile, setProfile] = useState(null)

  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")

  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [applying, setApplying] = useState(false)
  const [removingApplicationId, setRemovingApplicationId] =
    useState(null)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [showApplicationModal, setShowApplicationModal] =
    useState(false)

  const [selectedInternship, setSelectedInternship] =
    useState(null)

  const [showApplications, setShowApplications] =
    useState(false)

  const [applicationForm, setApplicationForm] = useState({
    name: "",
    email: "",
    phone: "",
    resume: "",
    cover_letter: "",
  })

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
     LOAD DATA
  ====================================== */

  const loadData = useCallback(async () => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setLoading(true)
    setError("")

    try {
      const [
        savedResponse,
        applicationsResponse,
        profileResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/saved-internships`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }),

        fetch(`${API_URL}/internship-applications`, {
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
        savedResponse.status === 401 ||
        applicationsResponse.status === 401 ||
        profileResponse.status === 401
      ) {
        handleUnauthorized()
        return
      }

      if (!savedResponse.ok) {
        throw new Error("Unable to load saved internships.")
      }

      const savedData = await savedResponse.json()

      const applicationData = applicationsResponse.ok
        ? await applicationsResponse.json()
        : []

      const profileData = profileResponse.ok
        ? await profileResponse.json()
        : null

      const normalizedSaved = Array.isArray(savedData)
        ? savedData
        : []

      const normalizedApplications =
        Array.isArray(applicationData)
          ? applicationData
          : []

      setSavedInternships(normalizedSaved)
      setApplications(normalizedApplications)
      setProfile(profileData)

      localStorage.setItem(
        "savedInternships",
        JSON.stringify(normalizedSaved)
      )

      localStorage.setItem(
        "internshipApplications",
        JSON.stringify(normalizedApplications)
      )

      if (profileData) {
        localStorage.setItem(
          "profile",
          JSON.stringify(profileData)
        )
      }

      if (profileData) {
        setApplicationForm((previous) => ({
          ...previous,
          name:
            profileData.fullName ||
            profileData.name ||
            previous.name,
          email:
            profileData.email ||
            previous.email,
        }))
      }
    } catch (err) {
      console.error("Internship data error:", err)

      try {
        const cachedSaved = JSON.parse(
          localStorage.getItem("savedInternships") || "[]"
        )

        const cachedApplications = JSON.parse(
          localStorage.getItem("internshipApplications") || "[]"
        )

        const cachedProfile = JSON.parse(
          localStorage.getItem("profile") || "null"
        )

        setSavedInternships(
          Array.isArray(cachedSaved) ? cachedSaved : []
        )

        setApplications(
          Array.isArray(cachedApplications)
            ? cachedApplications
            : []
        )

        setProfile(cachedProfile)

        if (cachedProfile) {
          setApplicationForm((previous) => ({
            ...previous,
            name:
              cachedProfile.fullName ||
              cachedProfile.name ||
              previous.name,
            email:
              cachedProfile.email ||
              previous.email,
          }))
        }

        setError(
          "Unable to refresh internship data from the server."
        )
      } catch {
        setError("Unable to load internship data.")
      }
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    loadData()
  }, [loadData])

  /* =====================================
     FILTER
  ====================================== */

  const filteredInternships = useMemo(() => {
    const searchText = search.trim().toLowerCase()

    return INTERNSHIPS.filter((internship) => {
      const matchesCategory =
        category === "All" ||
        internship.category === category

      if (!matchesCategory) {
        return false
      }

      if (!searchText) {
        return true
      }

      const searchableText = [
        internship.company,
        internship.role,
        internship.category,
        internship.location,
        internship.mode,
        ...internship.skills,
      ]
        .join(" ")
        .toLowerCase()

      return searchableText.includes(searchText)
    })
  }, [search, category])

  /* =====================================
     SAVED CHECK
  ====================================== */

  const isSaved = (internshipId) => {
    return savedInternships.some(
      (item) =>
        Number(item.internship_id) === Number(internshipId)
    )
  }

  const isApplied = (internshipId) => {
    return applications.some(
      (item) =>
        Number(item.internship_id) === Number(internshipId)
    )
  }

  /* =====================================
     SAVE / REMOVE
  ====================================== */

  const handleSave = async (internship) => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    setSavingId(internship.id)
    setError("")
    setSuccess("")

    try {
      if (isSaved(internship.id)) {
        const savedItem = savedInternships.find(
          (item) =>
            Number(item.internship_id) ===
            Number(internship.id)
        )

        if (!savedItem) {
          return
        }

        const response = await fetch(
          `${API_URL}/saved-internships/${savedItem.id}`,
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
          throw new Error(
            "Unable to remove saved internship."
          )
        }

        const updated = savedInternships.filter(
          (item) => item.id !== savedItem.id
        )

        setSavedInternships(updated)

        localStorage.setItem(
          "savedInternships",
          JSON.stringify(updated)
        )

        setSuccess("Internship removed from saved jobs.")
      } else {
        const response = await fetch(
          `${API_URL}/saved-internships`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              internship_id: internship.id,
              company: internship.company,
              role: internship.role,
              category: internship.category,
              location: internship.location,
              mode: internship.mode,
              stipend: internship.stipend,
              duration: internship.duration,
            }),
          }
        )

        if (response.status === 401) {
          handleUnauthorized()
          return
        }

        if (!response.ok) {
          let message =
            "Unable to save internship."

          try {
            const data = await response.json()
            message = data.detail || message
          } catch {
            // Ignore JSON parsing error.
          }

          throw new Error(message)
        }

        const savedData = await response.json()

        const updated = [
          ...savedInternships,
          savedData,
        ]

        setSavedInternships(updated)

        localStorage.setItem(
          "savedInternships",
          JSON.stringify(updated)
        )

        setSuccess("Internship saved successfully.")
      }
    } catch (err) {
      console.error("Save internship error:", err)
      setError(
        err.message || "Unable to update saved internship."
      )
    } finally {
      setSavingId(null)

      setTimeout(() => {
        setSuccess("")
      }, 3000)
    }
  }

  /* =====================================
     OPEN APPLICATION MODAL
  ====================================== */

  const openApplicationModal = (internship) => {
    setSelectedInternship(internship)
    setError("")

    const currentProfile =
      profile ||
      JSON.parse(
        localStorage.getItem("profile") || "null"
      )

    setApplicationForm({
      name:
        currentProfile?.fullName ||
        currentProfile?.name ||
        "",
      email: currentProfile?.email || "",
      phone: "",
      resume: "",
      cover_letter: "",
    })

    setShowApplicationModal(true)
  }

  /* =====================================
     CLOSE MODAL
  ====================================== */

  const closeApplicationModal = () => {
    if (applying) {
      return
    }

    setShowApplicationModal(false)
    setSelectedInternship(null)
    setApplicationForm({
      name: "",
      email: "",
      phone: "",
      resume: "",
      cover_letter: "",
    })
  }

  /* =====================================
     FORM CHANGE
  ====================================== */

  const handleFormChange = (event) => {
    const { name, value } = event.target

    setApplicationForm((previous) => ({
      ...previous,
      [name]: value,
    }))
  }

  /* =====================================
     APPLY
  ====================================== */

  const handleApply = async (event) => {
    event.preventDefault()

    if (!selectedInternship) {
      return
    }

    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    if (
      !applicationForm.name.trim() ||
      !applicationForm.email.trim() ||
      !applicationForm.phone.trim() ||
      !applicationForm.resume.trim()
    ) {
      setError(
        "Please fill in all required application fields."
      )
      return
    }

    setApplying(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(
        `${API_URL}/internship-applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            internship_id: selectedInternship.id,
            company: selectedInternship.company,
            role: selectedInternship.role,
            location: selectedInternship.location,
            mode: selectedInternship.mode,
            name: applicationForm.name.trim(),
            email: applicationForm.email.trim(),
            phone: applicationForm.phone.trim(),
            resume: applicationForm.resume.trim(),
            cover_letter:
              applicationForm.cover_letter.trim() || null,
          }),
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        let message =
          "Unable to submit application."

        try {
          const data = await response.json()
          message = data.detail || message
        } catch {
          // Ignore parsing error.
        }

        throw new Error(message)
      }

      const applicationData = await response.json()

      const updatedApplications = [
        ...applications,
        applicationData,
      ]

      setApplications(updatedApplications)

      localStorage.setItem(
        "internshipApplications",
        JSON.stringify(updatedApplications)
      )

      setShowApplicationModal(false)
      setSelectedInternship(null)

      setApplicationForm({
        name: "",
        email: "",
        phone: "",
        resume: "",
        cover_letter: "",
      })

      setSuccess(
        "Application submitted successfully!"
      )

      setTimeout(() => {
        setSuccess("")
      }, 4000)
    } catch (err) {
      console.error("Application error:", err)

      setError(
        err.message ||
          "Unable to submit application."
      )
    } finally {
      setApplying(false)
    }
  }

  /* =====================================
     DELETE APPLICATION
  ====================================== */

  const handleRemoveApplication = async (
    applicationId
  ) => {
    const accessToken = localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    const confirmed = window.confirm(
      "Remove this application from your application history?"
    )

    if (!confirmed) {
      return
    }

    setRemovingApplicationId(applicationId)
    setError("")

    try {
      const response = await fetch(
        `${API_URL}/internship-applications/${applicationId}`,
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
        throw new Error(
          "Unable to remove application."
        )
      }

      const updatedApplications =
        applications.filter(
          (item) => item.id !== applicationId
        )

      setApplications(updatedApplications)

      localStorage.setItem(
        "internshipApplications",
        JSON.stringify(updatedApplications)
      )

      setSuccess(
        "Application removed successfully."
      )

      setTimeout(() => {
        setSuccess("")
      }, 3000)
    } catch (err) {
      console.error(
        "Remove application error:",
        err
      )

      setError(
        err.message ||
          "Unable to remove application."
      )
    } finally {
      setRemovingApplicationId(null)
    }
  }

  /* =====================================
     LOGOUT
  ====================================== */

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    )

    if (!confirmed) {
      return
    }

    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("accessToken")

    navigate("/login")
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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
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
              className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30"
            >
              💼 Internships
            </Link>

          </nav>

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
                Career Opportunities
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                Internships
              </h1>

            </div>

            <div className="flex items-center gap-3">

              <button
                onClick={() =>
                  setShowApplications(
                    !showApplications
                  )
                }
                className={`hidden rounded-xl px-4 py-2.5 text-sm font-bold transition sm:block ${
                  showApplications
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                📋 My Applications
                {applications.length > 0 && (
                  <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5">
                    {applications.length}
                  </span>
                )}
              </button>

              <Link
                to="/profile"
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-lg text-white">
                  👤
                </div>

                <span className="hidden text-sm font-bold text-slate-700 sm:block">
                  Profile
                </span>
              </Link>

            </div>

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
              className="flex shrink-0 items-center gap-2 rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
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
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
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

        {/* CONTENT */}

        <div className="mx-auto max-w-7xl space-y-7 px-4 py-6 sm:px-6 lg:px-8">

          {/* HERO */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-white/5" />

            <div className="relative max-w-3xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100 backdrop-blur">
                🚀 Start your career journey
              </div>

              <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                Find Your Next Internship
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Discover opportunities that match your
                skills, interests, and career goals. Save
                internships and apply directly through
                SkillBridge.
              </p>

            </div>

          </section>

          {/* SUCCESS */}

          {success && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              <span className="text-lg">✓</span>
              {success}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span className="text-lg">⚠️</span>
              {error}
            </div>
          )}

          {/* MOBILE APPLICATION BUTTON */}

          <button
            onClick={() =>
              setShowApplications(
                !showApplications
              )
            }
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 sm:hidden"
          >
            📋 My Applications
            {applications.length > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">
                {applications.length}
              </span>
            )}
          </button>

          {/* SEARCH / FILTER */}

          {!showApplications && (
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">

                <div className="relative">

                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                    🔍
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search internships, companies, skills..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                <button
                  onClick={() => {
                    setSearch("")
                    setCategory("All")
                  }}
                  className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Clear Filters
                </button>

              </div>

              <div className="mt-5">

                <p className="mb-3 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                  Browse by category
                </p>

                <div className="flex gap-2 overflow-x-auto pb-1">

                  {CATEGORIES.map(
                    (item) => (
                      <button
                        key={item}
                        onClick={() =>
                          setCategory(item)
                        }
                        className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                          category === item
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {item}
                      </button>
                    )
                  )}

                </div>

              </div>

            </section>
          )}

          {/* APPLICATION HISTORY */}

          {showApplications ? (

            <section className="space-y-5">

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">

                <div>

                  <h2 className="text-2xl font-extrabold text-slate-900">
                    My Applications
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Track the internships you have applied for.
                  </p>

                </div>

                <button
                  onClick={() =>
                    setShowApplications(false)
                  }
                  className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
                >
                  Browse Internships
                </button>

              </div>

              {applications.length === 0 ? (

                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-100 text-4xl">
                    📋
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    No Applications Yet
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Browse available internships and
                    submit your first application.
                  </p>

                  <button
                    onClick={() =>
                      setShowApplications(false)
                    }
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Explore Internships
                  </button>

                </div>

              ) : (

                <div className="grid gap-5 md:grid-cols-2">

                  {applications.map(
                    (application) => (
                      <div
                        key={application.id}
                        className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                      >

                        <div className="flex items-start justify-between gap-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-xl">
                              💼
                            </div>

                            <div>

                              <h3 className="font-extrabold text-slate-900">
                                {application.role}
                              </h3>

                              <p className="text-sm font-semibold text-blue-600">
                                {application.company}
                              </p>

                            </div>

                          </div>

                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700">
                            {application.status ||
                              "Application Submitted"}
                          </span>

                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-3">

                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Location
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              📍 {application.location}
                            </p>

                          </div>

                          <div className="rounded-xl bg-slate-50 p-3">

                            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                              Mode
                            </p>

                            <p className="mt-1 text-sm font-bold text-slate-700">
                              💻 {application.mode}
                            </p>

                          </div>

                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                          <p className="text-xs font-medium text-slate-400">
                            {application.applied_at
                              ? new Date(
                                  application.applied_at
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )
                              : "Date unavailable"}
                          </p>

                          <button
                            onClick={() =>
                              handleRemoveApplication(
                                application.id
                              )
                            }
                            disabled={
                              removingApplicationId ===
                              application.id
                            }
                            className="rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {removingApplicationId ===
                            application.id
                              ? "Removing..."
                              : "Remove"}
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>

              )}

            </section>

          ) : (

            /* =====================================
               INTERNSHIP LIST
            ====================================== */

            <section>

              <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">

                <div>

                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Available Internships
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {loading
                      ? "Loading opportunities..."
                      : `${filteredInternships.length} opportunities available`}
                  </p>

                </div>

                <div className="text-sm font-semibold text-slate-500">
                  Saved:{" "}
                  <span className="font-extrabold text-blue-600">
                    {savedInternships.length}
                  </span>
                </div>

              </div>

              {loading ? (

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                  {[1, 2, 3, 4, 5, 6].map(
                    (item) => (
                      <div
                        key={item}
                        className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                      >

                        <div className="flex gap-3">

                          <div className="h-12 w-12 rounded-2xl bg-slate-200" />

                          <div className="flex-1 space-y-2">

                            <div className="h-4 w-3/4 rounded bg-slate-200" />

                            <div className="h-3 w-1/2 rounded bg-slate-100" />

                          </div>

                        </div>

                        <div className="mt-6 h-16 rounded-xl bg-slate-100" />

                        <div className="mt-4 h-10 rounded-xl bg-slate-100" />

                      </div>
                    )
                  )}

                </div>

              ) : filteredInternships.length === 0 ? (

                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">

                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-4xl">
                    🔎
                  </div>

                  <h3 className="mt-5 text-xl font-extrabold text-slate-900">
                    No Internships Found
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                    Try another search term or choose a
                    different category.
                  </p>

                  <button
                    onClick={() => {
                      setSearch("")
                      setCategory("All")
                    }}
                    className="mt-6 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700"
                  >
                    Reset Search
                  </button>

                </div>

              ) : (

                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">

                  {filteredInternships.map(
                    (internship) => (
                      <article
                        key={internship.id}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                      >

                        {/* Card top */}

                        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 p-5">

                          <div className="flex items-start justify-between gap-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-sm ring-1 ring-blue-100">
                                💼
                              </div>

                              <div>

                                <h3 className="font-extrabold leading-tight text-slate-900">
                                  {internship.role}
                                </h3>

                                <p className="mt-1 text-sm font-bold text-blue-600">
                                  {internship.company}
                                </p>

                              </div>

                            </div>

                            <button
                              onClick={() =>
                                handleSave(
                                  internship
                                )
                              }
                              disabled={
                                savingId ===
                                internship.id
                              }
                              title={
                                isSaved(
                                  internship.id
                                )
                                  ? "Remove saved internship"
                                  : "Save internship"
                              }
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                                isSaved(
                                  internship.id
                                )
                                  ? "bg-yellow-100 text-yellow-600"
                                  : "bg-white text-slate-400 hover:bg-yellow-50 hover:text-yellow-500"
                              }`}
                            >
                              {savingId ===
                              internship.id
                                ? "..."
                                : isSaved(
                                    internship.id
                                  )
                                ? "★"
                                : "☆"}
                            </button>

                          </div>

                          <span className="mt-5 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-blue-700 shadow-sm">
                            {internship.category}
                          </span>

                        </div>

                        {/* Card body */}

                        <div className="flex flex-1 flex-col p-5">

                          <p className="min-h-[72px] text-sm leading-6 text-slate-500">
                            {internship.description}
                          </p>

                          <div className="mt-5 grid grid-cols-2 gap-3">

                            <div className="rounded-xl bg-slate-50 p-3">

                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Location
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-700">
                                📍 {internship.location}
                              </p>

                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">

                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Mode
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-700">
                                💻 {internship.mode}
                              </p>

                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">

                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Stipend
                              </p>

                              <p className="mt-1 text-sm font-bold text-green-600">
                                💰 {internship.stipend}
                              </p>

                            </div>

                            <div className="rounded-xl bg-slate-50 p-3">

                              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                                Duration
                              </p>

                              <p className="mt-1 text-sm font-bold text-slate-700">
                                ⏱ {internship.duration}
                              </p>

                            </div>

                          </div>

                          {/* Skills */}

                          <div className="mt-5">

                            <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-400">
                              Skills
                            </p>

                            <div className="flex flex-wrap gap-2">

                              {internship.skills.map(
                                (skill) => (
                                  <span
                                    key={skill}
                                    className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-bold text-slate-600"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                            </div>

                          </div>

                          {/* Actions */}

                          <div className="mt-auto pt-6">

                            {isApplied(
                              internship.id
                            ) ? (

                              <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 text-sm font-bold text-green-700">
                                ✓ Application Submitted
                              </div>

                            ) : (

                              <button
                                onClick={() =>
                                  openApplicationModal(
                                    internship
                                  )
                                }
                                className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                              >
                                Apply Now →
                              </button>

                            )}

                          </div>

                        </div>

                      </article>
                    )
                  )}

                </div>

              )}

            </section>

          )}

          {/* CAREER TIP */}

          {!showApplications && (
            <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white">
                  💡
                </div>

                <div>

                  <h3 className="font-extrabold text-slate-900">
                    Internship Tip
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Keep your profile and skills updated
                    before applying. A strong profile helps
                    you present your technical abilities and
                    career goals clearly.
                  </p>

                </div>

              </div>

            </section>
          )}

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

      {/* =====================================
          APPLICATION MODAL
      ====================================== */}

      {showApplicationModal &&
        selectedInternship && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !applying
              ) {
                closeApplicationModal()
              }
            }}
          >

            <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl">

              {/* Modal header */}

              <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-7">

                <div>

                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    Internship Application
                  </p>

                  <h2 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">
                    {selectedInternship.role}
                  </h2>

                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    {selectedInternship.company}
                  </p>

                </div>

                <button
                  onClick={closeApplicationModal}
                  disabled={applying}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
                >
                  ✕
                </button>

              </div>

              {/* Modal form */}

              <form
                onSubmit={handleApply}
                className="space-y-5 p-5 sm:p-7"
              >

                <div className="rounded-2xl bg-blue-50 p-4">

                  <div className="flex flex-wrap gap-3 text-sm font-semibold text-slate-600">

                    <span>
                      📍 {selectedInternship.location}
                    </span>

                    <span>
                      💻 {selectedInternship.mode}
                    </span>

                    <span>
                      💰 {selectedInternship.stipend}
                    </span>

                  </div>

                </div>

                {/* Name */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Full Name *
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={applicationForm.name}
                    onChange={handleFormChange}
                    placeholder="Enter your full name"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Email */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Email *
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={applicationForm.email}
                    onChange={handleFormChange}
                    placeholder="Enter your email"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Phone */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phone Number *
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={applicationForm.phone}
                    onChange={handleFormChange}
                    placeholder="Enter your phone number"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Resume */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Resume *
                  </label>

                  <input
                    type="text"
                    name="resume"
                    value={applicationForm.resume}
                    onChange={handleFormChange}
                    placeholder="Enter resume file name or link"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    Example: Sanjay_Resume.pdf
                  </p>

                </div>

                {/* Cover letter */}

                <div>

                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Cover Letter
                    <span className="ml-1 font-medium text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    name="cover_letter"
                    value={applicationForm.cover_letter}
                    onChange={handleFormChange}
                    rows="5"
                    placeholder="Tell the company why you are interested in this internship..."
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />

                </div>

                {/* Modal actions */}

                <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                  <button
                    type="button"
                    onClick={closeApplicationModal}
                    disabled={applying}
                    className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={applying}
                    className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {applying
                      ? "Submitting..."
                      : "Submit Application"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        )}

    </div>
  )
}

export default Internships