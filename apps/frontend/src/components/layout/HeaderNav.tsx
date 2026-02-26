import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/nutrium-logo.svg";
import arrow from "../../assets/backArrow.svg";
import menuIcon from "../../assets/notification.svg"; // 3 líneas

import { ProfileMenuModal } from "../modals/ProfileMenuModal";
import { NotificationsModal } from "../modals/NotificationsModals";

interface HeaderNavProps {
  showBack?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ showBack }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
            <svg
              viewBox="0 0 23 28"
              className="w-[clamp(20px,6.5vw,32px)] h-auto"
              fill="#6B7280"
            >
              <path d="M11.3333 27.625C12.8917 27.625 14.1667 26.35 14.1667 24.7917H8.5C8.5 25.5431 8.79851 26.2638 9.32986 26.7951C9.86122 27.3265 10.5819 27.625 11.3333 27.625ZM19.8333 19.125V12.0417C19.8333 7.6925 17.51 4.05167 13.4583 3.08833V2.125C13.4583 0.949167 12.5092 0 11.3333 0C10.1575 0 9.20833 0.949167 9.20833 2.125V3.08833C5.1425 4.05167 2.83333 7.67833 2.83333 12.0417V19.125L0 21.9583V23.375H22.6667V21.9583L19.8333 19.125Z" />
            </svg>
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