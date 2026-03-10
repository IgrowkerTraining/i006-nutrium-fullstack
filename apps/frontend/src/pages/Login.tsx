import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { PasswordInput } from "../components/common/PasswordInput";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LogoHeader } from "../components/common/LogoHeader";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth"; 
import { storage } from "../utils/storage";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.login({ email, password });
       console.log("🔴 response completo:", response);
       console.log("🔴 token:", response.token);                        
       storage.setToken(response.token);
       console.log("🔴 token guardado:", localStorage.getItem('nutrium_token'));
      storage.setToken(response.token);

      let userData: any = { ...response.user, fullName: (response.user as any).name || response.user.fullName };

      // Traer el perfil completo según el rol
      try {
        if (response.user.role === "patient") {
          const profileRes = await api.getPatientProfile(response.token);
          const p = profileRes?.data?.profile;
          if (p) {
            userData = {
              ...userData,
              birthDate: p.birth_date || "",
              country: p.country || "",
              city: p.city || "",
              modality: p.modality || "",
              availability: p.availability || "Mañana",
              goal: p.health_goals || "",
              medicalCondition: "",
              otherConditionDescription: "",
            };
          }
        } else if (response.user.role === "nutritionist") {
          const profileRes = await api.getNutritionistProfile(response.token);
           console.log("🟡 nutritionist profileRes:", profileRes)
          const p = profileRes?.data?.profile;
          console.log("🟡 p:", p);
          if (p) {
            userData = {
              ...userData,
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
        }
      } catch (profileErr) {
        console.warn("[Login] Failed to fetch profile:", profileErr);
      }

      login(userData);
      navigate("/dashboard");
    } catch (err: any) {
       console.error("❌ Error en login:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <LogoHeader 
        title="Bienvenido/a"
        subtitle="Ingresa tus datos para continuar"
      />
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-lg">
          {error}
        </div>
      )}

      <Input
        label="Correo electrónico"
        placeholder="nombre@email.com"
        type="email"
        required
        disabled={isLoading}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <PasswordInput
        label="Contraseña"
        placeholder="••••••••"
        required
        disabled={isLoading}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <Button type="submit" className="w-full mt-2" isLoading={isLoading}>
        Iniciar sesión
      </Button>
    </form>

    <div className="mt-6 text-center text-sm">
      <button className="text-slate-500 hover:text-[#7ECD43] transition-colors">
        ¿Olvidaste tu contraseña?
      </button>

      <p className="mt-3 text-slate-500">
        ¿No tienes cuenta?{" "}
        <Link
          to="/register"
          className="text-[#7ECD43] font-medium hover:underline"
        >
          Regístrate
        </Link>
      </p>
    </div>
  </AuthLayout>
  );
};

export default Login;
