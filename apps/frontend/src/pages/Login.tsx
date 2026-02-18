import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/common/Input";
import { Button } from "../components/common/Button";
import { PasswordInput } from "../components/common/PasswordInput";
import { AuthLayout } from "../components/layout/AuthLayout";
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
    <div className="flex flex-col items-center mb-8">
      <div className="w-12 h-12 bg-[#7ECD43] rounded-xl flex items-center justify-center mb-4 shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-7 h-7 text-white"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
      </div>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">
        Bienvenido/a
      </h1>
      <p className="text-slate-500 text-sm text-center">
        Ingresa tus datos para continuar
      </p>
    </div>

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
