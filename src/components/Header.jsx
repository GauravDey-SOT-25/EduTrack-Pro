import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
      <h1 className="text-xl font-bold text-slate-800">EduTrack Pro</h1>
      
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm font-medium text-slate-600">
            {user.email} <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md capitalize font-semibold">({user.role})</span>
          </span>
        )}
        <button
          onClick={logout}
          className="px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  );
}