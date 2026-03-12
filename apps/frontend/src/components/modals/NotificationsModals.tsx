import React, { useEffect, useState } from "react";
import { Notification } from "../../types";
import { useAuth } from "../../hooks/useAuth";
import { storage } from "../../utils/storage";
import { checkForNewNotifications } from "../../services/notificationService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsModal: React.FC<Props> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ============================
     BLOQUEAR SCROLL
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
     CARGAR NOTIFICACIONES REALES
  ============================ */
  useEffect(() => {
    if (!isOpen || !user) return;

    const token = storage.getToken();
    if (!token) return;

    setLoading(true);
    checkForNewNotifications(token, user.id, user.role)
      .then((notifs) => setNotifications(notifs))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, [isOpen, user]);

  /* ============================
     ELIMINAR UNA NOTIFICACIÓN
  ============================ */
  const handleDismiss = (notifId: string) => {
    const updated = notifications.filter((n) => n.id !== notifId);
    setNotifications(updated);
    // También actualizar localStorage para que no vuelva a aparecer
    if (user) {
      storage.setNotifications(user.id, updated);
    }
  };

  if (!isOpen) return null;

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
        {loading ? (
          <p className="text-sm text-slate-500 text-center py-6">
            Cargando notificaciones...
          </p>
        ) : notifications.length === 0 ? (
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
                onClick={() => handleDismiss(notification.id)}
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
