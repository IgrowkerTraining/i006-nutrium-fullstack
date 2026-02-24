import React, { useState, useRef, useEffect } from "react";
import { CalendarGrid } from "./CalendarGrid";

interface Props {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

export const DatePicker: React.FC<Props> = ({
  selectedDate,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate));
  const containerRef = useRef<HTMLDivElement>(null);

  /* 🔒 Cerrar con pointerdown (mobile-safe) */
  useEffect(() => {
    const handleOutside = (event: PointerEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleOutside);
    return () =>
      document.removeEventListener("pointerdown", handleOutside);
  }, []);

  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const isDateSelectable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    return date >= today && date <= maxDate;
  };

  const formatDate = (date: Date) =>
    date.toLocaleDateString("es-ES");

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-white border border-slate-200 rounded-xl px-4 py-3"
      >
        <div className="flex items-center gap-3">
          {/* Icono calendario */}
          <svg
            viewBox="0 0 25 28"
            className="w-5 h-5 text-[#7ECD43]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5.875 1V3.75H18.875V1H19.625V3.75H22C22.9602 3.75 23.75 4.53978 23.75 5.5V24.75C23.75 25.7102 22.9602 26.5 22 26.5H2.75C2.28587 26.5 1.84088 26.3155 1.5127 25.9873C1.18474 25.6593 1.00026 25.2148 1 24.751L1.01367 5.50098V5.5C1.01367 4.52996 1.78581 3.75 2.75 3.75H5.125V1H5.875Z" />
          </svg>

          <span>{formatDate(selectedDate)}</span>
        </div>

        <span className={`transition ${isOpen ? "rotate-180" : ""}`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-3 bg-white border rounded-xl p-4 shadow-lg w-full">
          <div className="flex justify-between mb-4">
            <button onClick={() => changeMonth(-1)}>←</button>
            <span className="font-semibold">
              {currentMonth.toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}
            </span>
            <button onClick={() => changeMonth(1)}>→</button>
          </div>

          <CalendarGrid
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onSelectDate={(date) => {
              onChange(date);
              setIsOpen(false);
            }}
            isDateSelectable={isDateSelectable}
          />
        </div>
      )}
    </div>
  );
};