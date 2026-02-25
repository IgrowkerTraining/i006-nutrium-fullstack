import React from "react";

interface Props {
  selectedDate: Date | null;
  isOpen: boolean;
  onToggle: () => void;
}

export const DateSelector: React.FC<Props> = ({
  selectedDate,
  isOpen,
  onToggle,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3"
    >
      <div className="flex items-center gap-3 text-slate-700">
        <svg
          viewBox="0 0 25 28"
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M5.875 1V3.75H18.875V1H19.625V3.75H22C22.9602 3.75 23.75 4.53978 23.75 5.5V24.75C23.75 25.7102 22.9602 26.5 22 26.5H2.75C2.28587 26.5 1.84088 26.3155 1.5127 25.9873C1.18474 25.6593 1.00026 25.2148 1 24.751L1.01367 5.50098V5.5C1.01367 4.52996 1.78581 3.75 2.75 3.75H5.125V1H5.875ZM1.75 25.75H23V10H1.75V25.75ZM18.25 20.25V21H17.5V20.25H18.25ZM12.75 20.25V21H12V20.25H12.75ZM7.25 20.25V21H6.5V20.25H7.25ZM18.25 14.75V15.5H17.5V14.75H18.25ZM12.75 14.75V15.5H12V14.75H12.75ZM7.25 14.75V15.5H6.5V14.75H7.25Z"/>
        </svg>

        <span>
          {selectedDate
            ? selectedDate.toLocaleDateString("es-ES")
            : "Selecciona una fecha"}
        </span>
      </div>

      <span className={`transition-transform ${!isOpen ? "rotate-180" : ""}`}>
        <svg
          viewBox="0 0 13 8"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-auto"
        >
          <path d="M1.46875 0L6.25 4.77083L11.0312 0L12.5 1.46875L6.25 7.71875L0 1.46875L1.46875 0Z" />
        </svg>
      </span>
    </button>
  );
};