import React, { useState } from "react";
import { CancelAppointmentModal } from "./CancelAppointmentModal";

interface Props {
  month: string;
  day: string;
  name: string;
  time: string;
  modality: string;
  onCancel?: () => void;
}

export const AppointmentCard: React.FC<Props> = ({
  month,
  day,
  name,
  time,
  modality,
  onCancel,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConfirmCancel = () => {
    setIsModalOpen(false);
    onCancel?.(); // 🔥 Aquí luego conectaremos con backend
  };

  return (
    <>
      <article className="flex rounded-xl shadow-md overflow-hidden bg-white">
        
        {/* Fecha lateral */}
        <div className="bg-[#7ECD43] text-white flex flex-col items-center justify-center px-4 py-4">
          <span className="text-sm">{month}</span>
          <span className="text-xl font-semibold">{day}</span>
        </div>

        {/* Contenido */}
        <div className="flex-1 p-4 relative">
          <button
            onClick={() => setIsModalOpen(true)}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 transition"
            aria-label="Cancelar cita"
          >
            ✕
          </button>

          <h3 className="font-medium">{name}</h3>

          {/* Hora */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mt-2">
            <svg viewBox="0 0 21 21" className="w-4 h-4" fill="currentColor">
              <path d="M10.4062 0C4.65625 0 0 4.66667 0 10.4167C0 16.1667 4.65625 20.8333 10.4062 20.8333C16.1667 20.8333 20.8333 16.1667 20.8333 10.4167C20.8333 4.66667 16.1667 0 10.4062 0ZM13.8437 15.3229L9.375 10.8437V5.20833H11.4583V9.98958L15.3229 13.8542L13.8437 15.3229Z" />
            </svg>
            <span>{time}</span>
          </div>

          {/* Modalidad */}
          <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
            <svg viewBox="0 0 21 19" className="w-4 h-4" fill="currentColor">
              <path d="M18.75 0H2.08333C0.9375 0 0 0.9375 0 2.08333V13.5417C0 14.6875 0.9375 15.625 2.08333 15.625H5.20833L4.16667 16.6667V18.75H16.6667V16.6667L15.625 15.625H18.75C19.8958 15.625 20.8333 14.6875 20.8333 13.5417V2.08333C20.8333 0.9375 19.8958 0 18.75 0ZM18.75 13.5417H2.08333V2.08333H18.75V13.5417Z" />
            </svg>
            <span>{modality}</span>
          </div>
        </div>
      </article>

      {/* Modal */}
      <CancelAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </>
  );
};