import React, { useEffect, useState } from "react";
import { Notification } from "../../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  /* ============================
     🔒 BLOQUEAR SCROLL
  ============================ */
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

  /* ============================
     🔄 SIMULACIÓN BACKEND
  ============================ */
  useEffect(() => {
    if (!isOpen) return;

    // Aquí irá tu fetch real
    const mockData: Notification[] = [
      {
        id: "1",
        type: "info",
        message: "Hoy tienes una cita conmigo, no lo olvides",
        read: false,
        createdAt: new Date().toISOString(),
      },
      {
        id: "2",
        type: "error",
        message: "Laura canceló tu cita",
        read: false,
        createdAt: new Date().toISOString(),
      },
    ];

    setNotifications(mockData);
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center px-6 z-50 transition-opacity duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          bg-white rounded-3xl shadow-xl w-full max-w-sm p-6 space-y-4
          transform transition-all duration-200 ease-out
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}
      >
        {/*   */}

        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No tienes notificaciones.
          </p>
        ) : (
          notifications.map((notification) => (
            <article
              key={notification.id}
              className={`
                flex items-start gap-3 p-3 rounded-xl shadow-sm
                ${notification.type === "error"
                  ? "border border-red-400"
                  : "bg-white"}
              `}
            >
              <div className="w-10 h-10 rounded-full bg-slate-200" />

              <div className="flex-1 text-sm">
                {notification.message}
              </div>

              <button
                onClick={() =>
                  setNotifications(prev =>
                    prev.filter(n => n.id !== notification.id)
                  )
                }
                className="text-slate-400"
              >
                ✕
              </button>
            </article>
          ))
        )}
      </div>
    </div>
  );
};