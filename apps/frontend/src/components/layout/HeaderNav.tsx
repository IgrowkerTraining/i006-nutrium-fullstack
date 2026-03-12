import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/nutrium-logo.svg";
import arrow from "../../assets/backArrow.svg";
import menuIcon from "../../assets/notification.svg"; // 3 líneas

import { ProfileMenuModal } from "../modals/ProfileMenuModal";
import { NotificationsModal } from "../modals/NotificationsModals";
import { useAuth } from "../../hooks/useAuth";
import { storage } from "../../utils/storage";
import { checkForNewNotifications } from "../../services/notificationService";

import campanita from "../../assets/campanita.png"
import campanitaNoti from "../../assets/campanita_notificacion.png"

interface HeaderNavProps {
  showBack?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [hasNotifications, setHasNotifications] = useState(false);

  // Al cargar la página: verificar si hay cambios en citas y actualizar el icono
  useEffect(() => {
    if (!user || isNotificationsOpen) return;
    const token = storage.getToken();
    if (!token) return;

    checkForNewNotifications(token, user.id, user.role).then((notifs) => {
      setHasNotifications(notifs.length > 0);
    });
  }, [user, isNotificationsOpen]);

  const isProfile = location.pathname === "/perfil";
  const isMatchOrCalendar =
    location.pathname === "/match" ||
    location.pathname === "/calendario";

  return (
    <>
      <header className="w-full flex items-center justify-between px-[5vw] py-[3vw]">

        {/* BACK */}
        {showBack ? (
          <button onClick={() => navigate("/match")} aria-label="Volver">
            <img
              src={arrow}
              alt="Volver"
              className="w-[clamp(20px,6.5vw,32px)] h-auto"
            />
          </button>
        ) : (
          <div className="w-[6.5vw]" />
        )}

        {/* LOGO */}
        <img
          src={logo}
          alt="Nutrium"
          className="w-[clamp(100px,34vw,180px)] h-auto"
        />

        {/* RIGHT ICON */}
        {isProfile && (
          <button onClick={() => setIsMenuOpen(true)} aria-label="Menú">
            <img
              src={menuIcon}
              alt="Menú"
              className="w-[clamp(20px,6.5vw,32px)] h-auto"
            />
          </button>
        )}

        {isMatchOrCalendar && (
          <button onClick={() => setIsNotificationsOpen(true)} aria-label="Notificaciones">
            <img
              src={hasNotifications ? campanitaNoti : campanita}
              alt="Notificaciones"
              className="w-[clamp(28px,8vw,40px)] h-auto"
            />
          </button>
        )}
      </header>

      <ProfileMenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};