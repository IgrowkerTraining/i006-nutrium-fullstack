import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  to?: number | string; // -1 o "/ruta"
  className?: string;
};

export const BackButton: React.FC<Props> = ({ to = -1, className = "" }) => {
  const navigate = useNavigate();

  const goBack = () => {
    if (typeof to === "number") navigate(to);
    else navigate(to);
  };

  return (
    <button
      type="button"
      onClick={goBack}
      className={`absolute left-4 top-4 p-2 rounded-full hover:bg-black/5 transition ${className}`}
      aria-label="Volver"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M15 18l-6-6 6-6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};