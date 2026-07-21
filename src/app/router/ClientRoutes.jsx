import { Route } from "react-router-dom";

import ClientLayout from "@/app/layouts/ClientLayout";

import HomePage from "@/features/client/pages/ClientHomePage";

export default function ClientRoutes() {
  return (
    <Route element={<ClientLayout />}>
      <Route path="/client/home" element={<HomePage />} />
    </Route>
  );
}