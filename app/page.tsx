export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="text-center">
        <h1 className="text-5xl font-bold">
          AI Mock Interview Platform
        </h1>

        <p className="mt-4 text-lg text-gray-300">
          Practice smarter. Get AI-powered interview feedback.
        </p>

        <button className="mt-8 bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Get Started
        </button>
      </div>
    </main>
  );
}