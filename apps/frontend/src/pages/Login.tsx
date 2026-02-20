import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { PasswordInput } from "../components/common/PasswordInput";
import { AuthLayout } from "../components/layout/AuthLayout";
import { LogoHeader } from "../components/common/LogoHeader";
import { User } from "../types";
import { api } from "../services/api";
import { useAuth } from "../hooks/useAuth"; 

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
      login(response.user);
      navigate("/dashboard");
    } catch (err: any) {
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
