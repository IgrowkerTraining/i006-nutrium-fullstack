import React from "react";

interface ProfileFieldProps {
  label: string;
  value?: any;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({ label, value }) => {
  const displayValue = value === null || value === undefined
    ? "—"
    : typeof value === "object"
    ? JSON.stringify(value)
    : String(value);

  return (
    <div className="flex flex-col gap-1 mx-6">
      <h6 className="text-sm font-black">{label}</h6>
      <div className="w-full bg-white rounded-xl px-4 py-3 font-black">
        {displayValue}
      </div>
    </div>
  );
};