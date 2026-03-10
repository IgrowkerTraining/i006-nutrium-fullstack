import React, { useState } from "react";
import { api } from "../../services/api";
import { storage } from "../../utils/storage";
import { Button } from "./Button";

interface AppointmentModalProps {
  nutritionistId: string;
  onClose: () => void;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ nutritionistId, onClose }) => {
  const [aptDate, setAptDate] = useState("");
  const [aptStart, setAptStart] = useState("09:00");
  const [aptEnd, setAptEnd] = useState("10:00");
  const [aptNotes, setAptNotes] = useState("");
  const [aptLoading, setAptLoading] = useState(false);
  const [aptMsg, setAptMsg] = useState<string | null>(null);

  const token = storage.getToken();

  const handleConfirm = async () => {
    if (!token || !aptDate) return;
    setAptLoading(true);
    setAptMsg(null);
    try {
      await api.createAppointment(token, {
        nutritionist_id: nutritionistId,
        appointment_date: aptDate,
        start_time: aptStart,
        end_time: aptEnd,
        notes: aptNotes || undefined,
      });
      setAptMsg("Cita agendada exitosamente");
      setTimeout(() => onClose(), 1500);
    } catch (err: any) {
      setAptMsg(err.message || "Error al agendar la cita");
    } finally {
      setAptLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl p-6 mx-4 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Agendar cita</h3>

        <label className="block text-sm font-medium mb-1">Fecha</label>
        <input type="date" value={aptDate} onChange={(e) => setAptDate(e.target.value)}
          min={new Date().toISOString().split("T")[0]}
          className="w-full border rounded-lg px-3 py-2 mb-3" />

        <div className="flex gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Inicio</label>
            <input type="time" value={aptStart} onChange={(e) => setAptStart(e.target.value)}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Fin</label>
            <input type="time" value={aptEnd} onChange={(e) => setAptEnd(e.target.value)}
              className="w-full border rounded-lg px-3 py-2" />
          </div>
        </div>

        <label className="block text-sm font-medium mb-1">Notas (opcional)</label>
        <input type="text" value={aptNotes} onChange={(e) => setAptNotes(e.target.value)}
          placeholder="Ej: Virtual, Presencial..."
          className="w-full border rounded-lg px-3 py-2 mb-4" />

        {aptMsg && (
          <p className={`text-sm mb-3 ${aptMsg.includes("exitosamente") ? "text-green-600" : "text-red-500"}`}>
            {aptMsg}
          </p>
        )}

        <div className="flex gap-3">
          <Button onClick={onClose} className="flex-1 bg-gray-200 text-gray-700">Cancelar</Button>
          <Button onClick={handleConfirm} disabled={!aptDate || aptLoading} className="flex-1">
            {aptLoading ? "Agendando..." : "Confirmar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentModal;
