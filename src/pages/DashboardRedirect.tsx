import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role === "farmer") {
        navigate("/farmer-dashboard");
      } else if (profile.role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/consumer-dashboard");
      }
    }
  }, [profile, loading, navigate]);

  return <div className="h-screen flex items-center justify-center font-serif italic text-brand-primary">Redirecting to your dashboard...</div>;
}
