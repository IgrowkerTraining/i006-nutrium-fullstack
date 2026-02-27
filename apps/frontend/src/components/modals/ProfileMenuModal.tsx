import React, { useEffect, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileMenuModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setTimeout(() => setIsVisible(true), 10);
    } else {
      document.body.style.overflow = "auto";
      setIsVisible(false);
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white rounded-3xl shadow-xl w-full max-w-sm p-8 space-y-6 text-center
          transform transition-all duration-200 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        <button className="text-lg font-medium">
          Solicitar descarga de datos
        </button>

        <button className="text-lg font-medium">
          Ver términos y condiciones
        </button>

        <button className="text-lg font-medium text-red-500">
          Eliminar cuenta
        </button>
      </div>
    </div>
  );
};