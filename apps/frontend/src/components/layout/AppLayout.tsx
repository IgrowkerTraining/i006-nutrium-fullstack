// /*envuelve todas las páginas privadas */
// import React from "react";
// import { Outlet } from "react-router-dom";
// import Header from "./Header";
// import { useAuth } from "../../hooks/useAuth";

// const AppLayout: React.FC = () => {
//   const { user, logout } = useAuth();

//   return (
//     <div className="min-h-screen flex flex-col bg-slate-950 text-slate-200">
//       <Header isBackendOnline={null} user={user} logout={logout} />
//       <main className="flex-1">
//         <Outlet />
//       </main>
//       {/* Bottom Nav */}
//     </div>
//   );
// };

// export default AppLayout;


import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import {HeaderNav} from "./HeaderNav";
import {BottomNav} from "./BottomNav";

const AppLayout: React.FC = () => {
  const location = useLocation();

  // Mostrar botón volver solo en ciertas rutas
  const showBack =
    location.pathname !== "/match" &&
    location.pathname !== "/dashboard";

  return (
    <div className="min-h-screen bg-[#F8FFF3] flex flex-col">
      <HeaderNav showBack={showBack} />

      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  );
};

export default AppLayout;