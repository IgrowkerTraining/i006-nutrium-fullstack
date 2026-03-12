import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { ProfilePage } from "../components/profile/ProfilePage";
import { api } from "../services/api";
import { storage } from "../utils/storage";
import { User } from "../types";

const Perfil: React.FC = () => {
  const { user, logout, login } = useAuth();
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            profilePicture: p.profile_picture || "",
            avatarUrl: p.profile_picture || "",
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
            tagIds: p.tags?.map((t: any) => t.id) || [],
            yearsOfExperience: p.years_of_experience ?? 0,
            country: p.country || "",
            city: p.city || "",
            qualifyingDegree: "",
            profilePicture: p.profile_picture_url || "",
            avatarUrl: p.profile_picture_url || "",
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

  const handleEdit = () => {
    if (!user) return;
    setError(null);
    setFormData({ ...user });
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
    setError(null);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    const token = storage.getToken();
    if (!token) return;

    setSaving(true);
    setError(null);

    try {
      if (user.role === "patient") {
        await api.upsertPatientProfile(token, {
          birth_date: formData.birthDate,
          gender: "prefiero_no_decir",
          health_goals: formData.goal || "Mejorar mi salud general",
          languages: ["es"],
          modality: formData.modality,
          country: formData.country,
          city: formData.city,
          ...(formData.profilePicture ? { profile_picture: formData.profilePicture } : {}),
        });
      } else {
        await api.createNutritionistProfile(token, {
          license_number: formData.licenseNumber,
          bio: formData.education || "Nutricionista profesional",
          modality: formData.modality,
          years_of_experience: formData.yearsOfExperience ?? 0,
          country: formData.country,
          city: formData.city,
          tag_ids: formData.tagIds?.length ? formData.tagIds : [1],
          ...(formData.profilePicture ? { profile_picture_url: formData.profilePicture } : {}),
        });
      }

      // Actualizar el contexto global con los nuevos datos
      const updatedUser = { ...user, ...formData } as any;
      login(updatedUser);
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return <div style={{color:'red',fontSize:24}}>SIN USUARIO</div>;

  return (
    <ProfilePage
      profile={user}
      isEditing={isEditing}
      formData={formData}
      onChange={handleChange}
      onEdit={handleEdit}
      onSave={handleSave}
      onCancel={handleCancel}
      onLogout={logout}
      saving={saving}
      error={error}
    />
  );
};

export default Perfil;
