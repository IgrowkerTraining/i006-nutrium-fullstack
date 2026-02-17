import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Layout } from "../components/layout/Layout";

const CuestionarioSalud: React.FC = () => {
  const navigate = useNavigate();

  return (
    // Layout envuelve todo (fondo oscuro)
    <Layout>
      // Un div para centrar el contenido
      <div>
        // Título
        <h1>Cuestionario Personal</h1>
        
        // El botón que navega
        <Button onClick={() => navigate("/cuestionario-personal")}>
          Siguiente
        </Button>

        // El botón que finaliza
        <Button onClick={() => navigate("/dashboard")}>
          Finalizar
        </Button>


      </div>
    </Layout>

  );
};

export default CuestionarioSalud;