import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";

export default function DashboardRedirect() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (profile) {
        if (profile.role === "farmer") {
          // Immediate redirect for farmers as requested
          navigate("/farmer-dashboard?tab=inventory", { replace: true });
        } else {
          // Deliberate "Slow" transition for consumers (main aspect)
          const timer = setTimeout(() => {
            const path = profile.role === "admin" ? "/admin-dashboard" : "/consumer-dashboard";
            navigate(path, { replace: true });
          }, 2000);
          return () => clearTimeout(timer);
        }
      } else if (!user) {
        navigate("/login", { replace: true });
      } else {
        // Logged in but no profile - go to role selection screen immediately
        navigate("/login", { replace: true });
      }
    }
  }, [profile, loading, user, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-white gap-8 p-12 text-center">
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          rotate: [0, 90, 180, 270, 360]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="size-16 bg-brand-primary rounded-3xl shadow-2xl"
      />
      <div className="space-y-2">
        <h2 className="text-3xl font-bold text-brand-primary italic">Handshaking...</h2>
        <p className="text-gray-400 text-xs font-bold uppercase tracking-[0.3em] animate-pulse">Personalizing your agricultural ecosystem</p>
      </div>
    </div>
  );
}
