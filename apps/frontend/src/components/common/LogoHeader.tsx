import React from "react";
import logo from "../../assets/nutrium-logo.svg";

interface LogoHeaderProps {
  title?: string;
  subtitle?: string;
}

export const LogoHeader: React.FC<LogoHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <img src={logo} alt="Nutrium" className="h-16 mb-4" />

      {title && (
        <h1 className="text-xl font-semibold text-slate-900">
          {title}
        </h1>
      )}

      {subtitle && (
        <p className="text-sm text-slate-500 text-center mt-1">
          {subtitle}
        </p>
      )}
    </div>
  );
};