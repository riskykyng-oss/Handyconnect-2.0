import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";

// Authentication Pages
import LoginPage from "@/features/auth/pages/LoginPage";
import SignupPage from "@/features/auth/pages/SignupPage";
import ForgotPasswordPage from "@/features/auth/pages/ForgotPasswordPage";
import RoleSelectionPage from "@/features/auth/pages/RoleSelectionPage";

// Client
import HomePage from "@/features/client/pages/ClientHomePage";

// Handyman
import JobsPage from "@/features/handyman/pages/JobsPage";

// Admin
import DashboardPage from "@/features/admin/pages/AdminDashboardPage";

export default function AppRouter() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Navigate to="/auth/login" replace />}
      />

      <Route
        path="/auth/login"
        element={<LoginPage />}
      />

      <Route
        path="/auth/signup"
        element={<SignupPage />}
      />

      <Route
        path="/auth/forgot-password"
        element={<ForgotPasswordPage />}
      />

      <Route
        path="/auth/select-role"
        element={<RoleSelectionPage />}
      />

      <Route
        path="/client/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/handyman/jobs"
        element={
          <ProtectedRoute>
            <JobsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="*"
        element={<Navigate to="/auth/login" replace />}
      />

    </Routes>
  );
}