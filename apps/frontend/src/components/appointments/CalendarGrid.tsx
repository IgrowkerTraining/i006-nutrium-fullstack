import React, { useState } from "react";

interface Props {
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
}

export const CalendarGrid: React.FC<Props> = ({
    selectedDate,
    onSelectDate,
}) => {
    const today = new Date();
    const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
    );

    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);

    const [currentMonth, setCurrentMonth] = useState(
        new Date(today.getFullYear(), today.getMonth(), 1),
    );

    const minMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);

    const changeMonth = (offset: number) => {
        const newMonth = new Date(
            currentMonth.getFullYear(),
            currentMonth.getMonth() + offset,
            1,
        );

        if (newMonth >= minMonth && newMonth <= maxMonth) {
            setCurrentMonth(newMonth);
        }
    };

    const monthName = currentMonth.toLocaleString("es-ES", {
        month: "long",
    });

    const year = currentMonth.getFullYear();

    const monthLabel = `${monthName} ${year}`;

    const startOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
    );

    const endOfMonth = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
    );

    // 🔹 Lunes como inicio de semana
    const startWeekDay = (startOfMonth.getDay() + 6) % 7;
    const totalDays = endOfMonth.getDate();

    const isPast = (date: Date) => date < todayStart;
    const isFutureLimit = (date: Date) => date > maxDate;

    const generateDays = () => {
        const days: { date: Date; current: boolean }[] = [];

        /* ============================
            🔹 DÍAS MES ANTERIOR
            Solo los necesarios
        ============================ */
        for (let i = startWeekDay - 1; i >= 0; i--) {
            const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                -i,
            );

            days.push({ date, current: false });
        }

        /* ============================
            🔹 DÍAS MES ACTUAL
        ============================ */
        for (let i = 1; i <= totalDays; i++) {
            const date = new Date(
                currentMonth.getFullYear(),
                currentMonth.getMonth(),
                i,
            );

            days.push({ date, current: true });
        }

        /* ============================
            🔹 DÍAS MES SIGUIENTE
            Solo hasta completar última fila
        ============================ */
        const remainder = days.length % 7;

        if (remainder !== 0) {
            const needed = 7 - remainder;

            for (let i = 1; i <= needed; i++) {
                const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth() + 1,
                    i,
                );

                days.push({ date, current: false });
            }
        }

        return days;
    };

    const days = generateDays();

    return (
        <section className="mt-4 bg-white p-5 rounded-lg border">
            {/* Header mes */}
            <header className="flex justify-between items-center mb-3">
                <button
                    onClick={() => changeMonth(-1)}
                    disabled={currentMonth <= minMonth}
                    className="px-2 disabled:opacity-30"
                >
                    <svg
                    viewBox="0 0 16 16"
                    className="w-4 h-4"
                    fill="currentColor"
                    >
                    <path d="M11.7265 12L12.6665 11.06L9.61317 8L12.6665 4.94L11.7265 4L7.7265 8L11.7265 12Z" />
                    <path d="M7.33344 12L8.27344 11.06L5.2201 8L8.27344 4.94L7.33344 4L3.33344 8L7.33344 12Z" />
                    </svg>
                </button>

                <h3 className="font-semibold capitalize">{monthLabel}</h3>

                <button
                    onClick={() => changeMonth(1)}
                    disabled={currentMonth >= maxMonth}
                    className="px-2 disabled:opacity-30"
                >
                    <svg
                    viewBox="0 0 16 16"
                    className="w-4 h-4"
                    fill="currentColor"
                    >
                    <path d="M4.2735 4L3.3335 4.94L6.38683 8L3.3335 11.06L4.2735 12L8.2735 8L4.2735 4Z" />
                    <path d="M8.66656 4L7.72656 4.94L10.7799 8L7.72656 11.06L8.66656 12L12.6666 8L8.66656 4Z" />
                    </svg>
                </button>
            </header>

            {/* Días semana */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium">
                {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
                    <span key={day}>{day}</span>
                ))}
            </div>

            {/* Grid días */}
            <div className="grid grid-cols-7 gap-2 mt-2 text-center">
                {days.map(({ date, current }, index) => {
                    const disabled = isPast(date) || isFutureLimit(date);
                    const isSelected =
                        selectedDate && date.toDateString() === selectedDate.toDateString();

                    return (
                        <button
                            key={index}
                            disabled={disabled}
                            onClick={() => {
                                onSelectDate(date);

                                if (!current) {
                                    setCurrentMonth(
                                    new Date(date.getFullYear(), date.getMonth(), 1)
                                    );
                                }
                            }}
                            className={`
                                py-2 rounded-full text-sm transition
                                ${isSelected
                                    ? "bg-[#7ECD43] text-white"
                                    : disabled
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : current
                                            ? "text-slate-700"
                                            : "text-slate-400"
                                }
                `}
                        >
                            {date.getDate()}
                        </button>
                    );
                })}
            </div>
        </section>
    );
};
