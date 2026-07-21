import { Route } from "react-router-dom";

import HandymanLayout from "@/app/layouts/HandymanLayout";

import JobsPage from "@/features/handyman/pages/JobsPage";

export default function HandymanRoutes() {
  return (
    <Route element={<HandymanLayout />}>
      <Route path="/handyman/jobs" element={<JobsPage />} />
    </Route>
  );
}