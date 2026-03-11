import React from "react";

interface ProfileFieldProps {
  label: string;
  value?: any;
  isEditing?: boolean;
  onChange?: (value: string) => void;
  type?: "text" | "date" | "select";
  options?: string[];
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  isEditing = false,
  onChange,
  type = "text",
  options,
}) => {
  const displayValue =
    value === null || value === undefined
      ? "—"
      : typeof value === "object"
      ? JSON.stringify(value)
      : String(value);

  return (
    <div className="flex flex-col gap-1 mx-6">
      <h6 className="text-sm font-black">{label}</h6>
      {isEditing && onChange ? (
        type === "select" && options ? (
          <select
            className="w-full bg-white rounded-xl px-4 py-3 font-black border border-gray-300 focus:outline-none focus:border-[#7ECD43]"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          >
            {options.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        ) : (
          <input
            type={type}
            className="w-full bg-white rounded-xl px-4 py-3 font-black border border-gray-300 focus:outline-none focus:border-[#7ECD43]"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
          />
        )
      ) : (
        <div className="w-full bg-white rounded-xl px-4 py-3 font-black">
          {displayValue}
        </div>
      )}
    </div>
  );
};