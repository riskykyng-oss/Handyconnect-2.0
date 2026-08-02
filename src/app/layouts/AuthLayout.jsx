import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <Outlet />
    </div>
  );
}