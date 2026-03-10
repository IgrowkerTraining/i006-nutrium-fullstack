import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import {HeaderNav} from "./HeaderNav";
import {BottomNav} from "./BottomNav";

type AppLayoutProps = {
  children?: React.ReactNode;
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Mostrar botón volver solo en ciertas rutas
  const showBack =
    location.pathname !== "/match" &&
    location.pathname !== "/dashboard";

  return (
    <div className="min-h-screen bg-[#F8FFF3] flex flex-col">
      <HeaderNav showBack={showBack} />

      <main className="flex-1 pb-6">
        {children ?? <Outlet />}
      </main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;