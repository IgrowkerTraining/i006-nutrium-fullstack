import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Layout } from "../components/layout/Layout";

const CuestionarioSalud: React.FC = () => {
  const navigate = useNavigate();

  return (
      
      <div>
        
        <h1>Cuestionario de Salud</h1>
        
        
        <Button onClick={() => navigate("/cuestionario-personal")}>
          Siguiente
        </Button>

        
        <Button onClick={() => navigate("/dashboard")}>
          Finalizar
        </Button>


      </div>

  );
};

export default CuestionarioSalud;