import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let timeout: any;
    if (!loading) {
      if (profile) {
        if (profile.role === "farmer") {
          navigate("/farmer-dashboard");
        } else if (profile.role === "admin") {
          navigate("/admin-dashboard");
        } else {
          navigate("/consumer-dashboard");
        }
      } else {
        // Fallback if profile is slow or missing
        timeout = setTimeout(() => {
          console.warn("DashboardRedirect: Profile still null after 3s, defaulting to consumer");
          navigate("/consumer-dashboard");
        }, 3000);
      }
    }
    return () => clearTimeout(timeout);
  }, [profile, loading, navigate]);

  return <div className="h-screen flex items-center justify-center font-serif italic text-brand-primary">Redirecting to your dashboard...</div>;
}
