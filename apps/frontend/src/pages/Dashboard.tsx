import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }

    if (user.role === "nutritionist") {
      navigate("/match/paciente-list", { replace: true });
      return;
    }

    navigate("/match/nutri-list", { replace: true });
  }, [navigate, user]);

  return null;
};

export default Dashboard;
