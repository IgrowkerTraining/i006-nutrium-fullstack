import React, { useState } from "react";
import { Input } from "./Input";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  error,
  className = "",
  ...props
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative w-full">
      <Input
        {...props}
        label={label}
        error={error}
        type={show ? "text" : "password"}
        className={`pr-10 ${className}`}
      />

      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-[39px] text-slate-500 hover:text-[#7ECD43] transition-colors"
        aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {show ? (
        // ojo tachado
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round"
            d="M2.25 12s3.75-7.5 9.75-7.5S21.75 12 21.75 12 18 19.5 12 19.5 2.25 12 2.25 12Z" />
            <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 15.75A3.75 3.75 0 1 0 12 8.25a3.75 3.75 0 0 0 0 7.5Z" />
        </svg>
        ) : (
        // ojo abierto
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round"
            d="M3 3l18 18M10.5 10.677a2.25 2.25 0 003.184 3.184" />
            <path strokeLinecap="round" strokeLinejoin="round"
            d="M9.88 9.88A3 3 0 0114.12 14.12" />
            <path strokeLinecap="round" strokeLinejoin="round"
            d="M7.5 7.5C5.1 9 3.6 11.3 3 12c.6.7 2.1 3 4.5 4.5 1.4.9 3 1.5 4.5 1.5 1.1 0 2.2-.2 3.2-.7" />
            <path strokeLinecap="round" strokeLinejoin="round"
            d="M12 6c3.5 0 6.9 3.2 9 6-1.1 1.5-2.5 3.2-4.3 4.4" />
        </svg>
        )}
      </button>
    </div>
  );
};
