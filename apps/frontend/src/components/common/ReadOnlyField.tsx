import React from "react";

type Props = {
  label: string;
  value?: React.ReactNode;
};

export const ReadOnlyField: React.FC<Props> = ({ label, value }) => {
  const showValue =
    value !== undefined && value !== null && String(value).trim() !== ""
      ? value
      : <span className="text-slate-400">—</span>;

  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-slate-700">{label}</p>

      <div className="w-full rounded-xl border border-slate-200 bg-white/60 px-4 py-3">
        <div className="text-sm text-slate-800">{showValue}</div>
      </div>
    </div>
  );
};