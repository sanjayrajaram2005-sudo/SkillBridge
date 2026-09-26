import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const sessionMessage =
    location.state?.message || ""

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError("")

    if (!email.trim()) {
      setError("Please enter your email address.")
      return
    }

    if (!password) {
      setError("Please enter your password.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(
        `${API_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Invalid email or password."
        )
      }

      if (!data.access_token) {
        throw new Error(
          "Login succeeded, but no access token was received."
        )
      }

      localStorage.setItem(
        "accessToken",
        data.access_token
      )

      localStorage.setItem(
        "isLoggedIn",
        "true"
      )

      navigate("/dashboard", {
        replace: true,
      })
    } catch (err) {
      console.error(
        "Login error:",
        err
      )

      setError(
        err.message ||
          "Unable to login. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* =====================================
          DESKTOP / MOBILE HEADER
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

          <Link
            to="/register"
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            Create Account
          </Link>

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
                🎓 Student Career Platform
              </div>

              <h1 className="mt-8 text-4xl font-extrabold leading-tight">
                Welcome back to
                <br />
                SkillBridge
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-blue-100">
                Continue building your skills,
                completing courses, earning certificates,
                and discovering internship opportunities.
              </p>

            </div>

            <div className="relative space-y-4">

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  📚
                </div>

                <div>
                  <p className="font-bold">
                    Learn & Grow
                  </p>
                  <p className="text-sm text-blue-100">
                    Build practical technology skills.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  🏆
                </div>

                <div>
                  <p className="font-bold">
                    Track Progress
                  </p>
                  <p className="text-sm text-blue-100">
                    Complete courses and earn certificates.
                  </p>
                </div>

              </div>

              <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">

                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 text-xl">
                  💼
                </div>

                <div>
                  <p className="font-bold">
                    Find Opportunities
                  </p>
                  <p className="text-sm text-blue-100">
                    Explore internships for your career.
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* =====================================
              LOGIN FORM
          ====================================== */}

          <section className="p-6 sm:p-10 lg:p-12">

            <div className="mx-auto max-w-md">

              {/* Mobile heading */}

              <div className="mb-8 lg:hidden">

                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl">
                  👋
                </div>

              </div>

              <div>

                <p className="text-sm font-bold text-blue-600">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                  Sign in to SkillBridge
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter your account details to continue
                  your learning journey.
                </p>

              </div>

              {/* Session message */}

              {sessionMessage && (
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
                  ℹ️ {sessionMessage}
                </div>
              )}

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

              {/* Form */}

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >

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

                  <div className="mb-2 flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-sm font-bold text-slate-700"
                    >
                      Password
                    </label>

                  </div>

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
                      placeholder="Enter your password"
                      autoComplete="current-password"
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
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="ml-2">
                        →
                      </span>
                    </>
                  )}
                </button>

              </form>

              {/* Register */}

              <div className="mt-8 text-center">

                <p className="text-sm text-slate-500">
                  Don't have an account?
                </p>

                <Link
                  to="/register"
                  className="mt-2 inline-block text-sm font-extrabold text-blue-600 transition hover:text-blue-700"
                >
                  Create your SkillBridge account →
                </Link>

              </div>

              {/* Security note */}

              <div className="mt-8 flex items-start gap-3 rounded-2xl bg-slate-50 p-4">

                <div className="text-lg">
                  🔐
                </div>

                <div>

                  <p className="text-xs font-extrabold text-slate-700">
                    Secure Sign In
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your login session is securely
                    authenticated before accessing
                    your SkillBridge dashboard.
                  </p>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* Footer */}

      <footer className="pb-6 text-center">

        <p className="text-xs text-slate-400">
          © 2026 SkillBridge • Build Your Skills.
          Build Your Future.
        </p>

      </footer>

    </div>
  )
}

export default Login