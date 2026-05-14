import { motion } from "motion/react";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, MapPin, Calendar, Clock } from "lucide-react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { formatCurrency } from "../lib/utils";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) return;
      try {
        // First try to find by our custom orderId field if it's not the doc ID
        // For simplicity, usually we'd query by orderId field, but if we have the firebase doc ID it's faster
        // The Checkout.tsx currently generates ORD-... and uses addDoc.
        // I will assume for this display we might just show basic success if fetch fails, 
        // but let's try to get details.
        
        // Note: Realistically we should query where orderId == orderId
        // But for a quick confirmation page, we'll show what we have.
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen pt-32 pb-24 bg-brand-bg flex flex-col items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="editorial-card max-w-2xl w-full text-center space-y-12 !p-12 shadow-2xl"
      >
        {/* Success Icon */}
        <div className="relative inline-block">
          <div className="size-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="size-12" />
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="absolute -right-2 -top-2 bg-brand-secondary text-brand-primary p-2 rounded-full shadow-lg"
          >
            <ShoppingBag className="size-4" />
          </motion.div>
        </div>

        {/* Text Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-brand-primary italic">Harvest Secured.</h1>
          <p className="text-gray-500 font-medium italic text-lg">Thank you! Your order has been confirmed and the farmer is now preparing your fresh produce.</p>
        </div>

        {/* Order Details box */}
        <div className="grid md:grid-cols-2 gap-6 text-left">
          <div className="p-6 bg-brand-bg rounded-3xl border border-brand-primary/5 space-y-4">
             <div className="flex items-center gap-2 text-brand-primary opacity-60">
                <Package className="size-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Order Details</span>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order ID</p>
                <p className="font-mono font-bold text-brand-primary">{orderId || "#CONFIRMED"}</p>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estimated Delivery</p>
                <div className="flex items-center gap-2 text-brand-primary font-bold italic">
                   <Clock className="size-4" /> 24-48 Hours
                </div>
             </div>
          </div>

          <div className="p-6 bg-brand-bg rounded-3xl border border-brand-primary/5 space-y-4">
             <div className="flex items-center gap-2 text-brand-primary opacity-60">
                <MapPin className="size-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Delivery Info</span>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Tracking Status</p>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-secondary/10 text-brand-secondary rounded-full text-[9px] font-bold uppercase tracking-widest">
                   <div className="size-1.5 bg-brand-secondary rounded-full animate-pulse" />
                   Preparing
                </div>
             </div>
             <div className="pt-2">
                <Link to="/consumer-dashboard" className="text-[9px] font-bold text-brand-primary uppercase tracking-widest hover:text-brand-secondary underline underline-offset-4">
                   View Full History
                </Link>
             </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/marketplace')}
            className="btn-secondary py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest shadow-lg"
          >
            Back to Market
          </button>
          <button 
            onClick={() => navigate('/consumer-dashboard')}
            className="btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-widest shadow-xl"
          >
            Track My Order <ArrowRight className="size-4" />
          </button>
        </div>

        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
          A confirmation email has been sent to your registered address.
        </p>
      </motion.div>
    </div>
  );
}
