import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return alert("Please fill in all fields.");

    login({ email, role });
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900">EduTrack Pro</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to your account</p>
        </div>

        {/* Student / Instructor Switch */}
        <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              role === "student"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🎓 Student
          </button>
          <button
            type="button"
            onClick={() => setRole("instructor")}
            className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
              role === "instructor"
                ? "bg-blue-600 text-white shadow-md"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            👨‍🏫 Instructor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {role === "student" ? "Student Email" : "Instructor Email"}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={role === "student" ? "student@edutrack.com" : "instructor@edutrack.com"}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors mt-2"
          >
            Sign In as {role === "student" ? "Student" : "Instructor"}
          </button>
        </form>
      </div>
    </div>
  );
}