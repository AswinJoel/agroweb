import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Users, ShoppingBag, ArrowRight, ShieldCheck, Leaf, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Login() {
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoleSelection = async (role: 'farmer' | 'consumer') => {
    try {
      setLoading(role);
      setError(null);
      await signIn(role);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      let message = err.message || "Authentication failed. Please check your popup blocker or try again.";
      if (message.includes("auth/unauthorized-domain")) {
        message = "Unauthorized Domain: Please add this domain to your Firebase Console under Authentication > Settings > Authorized domains.";
      }
      setError(message);
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-brand-bg relative overflow-hidden flex items-center justify-center">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <div className="absolute top-[-10%] right-[-5%] size-96 bg-brand-secondary/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-5%] size-[500px] bg-brand-accent/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-4xl w-full px-4 text-center space-y-12">
        <div className="space-y-4">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-brand-primary text-xs font-bold uppercase tracking-widest border border-brand-primary/5"
          >
            <ShieldCheck className="size-4 text-brand-secondary" />
            Secure Authentication
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-brand-primary italic">
            Welcome to <span className="accent-text not-italic">AgroConnect.</span>
          </h1>
          <p className="text-gray-500 font-medium italic text-lg max-w-lg mx-auto">
            Directly connecting India's finest farmers to households across the nation. Select your path to begin.
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
          >
            <AlertCircle className="size-5 shrink-0" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Farmer Login */}
          <motion.div 
            whileHover={!loading ? { y: -8 } : {}}
            className={cn(
              "editorial-card group text-left space-y-8 cursor-pointer !p-10 border-2 border-transparent hover:border-brand-secondary/30 transition-all shadow-xl relative",
              loading === 'farmer' && "opacity-70 pointer-events-none"
            )}
            onClick={() => handleRoleSelection('farmer')}
          >
            <div className="size-16 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary group-hover:bg-brand-secondary group-hover:text-brand-primary transition-colors">
              {loading === 'farmer' ? <Loader2 className="animate-spin size-8" /> : <Users className="size-8" />}
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold italic text-brand-primary">Farmer Login.</h3>
              <p className="text-gray-500 font-medium leading-relaxed italic">
                List your field yields, manage inventory, and reach thousands of customers directly without middlemen.
              </p>
            </div>
            <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-primary group-hover:text-brand-secondary transition-colors">
              {loading === 'farmer' ? 'Signing in...' : 'Continue as Farmer'} <ArrowRight className="size-4" />
            </button>
          </motion.div>

          {/* Consumer Login */}
          <motion.div 
            whileHover={!loading ? { y: -8 } : {}}
            className={cn(
              "editorial-card group text-left space-y-8 cursor-pointer !p-10 border-2 border-transparent hover:border-brand-primary/10 transition-all shadow-xl relative",
              loading === 'consumer' && "opacity-70 pointer-events-none"
            )}
            onClick={() => handleRoleSelection('consumer')}
          >
            <div className="size-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
              {loading === 'consumer' ? <Loader2 className="animate-spin size-8" /> : <ShoppingBag className="size-8" />}
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-bold italic text-brand-primary">Customer Login.</h3>
              <p className="text-gray-500 font-medium leading-relaxed italic">
                Browse fresh harvests daily, support local farmers, and get high-quality organic produce delivered home.
              </p>
            </div>
            <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-primary group-hover:text-brand-secondary transition-colors">
              {loading === 'consumer' ? 'Signing in...' : 'Continue as Customer'} <ArrowRight className="size-4" />
            </button>
          </motion.div>
        </div>

        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
          Powered by Agri-Vision AI & Secure Transactions
        </p>
      </div>
    </div>
  );
}
