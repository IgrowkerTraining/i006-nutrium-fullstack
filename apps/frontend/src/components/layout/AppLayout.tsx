/*envuelve todas las páginas privadas */
import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { useAuth } from "../../hooks/useAuth";

const AppLayout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
      <Header isBackendOnline={null} user={user} logout={logout} />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* Bottom Nav */}
    </div>
  );
};

export default AppLayout;
