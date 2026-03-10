import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ProfilePage } from "../components/profile/ProfilePage";
import { api } from "../services/api";
import { storage } from "../utils/storage";
import { User } from "../types";

const Perfil: React.FC = () => {
  const { user, logout, login } = useAuth();
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!user || profileLoaded) return;

    // Si ya tiene datos de perfil completos, no hacer fetch
    const hasProfile = user.role === "patient"
      ? Boolean((user as any).birthDate || (user as any).country)
      : Boolean((user as any).licenseNumber || (user as any).education);
    if (hasProfile) {
      setProfileLoaded(true);
      return;
    }

    const token = storage.getToken();
    if (!token) return;

    const fetchProfile = user.role === "patient"
      ? api.getPatientProfile(token)
      : api.getNutritionistProfile(token);

    fetchProfile
      .then((res) => {
        const p = res?.data?.profile;
        if (!p) return;

        let updatedUser: any;
        if (user.role === "patient") {
          updatedUser = {
            ...user,
            fullName: user.fullName || (user as any).name || "",
            birthDate: p.birth_date || "",
            country: p.country || "",
            city: p.city || "",
            modality: p.modality || "",
            availability: p.availability || "Mañana",
            goal: p.health_goals || "",
            medicalCondition: p.medical_condition || "",
            otherConditionDescription: p.other_condition_description || "",
          };
        } else {
          updatedUser = {
            ...user,
            fullName: user.fullName || (user as any).name || "",
            licenseNumber: p.license_number || "",
            modality: p.modality || "",
            availability: p.availabilities?.[0] || "Mañana",
            education: p.bio || "",
            specialization: p.tags?.map((t: any) => t.name).join(", ") || "",
            country: p.country || "",
            city: p.city || "",
            qualifyingDegree: "",
          };
        }
        login(updatedUser);
      })
      .catch((err) => {
        console.warn("[Perfil] Failed to fetch profile:", err);
      })
      .finally(() => {
        setProfileLoaded(true);
      });
  }, [user, profileLoaded]);

  if (!user) return <div style={{color:'red',fontSize:24}}>SIN USUARIO</div>;

  return (
      <ProfilePage
        profile={user}
      onEdit={() => console.log("Editar")}

        onLogout={logout}
      />
  );
};

export default Perfil;