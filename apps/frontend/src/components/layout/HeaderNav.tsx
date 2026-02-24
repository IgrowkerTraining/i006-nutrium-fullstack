import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/nutrium-logo.svg";
import arrow from "../../assets/backArrow.svg";
import menu from "../../assets/notification.svg";

interface HeaderNavProps {
  showBack?: boolean;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ showBack }) => {
  const navigate = useNavigate();

  return (
    <header className="w-full flex items-center justify-between px-[5vw] py-[3vw]">

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

      <img
        src={logo}
        alt="Nutrium"
        className="w-[clamp(100px,34vw,180px)] h-auto"
      />

      <button aria-label="Menú">
        <img
          src={menu}
          alt="Menú"
          className="w-[clamp(20px,6.5vw,32px)] h-auto"
        />
      </button>

    </header>
  );
};