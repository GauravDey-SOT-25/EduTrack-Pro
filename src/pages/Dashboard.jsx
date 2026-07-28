import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-md">
        <h1 className="text-2xl font-bold">Welcome, {user?.email || "User"}!</h1>
        <p className="text-blue-100 mt-1 capitalize">
          Role: {user?.role || "Member"} — Here is your platform overview.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Learners</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">1,248</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active Courses</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">18</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Completion Rate</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">76.4%</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm font-medium text-slate-500">System Status</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">Online</p>
        </div>
      </div>
    </div>
  );
}