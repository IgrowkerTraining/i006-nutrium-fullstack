import React, { useState } from "react";

interface AvailabilityFieldProps {
  label: string;
  value?: { start?: string; end?: string };
}

export const AvailabilityField: React.FC<AvailabilityFieldProps> = ({ label, value }) => {
  const [start, setStart] = useState(value?.start || "");
  const [end, setEnd] = useState(value?.end || "");

  return (
    <div className="space-y-4 mx-6">
      <p className="text-sm font-semibold text-gray-900">{label}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <label className="text-sm font-normal text-gray-600 mb-1">Desde:</label>
          <input
            type="time"
            value={start}
            readOnly
            className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-medium"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-normal text-gray-600 mb-1">Hasta:</label>
          <input
            type="time"
            value={end}
            readOnly
            className="px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-gray-700 font-medium"
          />
        </div>
      </div>
    </div>
  );
};