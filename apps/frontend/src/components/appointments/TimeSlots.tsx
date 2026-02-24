import React from "react";

interface Props {
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
}

export const TimeSlots: React.FC<Props> = ({
  selectedTime,
  onSelectTime,
}) => {
  const hours = ["09:00", "10:30", "12:00", "16:00", "18:30"];

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      {hours.map((hour) => (
        <button
          key={hour}
          onClick={() => onSelectTime(hour)}
          className={`py-2 rounded-xl border ${
            selectedTime === hour
              ? "bg-[#7ECD43] text-white border-[#7ECD43]"
              : "border-slate-200 text-slate-700"
          }`}
        >
          {hour}
        </button>
      ))}
    </div>
  );
};