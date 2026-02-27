import React, { useEffect } from "react";

interface Props {
  isOpen: boolean;
  success: boolean;
  message?: string; 
  onClose: () => void;
}

export const AppointmentModal: React.FC<Props> = ({
  isOpen,
  success,
  message,
  onClose,
}) => {

    // Bloquear scroll mientras modal está activo
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50">
      <div
        className={`bg-white rounded-2xl p-6 w-full max-w-sm border-2 ${
          success ? "border-[#4CAF50]" : "border-red-500"
        }`}
      >

        {/* TÍTULO */}
        <h2
          className={`text-2xl font-bold text-center mb-4 ${
            success ? "text-[#4CAF50]" : "text-red-500"
          }`}
        >
          {success
            ? "Su cita ha sido registrada con éxito"
            : "Error al registrar su cita"}
        </h2>

        {/* MENSAJE SOLO SI ERROR */}
        {!success && message && (
          <p className="text-sm text-center mt-2 text-slate-600">
            {message}
          </p>
        )}

        {/* ICONO */}
        <div className="flex justify-center my-8 text-[#4CAF50]">
          {success ? (
            <svg
              width="54"
              height="54"
              viewBox="0 0 54 54"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#4CAF50]"
            >
              <path d="M26.6667 0C11.9467 0 0 11.9467 0 26.6667C0 41.3867 11.9467 53.3333 26.6667 53.3333C41.3867 53.3333 53.3333 41.3867 53.3333 26.6667C53.3333 11.9467 41.3867 0 26.6667 0ZM21.3333 40L8 26.6667L11.76 22.9067L21.3333 32.4533L41.5733 12.2133L45.3333 16L21.3333 40Z" />
            </svg>
          ) : (
            <svg
              width="54"
              height="54"
              viewBox="0 0 54 54"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-red-500"
            >
              <path d="M7.80637 7.80593C-2.60224 18.2145 -2.60224 35.1097 7.80637 45.5183C18.215 55.9269 35.1101 55.9269 45.5187 45.5183C55.9273 35.1097 55.9273 18.2145 45.5187 7.80593C35.1101 -2.60268 18.215 -2.60268 7.80637 7.80593ZM36.0906 21.0053L30.4338 26.6621L36.0906 32.319C37.1277 33.3561 37.1277 35.0531 36.0906 36.0902C35.0536 37.1273 33.3565 37.1273 32.3194 36.0902L26.6626 30.4333L21.0057 36.0902C19.9686 37.1273 18.2716 37.1273 17.2345 36.0902C16.1974 35.0531 16.1974 33.3561 17.2345 32.319L22.8913 26.6621L17.2345 21.0053C16.1974 19.9682 16.1974 18.2711 17.2345 17.234C18.2716 16.1969 19.9686 16.1969 21.0057 17.234L26.6626 22.8909L32.3194 17.234C33.3565 16.1969 35.0536 16.1969 36.0906 17.234C37.1277 18.2711 37.1277 19.9682 36.0906 21.0053Z" />
            </svg>
          )}
        </div>

        {/* BOTÓN */}
        <button
          onClick={onClose}
          className={`mt-6 w-full py-2 rounded-2xl text-white ${
            success ? "bg-[#7ECD43]" : "bg-red-500"
          }`}
        >
          Confirmar
        </button>
      </div>
    </div>
  );
};