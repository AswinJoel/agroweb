import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardRedirect() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (profile) {
        if (profile.role === "farmer") {
          navigate("/farmer-dashboard", { replace: true });
        } else if (profile.role === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else {
          navigate("/consumer-dashboard", { replace: true });
        }
      } else if (!user) {
        // Not logged in at all
        navigate("/login", { replace: true });
      }
    }
  }, [profile, loading, user, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-brand-bg gap-6">
      <div className="size-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
      <div className="font-serif italic text-brand-primary text-xl animate-pulse">
        Synchronizing your agriculture profile...
      </div>
    </div>
  );
}
