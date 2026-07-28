import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const linkStyle = ({ isActive }) =>
    `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="px-4 py-3 mb-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-blue-500">EduTrack</h2>
        </div>
        <nav className="space-y-1.5">
          <NavLink to="/dashboard" className={linkStyle}>
            📊 Dashboard
          </NavLink>
          <NavLink to="/courses" className={linkStyle}>
            📚 Courses
          </NavLink>
          <NavLink to="/analytics" className={linkStyle}>
            📈 Analytics
          </NavLink>
          <NavLink to="/settings" className={linkStyle}>
            ⚙️ Settings
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}