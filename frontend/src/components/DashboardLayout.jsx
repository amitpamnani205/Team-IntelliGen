import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import DashboardTopbar from "./DashboardTopbar.jsx";

export default function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardTopbar />
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
