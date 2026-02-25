import React, { useEffect } from "react";

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const CancelAppointmentModal: React.FC<Props> = ({
  isOpen,
  onConfirm,
  onClose,
}) => {
  /* ============================
     🔒 BLOQUEAR SCROLL
  ============================ */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* ============================
       🌑 OVERLAY
       Click aquí = cerrar
    ============================ */
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      {/* ============================
         📦 MODAL
         Stop propagation para no cerrar
      ============================ */}
      <div
        className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-lg font-medium">
          ¿Deseas cancelar la cita con el nutricionista?
        </h2>

        <div className="flex justify-center gap-6 mt-6">
          {/* Confirmar */}
          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-2xl bg-[#7ECD43] text-white shadow-md hover:opacity-90 transition"
          >
            Confirmar
          </button>

          {/* Cancelar */}
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-2xl border border-red-500 text-red-500 bg-white hover:bg-red-50 transition"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};