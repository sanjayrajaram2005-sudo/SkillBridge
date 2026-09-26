import { Link } from "react-router-dom"

function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6 relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl"></div>

      <div className="relative w-full max-w-lg text-center">

        {/* Logo */}
        <Link to="/">
          <h1 className="text-3xl font-extrabold text-blue-400">
            SkillBridge
          </h1>
        </Link>

        {/* 404 */}
        <div className="mt-10">

          <p className="text-8xl font-extrabold tracking-tight text-white sm:text-9xl">
            404
          </p>

          <h2 className="mt-6 text-3xl font-bold text-white">
            Page Not Found
          </h2>

          <p className="mx-auto mt-4 max-w-md text-slate-400">
            Sorry, the page you're looking for doesn't exist or may have
            been moved.
          </p>

        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/"
            className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 hover:-translate-y-0.5"
          >
            ← Back to Home
          </Link>

          <Link
            to="/dashboard"
            className="rounded-xl border border-slate-700 px-6 py-3 font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            Go to Dashboard
          </Link>

        </div>

        {/* Footer message */}
        <p className="mt-10 text-sm text-slate-500">
          Learn • Practice • Grow • Succeed
        </p>

      </div>

    </div>
  )
}

export default NotFound

