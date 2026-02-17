import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Layout } from "../components/layout/Layout";

const CuestionarioPersonal: React.FC = () => {
  const navigate = useNavigate();

  return (
    // Layout envuelve todo (fondo oscuro)
    <Layout>
      // Un div para centrar el contenido
      <div>
        // Título
        <h1>Cuestionario Personal</h1>
        
        // El botón que navega
        <Button onClick={() => navigate("/cuestionario-salud")}>
          Siguiente
        </Button>
      </div>
    </Layout>

  );
};

export default CuestionarioPersonal;