import { Route } from "react-router-dom";

import AdminLayout from "@/app/layouts/AdminLayout";

import DashboardPage from "@/features/admin/pages/AdminDashboardPage";

export default function AdminRoutes() {
  return (
    <Route element={<AdminLayout />}>
      <Route path="/admin/dashboard" element={<DashboardPage />} />
    </Route>
  );
}