import React from "react";

interface Props {
  month: string;
  day: string;
  name: string;
  time: string;
  modality: string;
}

export const AppointmentCard: React.FC<Props> = ({
  month,
  day,
  name,
  time,
  modality,
}) => {
  return (
    <article className="flex rounded-xl shadow-md overflow-hidden bg-white">
      
      {/* Fecha lateral */}
      <div className="bg-[#7ECD43] text-white flex flex-col items-center justify-center px-4 py-4">
        <span className="text-sm">{month}</span>
        <span className="text-xl font-semibold">{day}</span>
      </div>

      {/* Contenido */}
      <div className="flex-1 p-4 relative">
        <button className="absolute top-3 right-3 text-slate-400">✕</button>

        <h3 className="font-medium">{name}</h3>

        <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
          🕒 <span>{time}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
          💻 <span>{modality}</span>
        </div>
      </div>
    </article>
  );
};