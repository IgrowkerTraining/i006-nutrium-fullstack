import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/common/Button";
import { Layout } from "../components/layout/Layout";

const CuestionarioSalud: React.FC = () => {
  const navigate = useNavigate();

  return (
    
    <Layout>
      
      <div>
        
        <h1>Cuestionario Personal</h1>
        
        
        <Button onClick={() => navigate("/cuestionario-personal")}>
          Siguiente
        </Button>

        
        <Button onClick={() => navigate("/dashboard")}>
          Finalizar
        </Button>


      </div>
    </Layout>

  );
};

export default CuestionarioSalud;