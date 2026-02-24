import React from "react";

interface ProfileFieldProps {
  label: string;
  value: string | number;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
}) => {
  return (
    <div className="flex flex-col gap-1 mx-6">
      <h6 className="text-sm font-black">
        {label}
      </h6>
      <div className="w-full bg-white rounded-xl px-4 py-3 font-black">
        {value}
      </div>
    </div>
  );
};