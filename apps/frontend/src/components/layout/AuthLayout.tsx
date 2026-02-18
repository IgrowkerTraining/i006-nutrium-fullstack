import React from "react";

type Props = {
  children: React.ReactNode;
};

export const AuthLayout: React.FC<Props> = ({ children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 bg-[#F3FAE8]">
      <div className="w-full max-w-[360px]">
        {children}
      </div>
    </div>
  );
};