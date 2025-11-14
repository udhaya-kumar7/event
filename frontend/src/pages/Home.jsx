import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Home removed — redirect to Discover so old links won't break
const Home = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/discover", { replace: true });
  }, [navigate]);
  return null;
};

export default Home;
