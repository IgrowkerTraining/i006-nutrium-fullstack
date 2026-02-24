import React from "react";
import { useAuth } from "../hooks/useAuth";
import { ProfilePage } from "../components/profile/ProfilePage";

const Perfil: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <ProfilePage
      profile={user}
      onEdit={() => console.log("Editar")}
      onLogout={logout}
    />
  );
};

export default Perfil;