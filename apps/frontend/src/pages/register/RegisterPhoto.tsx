import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../../components/layout/AuthLayout";
import { Button } from "../../components/common/Button";
import { BackButton } from "../../components/common/BackButton";

const PHOTO_KEY = "nutrium_register_photo";

type SavedPhoto = {
  dataUrl: string; // base64
  name?: string;
  type?: string;
  size?: number;
};

const RegisterPhoto: React.FC = () => {
  const navigate = useNavigate();

  const fileInputGalleryRef = useRef<HTMLInputElement | null>(null);
  const fileInputCameraRef = useRef<HTMLInputElement | null>(null);

  const saved = useMemo(() => {
    try {
      const raw = localStorage.getItem(PHOTO_KEY);
      if (!raw) return null;
      return JSON.parse(raw) as SavedPhoto;
    } catch {
      return null;
    }
  }, []);

  const [photo, setPhoto] = useState<SavedPhoto | null>(saved);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const role = localStorage.getItem("nutrium_role");
    if (!role) {
      navigate("/landing-acceso", { replace: true });
    }
  }, [navigate]);

  // Persistir foto
  useEffect(() => {
    if (!photo) {
      localStorage.removeItem(PHOTO_KEY);
      return;
    }
    localStorage.setItem(PHOTO_KEY, JSON.stringify(photo));
  }, [photo]);

  const readFileAsDataUrl = (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona una imagen válida.");
      return;
    }

    // límite simple (opcional)
    const maxMB = 5;
    const maxBytes = maxMB * 1024 * 1024;
    if (file.size > maxBytes) {
      setError(`La imagen es muy pesada. Máximo ${maxMB}MB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setPhoto({
        dataUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    };
    reader.onerror = () => setError("No se pudo leer el archivo.");
    reader.readAsDataURL(file);
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFileAsDataUrl(file);

    // permitir volver a seleccionar el mismo archivo
    e.target.value = "";
  };

  const goNextByRole = () => {
    const role = localStorage.getItem("nutrium_role");

    if (role === "nutritionist") return navigate("/register/confirm");
    if (role === "patient") return navigate("/register/confirm");

    navigate("/landing-acceso", { replace: true });
  };

  return (
    <AuthLayout>
      <div className="relative mb-4">
        <BackButton />
      </div>

      <h2 className="text-2xl font-semibold text-center mb-2">¡Queremos conocerte!</h2>

      <p className="text-center text-slate-500 mb-6">
        Sube una foto tuya para que podamos personalizar tu experiencia.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-600 text-sm p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center mb-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-28 h-28 rounded-full overflow-hidden border border-slate-200 bg-white/60 flex items-center justify-center">
            {photo?.dataUrl ? (
              <img
                src={photo.dataUrl}
                alt="Foto seleccionada"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-slate-400 text-sm">Sin foto</span>
            )}
          </div>

          <div className="w-full grid grid-cols-1 gap-3">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => fileInputGalleryRef.current?.click()}
            >
              Subir desde el dispositivo
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => fileInputCameraRef.current?.click()}
            >
              Tomar desde la cámara
            </Button>

            {photo?.dataUrl && (
              <button
                type="button"
                onClick={() => setPhoto(null)}
                className="text-sm text-red-600 hover:underline"
              >
                Quitar foto
              </button>
            )}
          </div>
        </div>

        {/* inputs ocultos */}
        <input
          ref={fileInputGalleryRef}
          type="file"
          accept="image/*"
          onChange={onPickFile}
          className="hidden"
        />

        <input
          ref={fileInputCameraRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={onPickFile}
          className="hidden"
        />
      </div>

      <Button className="w-full mb-3" onClick={goNextByRole}>
        Continuar
      </Button>

      <Button variant="secondary" className="w-full" onClick={goNextByRole}>
        Omitir
      </Button>
    </AuthLayout>
  );
};

export default RegisterPhoto;