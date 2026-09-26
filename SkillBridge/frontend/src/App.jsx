import {
  BrowserRouter,
  Link,
  Route,
  Routes,
} from "react-router-dom"

import Dashboard from "./pages/dashboard"
import Login from "./pages/login"
import Register from "./pages/register"
import Profile from "./pages/profile"
import Skills from "./pages/skills"
import Learning from "./pages/learning"
import Quizzes from "./pages/quizzes"
import Certificates from "./pages/certificates"
import Internships from "./pages/internships"
import PythonCourse from "./pages/python-course"


function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5">

      <div className="w-full max-w-lg text-center">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-3xl bg-blue-100 text-4xl">
          🔎
        </div>

        <p className="mt-8 text-sm font-extrabold uppercase tracking-widest text-blue-600">
          Page Not Found
        </p>

        <h1 className="mt-3 text-6xl font-black tracking-tight text-slate-900">
          404
        </h1>

        <h2 className="mt-3 text-2xl font-extrabold text-slate-800">
          We couldn't find that page
        </h2>

        <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
          The page you're looking for may have been moved,
          deleted, or the URL may be incorrect.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

          <Link
            to="/"
            className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700"
          >
            ← Back to Home
          </Link>

          <Link
            to="/login"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-extrabold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
          >
            Go to Login
          </Link>

        </div>

      </div>

    </div>
  )
}


function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">

      {/* NAVBAR */}

      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">

          <Link
            to="/"
            className="text-2xl font-extrabold tracking-tight"
          >
            Skill
            <span className="text-blue-600">
              Bridge
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">

            <a
              href="#features"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Features
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#opportunities"
              className="text-sm font-semibold text-slate-600 transition hover:text-blue-600"
            >
              Opportunities
            </a>

          </nav>

          <div className="flex items-center gap-2 sm:gap-3">

            <Link
              to="/login"
              className="rounded-xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 sm:px-4"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md sm:px-5"
            >
              <span className="hidden sm:inline">
                Get Started
              </span>

              <span className="sm:hidden">
                Start
              </span>
            </Link>

          </div>

        </div>

      </header>


      {/* HERO */}

      <main>

        <section className="relative overflow-hidden bg-slate-50">

          <div className="absolute -left-32 top-20 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />

          <div className="absolute -right-32 top-10 h-96 w-96 rounded-full bg-purple-100/70 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-2 lg:py-28">

            <div>

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm">
                <span>🚀</span>
                Your career journey starts here
              </div>

              <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">

                Build Your Skills.

                <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Build Your Future.
                </span>

              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                SkillBridge is a student-focused career platform
                designed to help you learn technology, practice
                your knowledge, track your progress, earn
                certificates, and discover internship opportunities.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">

                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700"
                >
                  Start Learning →
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-extrabold text-slate-700 shadow-sm transition hover:bg-blue-50 hover:text-blue-600"
                >
                  Sign In
                </Link>

              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm font-semibold text-slate-500">

                <span>✓ Learn at your pace</span>
                <span>✓ Track your progress</span>
                <span>✓ Explore internships</span>

              </div>

            </div>


            {/* Dashboard preview */}

            <div className="relative">

              <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-blue-200/50 to-purple-200/50 blur-2xl" />

              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">

                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-red-300" />
                    <span className="h-3 w-3 rounded-full bg-yellow-300" />
                    <span className="h-3 w-3 rounded-full bg-green-300" />
                  </div>

                  <div className="rounded-lg bg-slate-100 px-8 py-1.5 text-[10px] font-semibold text-slate-400">
                    skillbridge.app
                  </div>

                  <div className="w-10" />

                </div>

                <div className="bg-slate-50 p-5 sm:p-7">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Welcome back
                      </p>

                      <h3 className="mt-1 text-lg font-extrabold text-slate-900">
                        Student Dashboard
                      </h3>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                      S
                    </div>

                  </div>

                  <div className="mt-6 grid grid-cols-3 gap-3">

                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div>⭐</div>
                      <p className="mt-2 text-xl font-extrabold">
                        4
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        Skills
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div>📚</div>
                      <p className="mt-2 text-xl font-extrabold">
                        70%
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        Progress
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <div>🏆</div>
                      <p className="mt-2 text-xl font-extrabold">
                        2
                      </p>
                      <p className="text-[10px] font-semibold text-slate-400">
                        Certificates
                      </p>
                    </div>

                  </div>

                  <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">

                    <div className="flex items-center justify-between">

                      <div>
                        <p className="text-xs font-bold text-slate-400">
                          Current Course
                        </p>

                        <p className="mt-1 text-sm font-extrabold text-slate-800">
                          Python Programming
                        </p>
                      </div>

                      <span className="text-sm font-extrabold text-blue-600">
                        70%
                      </span>

                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">

                      <div className="h-full w-[70%] rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />

                    </div>

                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">

                    <div className="rounded-2xl bg-blue-600 p-4 text-white">
                      <div>💼</div>
                      <p className="mt-2 text-xs font-extrabold">
                        Find Internships
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-900 p-4 text-white">
                      <div>📝</div>
                      <p className="mt-2 text-xs font-extrabold">
                        Take Quizzes
                      </p>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* FEATURES */}

        <section
          id="features"
          className="bg-white px-5 py-20 sm:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-2xl text-center">

              <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-blue-600">
                Everything in one place
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Everything you need to grow
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-500">
                Learning, practice, progress tracking,
                certificates, and career opportunities in
                one platform.
              </p>

            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">

              {[
                {
                  icon: "⭐",
                  title: "Skill Development",
                  text: "Build and manage your technical skill profile while identifying areas to improve.",
                },
                {
                  icon: "📚",
                  title: "Learning Resources",
                  text: "Learn through structured courses, lessons, progress tracking, and practical activities.",
                },
                {
                  icon: "📝",
                  title: "Quizzes & Progress",
                  text: "Test your knowledge, track scores, and work toward earning course certificates.",
                },
              ].map((feature) => (

                <div
                  key={feature.title}
                  className="group rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                >

                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-2xl transition group-hover:scale-110">
                    {feature.icon}
                  </div>

                  <h3 className="mt-6 text-xl font-extrabold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    {feature.text}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* HOW IT WORKS */}

        <section
          id="how-it-works"
          className="bg-slate-50 px-5 py-20 sm:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-2xl text-center">

              <div className="inline-flex rounded-full bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-blue-600 shadow-sm">
                Simple process
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Your journey in four steps
              </h2>

            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-4">

              {[
                ["01", "Create Your Profile", "Tell SkillBridge about your education, interests, and career goals."],
                ["02", "Build Your Skills", "Add your skills and learn through structured technology courses."],
                ["03", "Practice & Earn", "Test your knowledge with quizzes and work toward certificates."],
                ["04", "Find Opportunities", "Explore internships and take the next step toward your career."],
              ].map(([number, title, text]) => (

                <div
                  key={number}
                  className="text-center"
                >

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-xl font-extrabold text-white shadow-lg shadow-blue-200">
                    {number}
                  </div>

                  <h3 className="mt-5 font-extrabold">
                    {title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {text}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* OPPORTUNITIES */}

        <section
          id="opportunities"
          className="bg-white px-5 py-20 sm:px-8"
        >

          <div className="mx-auto max-w-7xl">

            <div className="max-w-2xl">

              <div className="inline-flex rounded-full bg-green-50 px-4 py-2 text-xs font-extrabold uppercase tracking-wider text-green-600">
                Career opportunities
              </div>

              <h2 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl">
                Skills that connect to opportunities
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-500">
                Explore different career paths and discover
                opportunities that can help you gain real-world
                experience.
              </p>

            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">

              {[
                ["💻", "Web Development", "React", "JavaScript", "Python"],
                ["🐍", "Python Development", "Python", "FastAPI", "SQL"],
                ["🎨", "UI/UX Design", "Figma", "UX", "UI"],
              ].map(([icon, title, ...tags]) => (

                <div
                  key={title}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-xl">
                    {icon}
                  </div>

                  <h3 className="mt-5 text-lg font-extrabold">
                    {title}
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">

                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600"
                      >
                        {tag}
                      </span>
                    ))}

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>


        {/* CTA */}

        <section className="px-5 pb-20 sm:px-8">

          <div className="mx-auto max-w-7xl">

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 px-6 py-12 text-center text-white shadow-xl sm:px-12 sm:py-16">

              <div className="relative">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-2xl">
                  🚀
                </div>

                <h2 className="mt-6 text-3xl font-black sm:text-4xl">
                  Ready to build your future?
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                  Create your SkillBridge account and start
                  building the skills, knowledge, and experience
                  you need for your career.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">

                  <Link
                    to="/register"
                    className="rounded-xl bg-white px-6 py-3.5 text-sm font-extrabold text-blue-700 shadow-lg transition hover:bg-blue-50"
                  >
                    Create Free Account →
                  </Link>

                  <Link
                    to="/login"
                    className="rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-extrabold text-white transition hover:bg-white/20"
                  >
                    I Already Have an Account
                  </Link>

                </div>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* FOOTER */}

      <footer className="border-t border-slate-200 bg-slate-950 px-5 py-10 text-white sm:px-8">

        <div className="mx-auto max-w-7xl">

          <div className="grid gap-8 md:grid-cols-3">

            <div>

              <Link
                to="/"
                className="text-2xl font-extrabold"
              >
                Skill
                <span className="text-blue-400">
                  Bridge
                </span>
              </Link>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                A student-focused platform for learning
                skills, tracking progress, earning certificates,
                and discovering career opportunities.
              </p>

            </div>

            <div>

              <h3 className="font-extrabold">
                Platform
              </h3>

              <div className="mt-4 space-y-3">

                <Link
                  to="/register"
                  className="block text-sm text-slate-400 hover:text-white"
                >
                  Create Account
                </Link>

                <Link
                  to="/login"
                  className="block text-sm text-slate-400 hover:text-white"
                >
                  Login
                </Link>

                <Link
                  to="/learning"
                  className="block text-sm text-slate-400 hover:text-white"
                >
                  Learning
                </Link>

              </div>

            </div>

            <div>

              <h3 className="font-extrabold">
                Explore
              </h3>

              <div className="mt-4 space-y-3">

                <a
                  href="#features"
                  className="block text-sm text-slate-400 hover:text-white"
                >
                  Features
                </a>

                <a
                  href="#how-it-works"
                  className="block text-sm text-slate-400 hover:text-white"
                >
                  How It Works
                </a>

                <a
                  href="#opportunities"
                  className="block text-sm text-slate-400 hover:text-white"
                >
                  Opportunities
                </a>

              </div>

            </div>

          </div>

          <div className="mt-10 border-t border-slate-800 pt-6 text-center">

            <p className="text-xs text-slate-500">
              © 2026 SkillBridge. Build Your Skills. Build Your Future.
            </p>

          </div>

        </div>

      </footer>

    </div>
  )
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route
          path="/"
          element={<Home />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/skills"
          element={<Skills />}
        />

        <Route
          path="/learning"
          element={<Learning />}
        />

        <Route
          path="/quizzes"
          element={<Quizzes />}
        />

        <Route
          path="/certificates"
          element={<Certificates />}
        />

        <Route
          path="/internships"
          element={<Internships />}
        />

        <Route
          path="/python-course"
          element={<PythonCourse />}
        />

        <Route
          path="*"
          element={<NotFound />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App