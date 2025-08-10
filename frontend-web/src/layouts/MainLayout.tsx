import { Outlet, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "./Header";
import Navigation from "./Navigation";

export function MainLayout() {
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState<string>("file-explorer");

  useEffect(() => {
    const path = location.pathname;
    if (path === "/") {
      setCurrentPage("file-explorer");
    } else if (path === "/api-keys") {
      setCurrentPage("api-keys");
    } else if (path === "/api-usage" || path === "/usage-and-limits") {
      setCurrentPage("api-usage");
    } else if (path === "/recovery-management") {
      setCurrentPage("recovery");
    } else if (path === "/notifications") {
      setCurrentPage("notifications");
    } else if (path === "/settings") {
      setCurrentPage("settings");
    }
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 pb-24 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
