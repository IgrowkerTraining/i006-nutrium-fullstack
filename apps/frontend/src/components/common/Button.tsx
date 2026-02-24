import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading,
  className = "",
  type, // ✅ lo sacamos
  disabled,
  ...rest
}) => {
  const baseStyles =
    "px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-[#7ECD43] hover:bg-[#6fbb3c] text-white shadow-lg",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "border border-[#7ECD43] text-[#7ECD43] hover:bg-[#7ECD43]/10",
    ghost: "hover:bg-gray-100 text-gray-700",
  };

  return (
    <button
      type={type ?? "button"} // ✅ default seguro
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || disabled}
      {...rest}
    >
      {isLoading ? (
        <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : null}
      {children}
    </button>
  );
};