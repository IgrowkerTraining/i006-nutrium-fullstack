import React from "react";
import { NavLink } from "react-router-dom";

export const BottomNav: React.FC = () => {
  const base = "flex flex-col items-center";

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3">
      <ul className="flex justify-between items-center text-xs">

        <li>
          <NavLink
            to="/calendario"
            className={({ isActive }) =>
              `${base} ${isActive ? "text-[#7ECD43]" : "text-[#6B7280]"}`
            }
          >
            <svg
              viewBox="0 0 25 28"
              className="w-[clamp(20px,6.3vw,32px)] h-auto"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5.875 1V3.75H18.875V1H19.625V3.75H22C22.9602 3.75 23.75 4.53978 23.75 5.5V24.75C23.75 25.7102 22.9602 26.5 22 26.5H2.75C2.28587 26.5 1.84088 26.3155 1.5127 25.9873C1.18474 25.6593 1.00026 25.2148 1 24.751L1.01367 5.50098V5.5C1.01367 4.52996 1.78581 3.75 2.75 3.75H5.125V1H5.875ZM1.75 25.75H23V10H1.75V25.75ZM18.25 20.25V21H17.5V20.25H18.25ZM12.75 20.25V21H12V20.25H12.75ZM7.25 20.25V21H6.5V20.25H7.25ZM18.25 14.75V15.5H17.5V14.75H18.25ZM12.75 14.75V15.5H12V14.75H12.75ZM7.25 14.75V15.5H6.5V14.75H7.25Z"/>
            </svg>
            <span>Citas</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/match"
            className={({ isActive }) =>
              `${base} ${isActive ? "text-[#7ECD43]" : "text-[#6B7280]"}`
            }
          >
            <svg
            viewBox="0 4 33 25"
            className="w-[clamp(24px,7.7vw,48px)] h-auto"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            >
            <path d="M26.0815 19.8066C26.8483 20.0536 27.5832 20.3454 28.2339 20.6846C29.8742 21.5395 30.6255 22.4783 30.6255 23.376V26.501H27.1255V23.376C27.1255 22.0054 26.7297 20.8217 26.0815 19.8066Z" />
            <path d="M12.375 6.5C14.8603 6.5 16.875 8.51472 16.875 11C16.875 13.4853 14.8603 15.5 12.375 15.5C9.88972 15.5 7.875 13.4853 7.875 11C7.875 8.51472 9.88972 6.5 12.375 6.5Z" />
            <path d="M12.375 18.875C14.0856 18.875 16.7092 19.3121 18.8799 20.1816C19.9642 20.616 20.8728 21.1336 21.4941 21.707C22.1087 22.2743 22.375 22.8279 22.375 23.375V26.5H2.375V23.375C2.375 22.8279 2.64127 22.2743 3.25586 21.707C3.87723 21.1336 4.78578 20.616 5.87012 20.1816C8.04076 19.3121 10.6644 18.875 12.375 18.875ZM20.625 6.5C23.1115 6.5 25.125 8.51353 25.125 11C25.125 13.4865 23.1115 15.5 20.625 15.5C20.5679 15.5 20.511 15.4978 20.4541 15.4951C21.2171 14.1285 21.625 12.5824 21.625 11C21.625 9.41727 21.2173 7.87074 20.4541 6.50391C20.511 6.50122 20.5679 6.5 20.625 6.5Z" />
            </svg>
            <span>Match</span>
          </NavLink>
        </li>

        <li>
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `${base} ${isActive ? "text-[#7ECD43]" : "text-[#6B7280]"}`
            }
          >
            <svg
              viewBox="0 0 22 22"
              className="w-[clamp(16px,5.6vw,32px)] h-auto"
              fill="currentColor"
            >
              <path d="M11 11C14.0387 11 16.5 8.53875 16.5 5.5C16.5 2.46125 14.0387 0 11 0C7.96125 0 5.5 2.46125 5.5 5.5C5.5 8.53875 7.96125 11 11 11ZM11 13.75C7.32875 13.75 0 15.5925 0 19.25V22H22V19.25C22 15.5925 14.6713 13.75 11 13.75Z"/>
            </svg>
            <span>Perfil</span>
          </NavLink>
        </li>

      </ul>
    </nav>
  );
};