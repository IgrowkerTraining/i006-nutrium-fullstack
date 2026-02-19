/* Para páginas privadas */

import React from 'react';
import { Button } from '../common/Button';

interface HeaderProps {
  isBackendOnline: boolean | null;
  user: any;
  logout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isBackendOnline, user, logout }) => {

  return (
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
              />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            NEXUS
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-white">{user.name}</span>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-1.5 h-1.5 rounded-full ${isBackendOnline ? "bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.8)]" : "bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"} animate-pulse`}
              ></div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                {isBackendOnline ? "Backend Online" : "Backend Offline"}
              </span>
            </div>
          </div>
          <img
            src={user.avatar}
            alt={user.name}
            className="w-10 h-10 rounded-full border-2 border-slate-800 shadow-lg"
          />
          <Button variant="outline" className="hidden sm:flex" onClick={logout}>
            Log Out
          </Button>
        </div>
      </nav>
  );
};

export default Header;