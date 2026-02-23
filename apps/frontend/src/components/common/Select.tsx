import React from "react";

type Option = { label: string; value: string };

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  placeholder = "Selecciona una opción",
  className = "",
  ...props
}) => {
  const selectId = props.id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && selectId && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-600 ml-1">
          {label}
        </label>
      )}

      {label && !selectId && (
        <label className="text-sm font-medium text-slate-600 ml-1">{label}</label>
      )}

      <select
        id={selectId}
        className={`
          w-full bg-white border border-slate-200 rounded-lg px-3 py-2
          text-slate-800
          focus:outline-none focus:ring-2 focus:ring-[#7ECD43]/40 focus:border-[#7ECD43]
          transition-all duration-200
          ${error ? "border-red-500 focus:ring-red-500/50 focus:border-red-500" : ""}
          ${className}
        `}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {error && <p className="text-xs text-red-500 mt-0.5 ml-1">{error}</p>}
    </div>
  );
};