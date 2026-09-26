import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Register() {
  const navigate = useNavigate()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] =
    useState("")

  const [showPassword, setShowPassword] =
    useState(false)
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")
    setSuccess("")

    if (!name.trim()) {
      setError("Please enter your full name.")
      return
    }

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!password) {
      setError("Please create a password.")
      return
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      )
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Unable to create your account."
        )
      }

      setSuccess(
        "Account created successfully! Redirecting to login..."
      )

      setTimeout(() => {
        navigate("/login", {
          replace: true,
        })
      }, 1200)
    } catch (err) {
      console.error(
        "Registration error:",
        err
      )

      setError(
        err.message ||
          "Unable to create your account. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================
          HEADER
      ====================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">

          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight text-slate-900"
          >
            Skill
            <span className="text-blue-600">
              Bridge
            </span>
          </Link>

          <div className="flex items-center gap-2 text-sm text-slate-500">

            <span className="hidden sm:inline">
              Already have an account?
            </span>

            <Link
              to="/login"
              className="font-extrabold text-blue-600 transition hover:text-blue-700"
            >
              Sign In
            </Link>

          </div>

        </div>

      </header>

      {/* =====================================
          MAIN
      ====================================== */}

      <main className="flex min-h-[calc(100vh-81px)] items-center justify-center px-4 py-10 sm:px-6">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">

          {/* =====================================
              LEFT BRAND PANEL
          ====================================== */}

          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-10 text-white lg:flex lg:flex-col lg:justify-between">

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10" />

            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/10" />

            <div className="relative">

              <div className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">
                🚀 Start Your Journey
              </div>

              <h1 className="mt-8 text-4xl font-extrabold leading-tight">
                Build your skills.
                <br />
                Build your future.
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
                Create your SkillBridge account and
                take the next step toward your career goals.
              </p>

            </div>

            <div className="relative space-y-4">

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  🎯
                </div>

                <div>
                  <p className="font-bold">
                    Discover Your Path
                  </p>
                  <p className="text-sm text-blue-100">
                    Explore skills and career opportunities.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  📚
                </div>

                <div>
                  <p className="font-bold">
                    Learn New Skills
                  </p>
                  <p className="text-sm text-blue-100">
                    Learn through practical courses and quizzes.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  💼
                </div>

                <div>
                  <p className="font-bold">
                    Find Internships
                  </p>
                  <p className="text-sm text-blue-100">
                    Discover opportunities for your career.
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* =====================================
              REGISTER FORM
          ====================================== */}

          <section className="p-6 sm:p-10 lg:p-12">

            <div className="mx-auto max-w-md">

              {/* Mobile icon */}

              <div className="mb-7 lg:hidden">

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  🚀
                </div>

              </div>

              {/* Heading */}

              <div>

                <p className="text-sm font-bold text-blue-600">
                  Get started today
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  Create your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Join SkillBridge and start building
                  your career-ready skills.
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-5 text-red-700">

                  <span className="shrink-0">
                    ⚠️
                  </span>

                  <span>
                    {error}
                  </span>

                </div>
              )}

              {/* Success */}

              {success && (
                <div className="mt-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold leading-5 text-green-700">

                  <span className="shrink-0">
                    ✓
                  </span>

                  <span>
                    {success}
                  </span>

                </div>
              )}

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

                {/* Full Name */}

                <div>

                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      👤
                    </span>

                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => {
                        setName(
                          event.target.value
                        )
                        setError("")
                      }}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      ✉️
                    </span>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(
                          event.target.value
                        )
                        setError("")
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                  </div>

                </div>

                {/* Password */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔒
                    </span>

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) => {
                        setPassword(
                          event.target.value
                        )
                        setError("")
                      }}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-sm text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Use at least 6 characters.
                  </p>

                </div>

                {/* Confirm Password */}

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Confirm Password
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg">
                      🔐
                    </span>

                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={confirmPassword}
                      onChange={(event) => {
                        setConfirmPassword(
                          event.target.value
                        )
                        setError("")
                      }}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-12 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-sm text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
                      aria-label={
                        showConfirmPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showConfirmPassword
                        ? "🙈"
                        : "👁️"}
                    </button>

                  </div>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <span className="ml-2">
                        →
                      </span>
                    </>
                  )}
                </button>

              </form>

              {/* Login */}

              <div className="mt-8 text-center">

                <p className="text-sm text-slate-500">
                  Already have a SkillBridge account?
                </p>

                <Link
                  to="/login"
                  className="mt-2 inline-block text-sm font-extrabold text-blue-600 transition hover:text-blue-700"
                >
                  Sign in to your account →
                </Link>

              </div>

              {/* Benefits */}

              <div className="mt-8 rounded-2xl bg-slate-50 p-4">

                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  What you can do with SkillBridge
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">

                  <div className="rounded-xl bg-white p-3 text-xs font-semibold text-slate-600">
                    📚 Learn
                  </div>

                  <div className="rounded-xl bg-white p-3 text-xs font-semibold text-slate-600">
                    📝 Practice
                  </div>

                  <div className="rounded-xl bg-white p-3 text-xs font-semibold text-slate-600">
                    🏆 Earn Certificates
                  </div>

                  <div className="rounded-xl bg-white p-3 text-xs font-semibold text-slate-600">
                    💼 Find Internships
                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* =====================================
          FOOTER
      ====================================== */}

      <footer className="pb-6 text-center">

        <p className="text-xs text-slate-400">
          © 2026 SkillBridge • Build Your Skills.
          Build Your Future.
        </p>

      </footer>

    </div>
  )
}

export default Register