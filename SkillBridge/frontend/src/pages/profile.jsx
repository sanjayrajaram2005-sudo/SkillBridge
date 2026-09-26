import { useCallback, useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Profile() {
  const navigate = useNavigate()

  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    education: "",
    location: "",
    careerGoal: "",
    about: "",
  })

  const [originalProfile, setOriginalProfile] = useState(null)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const [isEditing, setIsEditing] = useState(false)

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
     LOAD PROFILE
  ====================================== */

  const loadProfile = useCallback(async () => {
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
        `${API_URL}/profile`,
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
          "Unable to load your profile."
        )
      }

      const data = await response.json()

      const loadedProfile = {
        fullName:
          data.fullName ||
          data.name ||
          "",
        email: data.email || "",
        education:
          data.education || "",
        location:
          data.location || "",
        careerGoal:
          data.careerGoal ||
          data.career_goal ||
          "",
        about: data.about || "",
      }

      setProfile(loadedProfile)
      setOriginalProfile(loadedProfile)

      localStorage.setItem(
        "profile",
        JSON.stringify(loadedProfile)
      )
    } catch (err) {
      console.error(
        "Profile loading error:",
        err
      )

      /* Cached profile fallback */

      try {
        const cachedProfile =
          JSON.parse(
            localStorage.getItem(
              "profile"
            ) || "null"
          )

        if (cachedProfile) {
          const loadedProfile = {
            fullName:
              cachedProfile.fullName ||
              cachedProfile.name ||
              "",
            email:
              cachedProfile.email || "",
            education:
              cachedProfile.education ||
              "",
            location:
              cachedProfile.location ||
              "",
            careerGoal:
              cachedProfile.careerGoal ||
              cachedProfile.career_goal ||
              "",
            about:
              cachedProfile.about || "",
          }

          setProfile(loadedProfile)
          setOriginalProfile(
            loadedProfile
          )

          setError(
            "Unable to refresh your profile from the server."
          )
        } else {
          setError(
            "Unable to load your profile."
          )
        }
      } catch {
        setError(
          "Unable to load your profile."
        )
      }
    } finally {
      setLoading(false)
    }
  }, [handleUnauthorized])

  useEffect(() => {
    loadProfile()
  }, [loadProfile])

  /* =====================================
     FORM CHANGE
  ====================================== */

  const handleChange = (event) => {
    const { name, value } =
      event.target

    setProfile((previous) => ({
      ...previous,
      [name]: value,
    }))

    setError("")
    setSuccess("")
  }

  /* =====================================
     SAVE PROFILE
  ====================================== */

  const handleSave = async (event) => {
    event.preventDefault()

    const accessToken =
      localStorage.getItem("accessToken")

    if (!accessToken) {
      handleUnauthorized()
      return
    }

    if (!profile.fullName.trim()) {
      setError(
        "Please enter your full name."
      )
      return
    }

    if (!profile.email.trim()) {
      setError(
        "Please enter your email address."
      )
      return
    }

    setSaving(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch(
        `${API_URL}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name:
              profile.fullName.trim(),
            email:
              profile.email.trim(),
            education:
              profile.education.trim() ||
              null,
            location:
              profile.location.trim() ||
              null,
            career_goal:
              profile.careerGoal.trim() ||
              null,
            about:
              profile.about.trim() ||
              null,
          }),
        }
      )

      if (response.status === 401) {
        handleUnauthorized()
        return
      }

      if (!response.ok) {
        let message =
          "Unable to save your profile."

        try {
          const data =
            await response.json()

          message =
            data.detail || message
        } catch {
          // Ignore parsing error.
        }

        throw new Error(message)
      }

      const data =
        await response.json()

      const updatedProfile = {
        fullName:
          data.fullName ||
          data.name ||
          profile.fullName,
        email:
          data.email ||
          profile.email,
        education:
          data.education ||
          profile.education,
        location:
          data.location ||
          profile.location,
        careerGoal:
          data.careerGoal ||
          data.career_goal ||
          profile.careerGoal,
        about:
          data.about ||
          profile.about,
      }

      setProfile(updatedProfile)
      setOriginalProfile(
        updatedProfile
      )

      localStorage.setItem(
        "profile",
        JSON.stringify(
          updatedProfile
        )
      )

      setIsEditing(false)
      setSuccess(
        "Profile updated successfully!"
      )

      setTimeout(() => {
        setSuccess("")
      }, 3500)
    } catch (err) {
      console.error(
        "Profile save error:",
        err
      )

      setError(
        err.message ||
          "Unable to save your profile."
      )
    } finally {
      setSaving(false)
    }
  }

  /* =====================================
     CANCEL EDITING
  ====================================== */

  const handleCancel = () => {
    if (originalProfile) {
      setProfile({
        ...originalProfile,
      })
    }

    setIsEditing(false)
    setError("")
    setSuccess("")
  }

  /* =====================================
     LOGOUT
  ====================================== */

  const handleLogout = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to logout?"
      )

    if (!confirmed) {
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
     HELPERS
  ====================================== */

  const displayName =
    profile.fullName ||
    "Student"

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part.charAt(0).toUpperCase()
      )
      .join("") || "S"

  const profileFields = [
    {
      label: "Education",
      value:
        profile.education ||
        "Not added yet",
      icon: "🎓",
    },
    {
      label: "Location",
      value:
        profile.location ||
        "Not added yet",
      icon: "📍",
    },
    {
      label: "Career Goal",
      value:
        profile.careerGoal ||
        "Not added yet",
      icon: "🎯",
    },
  ]

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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
            >
              🏠 Dashboard
            </Link>

            <Link
              to="/profile"
              className="flex items-center gap-3 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/30"
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
                Your information
              </p>

              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                My Profile
              </h1>

            </div>

            <div className="flex items-center gap-3">

              {!isEditing &&
                !loading && (
                  <button
                    onClick={() =>
                      setIsEditing(true)
                    }
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
                  >
                    ✏️ Edit Profile
                  </button>
                )}

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-extrabold text-white">
                {initials}
              </div>

            </div>

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
              className="flex shrink-0 items-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
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

          {/* =====================================
              HERO PROFILE
          ====================================== */}

          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 text-white shadow-xl sm:p-8">

            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 right-20 h-60 w-60 rounded-full bg-white/5" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

              {/* Avatar */}

              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/20 bg-white/15 text-3xl font-extrabold shadow-lg backdrop-blur">
                {initials}
              </div>

              <div className="min-w-0">

                <div className="mb-2 inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-blue-100">
                  🎓 SkillBridge Student
                </div>

                <h2 className="truncate text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {loading
                    ? "Loading..."
                    : displayName}
                </h2>

                <p className="mt-2 break-all text-sm text-blue-100 sm:text-base">
                  {profile.email ||
                    "Add your email address"}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

                  {profile.location && (
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                      📍 {profile.location}
                    </span>
                  )}

                  {profile.education && (
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-white">
                      🎓 {profile.education}
                    </span>
                  )}

                </div>

              </div>

            </div>

          </section>

          {/* SUCCESS */}

          {success && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700">
              <span className="text-lg">
                ✓
              </span>
              {success}
            </div>
          )}

          {/* ERROR */}

          {error && (
            <div className="flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <span className="text-lg">
                ⚠️
              </span>
              {error}
            </div>
          )}

          {/* LOADING */}

          {loading ? (

            <div className="grid gap-6 lg:grid-cols-3">

              <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">

                <div className="h-6 w-40 rounded bg-slate-200" />

                <div className="mt-6 grid gap-5 sm:grid-cols-2">

                  {[1, 2, 3, 4].map(
                    (item) => (
                      <div
                        key={item}
                        className="space-y-2"
                      >
                        <div className="h-3 w-20 rounded bg-slate-100" />
                        <div className="h-11 w-full rounded-xl bg-slate-100" />
                      </div>
                    )
                  )}

                </div>

              </div>

              <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div className="h-6 w-32 rounded bg-slate-200" />

                <div className="mt-6 space-y-4">

                  {[1, 2, 3].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-16 rounded-2xl bg-slate-100"
                      />
                    )
                  )}

                </div>

              </div>

            </div>

          ) : (

            <>

              {/* =====================================
                  EDIT / INFORMATION
              ====================================== */}

              <div className="grid gap-6 lg:grid-cols-3">

                <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 sm:p-7">

                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                    <div>

                      <h2 className="text-xl font-extrabold text-slate-900">
                        Personal Information
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Keep your profile information updated.
                      </p>

                    </div>

                    {!isEditing && (
                      <button
                        onClick={() =>
                          setIsEditing(true)
                        }
                        className="self-start rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                      >
                        Edit
                      </button>
                    )}

                  </div>

                  {isEditing ? (

                    <form
                      onSubmit={handleSave}
                      className="mt-7 space-y-5"
                    >

                      {/* Name + Email */}

                      <div className="grid gap-5 sm:grid-cols-2">

                        <div>

                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Full Name *
                          </label>

                          <input
                            type="text"
                            name="fullName"
                            value={
                              profile.fullName
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Enter your full name"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Email *
                          </label>

                          <input
                            type="email"
                            name="email"
                            value={
                              profile.email
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />

                        </div>

                      </div>

                      {/* Education + Location */}

                      <div className="grid gap-5 sm:grid-cols-2">

                        <div>

                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Education
                          </label>

                          <input
                            type="text"
                            name="education"
                            value={
                              profile.education
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="e.g. B.E. ECE - 2nd Year"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />

                        </div>

                        <div>

                          <label className="mb-2 block text-sm font-bold text-slate-700">
                            Location
                          </label>

                          <input
                            type="text"
                            name="location"
                            value={
                              profile.location
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="e.g. Coimbatore, Tamil Nadu"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          />

                        </div>

                      </div>

                      {/* Career Goal */}

                      <div>

                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          Career Goal
                        </label>

                        <input
                          type="text"
                          name="careerGoal"
                          value={
                            profile.careerGoal
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="e.g. Become a Full-Stack Developer"
                          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                      </div>

                      {/* About */}

                      <div>

                        <label className="mb-2 block text-sm font-bold text-slate-700">
                          About Me
                        </label>

                        <textarea
                          name="about"
                          value={
                            profile.about
                          }
                          onChange={
                            handleChange
                          }
                          rows="6"
                          placeholder="Tell recruiters and employers about yourself, your interests, projects, and career goals..."
                          className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-6 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />

                      </div>

                      {/* Actions */}

                      <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">

                        <button
                          type="button"
                          onClick={
                            handleCancel
                          }
                          disabled={saving}
                          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          disabled={saving}
                          className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {saving
                            ? "Saving..."
                            : "Save Changes"}
                        </button>

                      </div>

                    </form>

                  ) : (

                    <div className="mt-7">

                      <div className="grid gap-4 sm:grid-cols-2">

                        <div className="rounded-2xl bg-slate-50 p-4">

                          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Full Name
                          </p>

                          <p className="mt-2 break-words text-sm font-bold text-slate-800">
                            {profile.fullName ||
                              "Not added yet"}
                          </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">

                          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Email
                          </p>

                          <p className="mt-2 break-all text-sm font-bold text-slate-800">
                            {profile.email ||
                              "Not added yet"}
                          </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">

                          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Education
                          </p>

                          <p className="mt-2 break-words text-sm font-bold text-slate-800">
                            {profile.education ||
                              "Not added yet"}
                          </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4">

                          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Location
                          </p>

                          <p className="mt-2 break-words text-sm font-bold text-slate-800">
                            {profile.location ||
                              "Not added yet"}
                          </p>

                        </div>

                        <div className="rounded-2xl bg-slate-50 p-4 sm:col-span-2">

                          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                            Career Goal
                          </p>

                          <p className="mt-2 break-words text-sm font-bold text-slate-800">
                            {profile.careerGoal ||
                              "Not added yet"}
                          </p>

                        </div>

                      </div>

                      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">

                        <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          About Me
                        </p>

                        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
                          {profile.about ||
                            "Tell us about yourself by clicking Edit Profile."}
                        </p>

                      </div>

                    </div>

                  )}

                </section>

                {/* =====================================
                    PROFILE SUMMARY
                ====================================== */}

                <aside className="space-y-6">

                  <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                    <h2 className="text-xl font-extrabold text-slate-900">
                      Profile Summary
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your career information at a glance.
                    </p>

                    <div className="mt-6 space-y-3">

                      {profileFields.map(
                        (field) => (
                          <div
                            key={field.label}
                            className="flex gap-3 rounded-2xl bg-slate-50 p-4"
                          >

                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-lg shadow-sm">
                              {field.icon}
                            </div>

                            <div className="min-w-0">

                              <p className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                                {field.label}
                              </p>

                              <p className="mt-1 break-words text-sm font-bold text-slate-700">
                                {field.value}
                              </p>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </section>

                  {/* Profile tips */}

                  <section className="rounded-3xl border border-blue-100 bg-blue-50 p-6">

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-xl text-white">
                      💡
                    </div>

                    <h3 className="mt-4 font-extrabold text-slate-900">
                      Profile Tip
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Keep your education, career goal,
                      skills, and About section updated.
                      A complete profile helps you present
                      yourself professionally.
                    </p>

                  </section>

                </aside>

              </div>

              {/* =====================================
                  QUICK ACTIONS
              ====================================== */}

              <section>

                <div className="mb-5">

                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Continue Your Journey
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Explore the next steps in your SkillBridge journey.
                  </p>

                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

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

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Add and manage your technical skills.
                    </p>

                    <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                      View Skills →
                    </span>

                  </Link>

                  <Link
                    to="/learning"
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-xl">
                      📚
                    </div>

                    <h3 className="mt-4 font-extrabold text-slate-800">
                      Learn
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Build practical skills with courses.
                    </p>

                    <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                      Start Learning →
                    </span>

                  </Link>

                  <Link
                    to="/certificates"
                    className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
                  >

                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-xl">
                      🏆
                    </div>

                    <h3 className="mt-4 font-extrabold text-slate-800">
                      Certificates
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      View the certificates you have earned.
                    </p>

                    <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                      View Certificates →
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
                      Internships
                    </h3>

                    <p className="mt-1 text-sm leading-5 text-slate-500">
                      Find opportunities matching your skills.
                    </p>

                    <span className="mt-3 inline-block text-sm font-bold text-blue-600">
                      Explore Jobs →
                    </span>

                  </Link>

                </div>

              </section>

            </>

          )}

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

export default Profile