import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { collection, query, where, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, ShieldCheck, ShieldAlert, X, 
  ExternalLink, Calendar, Mail, Loader2,
  Navigation, MapPin, Truck, FileSpreadsheet,
  CheckCircle2, Clock
} from "lucide-react";
import { cn } from "../lib/utils";
import { syncToSheets } from "../services/sheetsService";

interface Farmer {
  uid: string;
  name: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  role: string;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [pendingFarmers, setPendingFarmers] = useState<Farmer[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchPendingFarmers();
    
    // Listen for live deliveries
    const q = query(collection(db, "orders"), where("deliveryStatus", "in", ["shipped", "out-for-delivery", "preparing"]));
    const unsub = onSnapshot(q, (snap) => {
      setActiveDeliveries(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Admin Dashboard Snapshot Error:", err);
      setActiveDeliveries([]);
    });

    return unsub;
  }, []);

  const handleExportToSheets = async () => {
    setIsExporting(true);
    try {
      for (const f of pendingFarmers) {
        await syncToSheets('farmers', f);
      }
      alert("Platform data synced to Google Sheets successfully!");
    } catch (err) {
      console.error(err);
    } finally {
      setIsExporting(false);
    }
  };

  const fetchPendingFarmers = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users"), 
        where("role", "==", "farmer"), 
        where("isVerified", "==", false)
      );
      const snapshot = await getDocs(q);
      const farmers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as Farmer));
      setPendingFarmers(farmers);
    } catch (err) {
      console.error("Error fetching farmers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (uid: string, approve: boolean) => {
    setProcessing(uid);
    try {
      if (approve) {
        await updateDoc(doc(db, "users", uid), { isVerified: true });
      } else {
        await updateDoc(doc(db, "users", uid), { role: "consumer" });
      }
      setPendingFarmers(prev => prev.filter(f => f.uid !== uid));
    } catch (err) {
      console.error("Error updating farmer status:", err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] p-4 md:p-8 lg:p-12 pt-24">
      <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary text-brand-accent text-[10px] font-bold uppercase rounded-full">
            <ShieldCheck className="size-3" />
            Admin Control Center
          </div>
          <h1 className="text-4xl md:text-5xl font-bold italic text-brand-primary tracking-tighter">AgroConnect Operations</h1>
          <p className="text-gray-500 text-sm italic font-medium">Managing trust in the digital agriculture ecosystem.</p>
        </div>

        <div className="flex gap-4">
           <button 
             onClick={handleExportToSheets}
             disabled={isExporting}
             className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center gap-4 hover:shadow-lg transition-all"
           >
              <div className="size-10 bg-brand-bg rounded-lg flex items-center justify-center text-brand-primary">
                {isExporting ? <Loader2 className="animate-spin size-5" /> : <FileSpreadsheet className="size-5" />}
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-gray-400">Database Sync</p>
                <p className="text-xs font-bold text-brand-primary uppercase tracking-widest italic">Export to Sheets</p>
              </div>
           </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* Verification Queue */}
          <div className="glass p-8 rounded-[3rem] shadow-xl border-white/50 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-brand-primary flex items-center gap-3 italic tracking-tight">
                Farmer Verification Queue
                <span className="size-6 bg-brand-secondary text-brand-primary rounded-full flex items-center justify-center text-xs font-bold">{pendingFarmers.length}</span>
              </h2>
              <button 
                onClick={fetchPendingFarmers}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="Refresh Records"
              >
                <Loader2 className={cn("size-5 text-gray-400", loading && "animate-spin")} />
              </button>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center gap-4">
                 <div className="animate-spin size-8 border-4 border-brand-secondary border-t-transparent rounded-full" />
                 <p className="text-sm italic text-gray-400">Neural Sync in Progress...</p>
              </div>
            ) : pendingFarmers.length === 0 ? (
              <div className="py-20 text-center space-y-4">
                <div className="size-20 bg-green-50 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="size-10 text-green-500" />
                </div>
                <h4 className="text-xl font-bold text-brand-primary italic">Queue Clear.</h4>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">All recent farmer registrations have been digitally verified.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingFarmers.map(farmer => (
                  <motion.div 
                    key={farmer.uid}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 bg-white rounded-3xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-center gap-4 text-left">
                      <div className="size-16 bg-brand-bg rounded-2xl flex items-center justify-center text-brand-primary font-bold text-2xl border border-brand-accent/20">
                         {farmer.name?.charAt(0) || "F"}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-brand-primary flex items-center gap-2">
                          {farmer.name}
                          <ExternalLink className="size-3 text-gray-300 hover:text-brand-primary cursor-pointer" />
                        </h4>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium italic">
                          <span className="flex items-center gap-1"><Mail className="size-3" /> {farmer.email}</span>
                          <span className="flex items-center gap-1"><Calendar className="size-3" /> Joined {new Date(farmer.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleVerify(farmer.uid, false)}
                        disabled={!!processing}
                        className="p-3 text-red-500 hover:bg-red-50 rounded-2xl transition-colors disabled:opacity-50 group"
                      >
                        {processing === farmer.uid ? <Loader2 className="size-6 animate-spin text-gray-400" /> : <X className="size-6" />}
                      </button>
                      <button 
                        onClick={() => handleVerify(farmer.uid, true)}
                        disabled={!!processing}
                        className="btn-primary flex items-center gap-3 py-3 px-8 h-auto shadow-lg"
                      >
                        {processing === farmer.uid ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                        <span className="text-[10px] uppercase tracking-widest font-bold">Approve</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Live Delivery Monitor */}
          <div className="editorial-card !p-8 space-y-8 bg-brand-bg/50">
             <div className="flex items-center justify-between">
                <div className="space-y-1">
                   <h2 className="text-3xl font-bold italic text-brand-primary tracking-tighter italic">Delivery Monitor.</h2>
                   <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Real-time GPS Traffic</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-2xl text-[10px] font-bold uppercase tracking-widest">
                   <div className="size-2 bg-green-500 rounded-full animate-ping" />
                   {activeDeliveries.length} Active Transitions
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
                {activeDeliveries.map(order => (
                  <div key={order.id} className="p-6 bg-white rounded-[2rem] border border-brand-primary/5 hover:border-brand-secondary/30 transition-all group shadow-sm hover:shadow-xl">
                    <div className="flex justify-between items-start mb-6">
                       <div className="size-10 bg-brand-bg rounded-xl flex items-center justify-center text-brand-primary">
                          <Truck className="size-5" />
                       </div>
                       <div className="text-right">
                          <p className="text-[10px] font-mono text-gray-400">#...{order.id.slice(-6).toUpperCase()}</p>
                          <p className={cn(
                            "text-[10px] font-bold uppercase tracking-widest",
                            order.deliveryStatus === 'out-for-delivery' ? 'text-brand-secondary' : 'text-orange-500'
                          )}>{order.deliveryStatus}</p>
                       </div>
                    </div>
                    <div className="space-y-4">
                       <div className="flex items-center gap-3">
                          <div className="size-2 bg-brand-secondary rounded-full" />
                          <p className="text-sm font-bold text-gray-800 line-clamp-1 italic">{order.shipping.name}</p>
                       </div>
                       <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                             <Clock className="size-3" /> 14m ETA
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                             <MapPin className="size-3" /> {order.shipping.city}
                          </div>
                       </div>
                       <Link 
                         to={`/order-tracking/${order.id}`}
                         className="w-full btn-secondary py-3 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 group-hover:bg-brand-primary group-hover:text-white transition-all shadow-sm"
                       >
                         <Navigation className="size-3" /> Live GPS View
                       </Link>
                    </div>
                  </div>
                ))}

                {activeDeliveries.length === 0 && (
                   <div className="col-span-full py-16 text-center text-gray-400 italic bg-white/40 rounded-[2.5rem] border-2 border-dashed border-gray-100">
                      Searching for active harvests in transit...
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <div className="bg-brand-primary p-8 rounded-[3.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 size-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform" />
              <ShieldAlert className="size-10 text-brand-accent" />
              <div className="space-y-2">
                <h3 className="text-xl font-bold italic tracking-tight">Safety Protocols</h3>
                <p className="text-xs text-brand-accent/60 leading-relaxed font-medium italic">Ensure you have cross-referenced farm documents before approving high-tier listings.</p>
              </div>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest border border-white/5">
                Review Security Log
              </button>
           </div>

           <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-6">
             <h3 className="font-bold text-brand-primary italic">Platform Pulse</h3>
             <div className="space-y-6">
               {[
                 { label: "Identity Sync", status: "Operational", color: "text-green-500" },
                 { label: "AI Neural Engine", status: "Operational", color: "text-green-500" },
                 { label: "Payment Gateway", status: "Operational", color: "text-green-500" },
                 { label: "GPS Broadcaster", status: "Operational", color: "text-green-500" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</span>
                    <span className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5", item.color)}>
                       <span className="size-1.5 bg-current rounded-full" />
                       {item.status}
                    </span>
                 </div>
               ))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
