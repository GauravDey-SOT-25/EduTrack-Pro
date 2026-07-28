import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<Login />} />

          {/* Unauthorized Fallback */}
          <Route
            path="/unauthorized"
            element={
              <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <h1 className="text-2xl font-bold text-red-600">403 - Access Denied</h1>
              </div>
            }
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute allowedRoles={["student", "instructor"]} />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route
                path="courses"
                element={<h1 className="text-2xl font-bold text-slate-800">Courses Page</h1>}
              />
              <Route
                path="analytics"
                element={<h1 className="text-2xl font-bold text-slate-800">Analytics Page</h1>}
              />
              <Route
                path="settings"
                element={<h1 className="text-2xl font-bold text-slate-800">Settings Page</h1>}
              />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
