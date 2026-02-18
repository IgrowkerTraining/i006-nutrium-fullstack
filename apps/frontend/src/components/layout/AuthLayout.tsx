/* para todas las páginas públicas */
import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
