import React from "react";
import { ProfileFields } from "./ProfileFields";
import { Button } from "../common/Button";
import { Patient, Nutritionist } from "../../types";

type Props = {
  profile: Patient | Nutritionist;
  onEdit: () => void;
  onLogout: () => void;
};

export const ProfilePage: React.FC<Props> = ({
  profile,
  onEdit,
  onLogout,
}) => {
  return (
    <div className="flex flex-col h-screen">

      <main className="flex-1 pb-24 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden">
        <section className="px-6">
          <h2 className="text-xl font-semibold text-left">
            Tu Perfil
          </h2>
        </section>

        <hr className="w-screen border-t-1 border-[#7ECD43] my-4" />

        <section className="flex justify-center mx-6 my-[clamp(43px,10.94vw,80px)]">
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.fullName}
              className="w-[clamp(260px,85vw,600px)] h-auto aspect-[334/293] object-cover rounded-xl"
            />
          ) : (
            <div className="w-[clamp(260px,85vw,600px)] aspect-[334/293] rounded-xl bg-slate-100 flex items-center justify-center">
              <span className="text-6xl text-slate-400">
                {profile.fullName?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </section>

        <ProfileFields profile={profile} />

        <section className="flex flex-col gap-4 mx-6 mt-8">
          <Button className="w-full rounded-2xl" onClick={onEdit}>
            Editar
          </Button>
          <Button variant="outline" className="w-full rounded-2xl border-[#FE4E4A] text-[#FE4E4A] hover:bg-[#FE4E4A]/10" onClick={onLogout}>
            Cerrar sesión
          </Button>
        </section>
      </main>

    </div>
  );
};