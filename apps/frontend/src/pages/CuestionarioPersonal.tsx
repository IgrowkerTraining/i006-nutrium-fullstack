import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Layout } from "../components/layout/Layout";

const CuestionarioPersonal: React.FC = () => {
  const navigate = useNavigate();

  return (
      <div>
        <h1>Cuestionario Personal</h1>
        
        <Button onClick={() => navigate("/cuestionario-salud")}>
          Siguiente
        </Button>
      </div>

  );
};

export default CuestionarioPersonal;