import { motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, Package, Smile, Calendar, Clock, ShoppingCart, Star, MapPin, Sparkles, Loader2, Navigation } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { formatCurrency, cn } from "../lib/utils";
import { useState, useEffect } from "react";
import { getProductRecommendations, Recommendation } from "../services/aiService";
import { collection, query, where, onSnapshot, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function ConsumerDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingAI, setLoadingAI] = useState(true);
  const [realOrders, setRealOrders] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setRealOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [user]);

  useEffect(() => {
    async function loadAI() {
      try {
        const recs = await getProductRecommendations("consumer", ["Honey", "Bread"], ["Tomatoes", "Milk"]);
        setRecommendations(recs);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingAI(false);
      }
    }
    loadAI();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 lg:p-12 space-y-12">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold italic text-brand-primary tracking-tighter">My Pantry</h1>
          <p className="text-gray-500 text-sm italic">Freshness on its way to {profile?.name || "Customer"}.</p>
        </div>
        <Link to="/marketplace" className="btn-primary py-3 px-8 text-sm h-auto">Shop New Harvests</Link>
      </header>

      <div className="grid lg:grid-cols-3 gap-8 px-4">
        {/* Orders */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-[3rem] shadow-xl border-white/50 space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-brand-primary flex items-center gap-3 italic">
                Recent Orders
                <span className="text-xs px-2 py-0.5 bg-brand-bg text-brand-primary rounded-full not-italic tracking-normal">{realOrders.length}</span>
              </h2>
              <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-brand-primary transition-colors">View All History</button>
            </div>

            <div className="space-y-4">
              {realOrders.length > 0 ? (
                realOrders.map(order => (
                  <div key={order.id} className="p-6 bg-white rounded-3xl border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-lg transition-all group">
                    <div className="flex items-center gap-5">
                      <div className="size-14 bg-brand-bg rounded-2xl flex items-center justify-center text-brand-primary">
                        <Package className="size-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">#...{order.id.slice(-6).toUpperCase()}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-400 uppercase font-bold tracking-widest">
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" /> 
                            {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Just now'}
                          </span>
                          <span className="flex items-center gap-1"><Smile className="size-3" /> {order.items?.length || 0} Items</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-12">
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Status</p>
                        <span className={cn(
                          "text-xs font-bold px-3 py-1 rounded-full",
                          order.deliveryStatus === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                        )}>
                          {order.deliveryStatus}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Total</p>
                        <span className="text-lg font-bold text-brand-primary italic tracking-tight">{formatCurrency(order.total)}</span>
                      </div>
                      {(order.deliveryStatus === 'shipped' || order.deliveryStatus === 'out-for-delivery') && (
                        <button 
                          onClick={() => navigate(`/order-tracking/${order.id}`)}
                          className="btn-primary py-3 px-5 text-[10px] uppercase font-bold tracking-widest flex items-center gap-2"
                        >
                          <Navigation className="size-3" /> Track Harvest
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-gray-400 italic">No active orders yet. Find some fresh harvests in the market!</div>
              )}
            </div>
          </div>

          {/* AI Recommendations Section */}
          <div className="editorial-card space-y-8 mt-12 bg-white/50">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-brand-secondary">
                  <Sparkles className="size-5 animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Neural Marketplace Link</span>
                </div>
                <h3 className="text-3xl font-bold italic text-brand-primary tracking-tight">Curated for You.</h3>
              </div>
              <Link to="/marketplace" className="text-xs font-bold text-gray-400 hover:text-brand-primary transition-colors flex items-center gap-2">
                Browse More <ShoppingCart className="size-3" />
              </Link>
            </div>

            {loadingAI ? (
               <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-brand-secondary size-10" />
                  <p className="text-sm italic text-gray-400">Our neural engine is analyzing market trends...</p>
               </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-8">
                {recommendations.map((rec, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="p-8 bg-brand-bg/20 rounded-[2.5rem] border border-brand-primary/5 hover:border-brand-secondary/30 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                       <ShoppingCart className="size-16 -rotate-12" />
                    </div>
                    <div className="relative z-10 space-y-4">
                      <span className="px-3 py-1 bg-white border border-brand-primary/5 text-brand-primary text-[10px] font-bold uppercase rounded-full tracking-widest shadow-sm">
                        {rec.category}
                      </span>
                      <h4 className="text-2xl font-bold text-brand-primary italic tracking-tight">{rec.name}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed font-medium italic">
                        "{rec.reason}"
                      </p>
                      <button className="text-xs font-bold text-brand-secondary flex items-center gap-2 group-hover:gap-3 transition-all">
                        Reserve Now &rarr;
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Ops */}
        <div className="space-y-8">
           <div className="bg-brand-primary p-8 rounded-[3.5rem] text-white space-y-6 shadow-2xl relative overflow-hidden group">
             <div className="absolute top-0 right-0 size-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 transition-transform group-hover:scale-110" />
             <div className="flex items-center justify-between">
                <Heart className="size-10 text-brand-accent fill-brand-accent/20" />
                <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-bold uppercase tracking-widest">8 Items</span>
             </div>
             <div className="space-y-2">
               <h3 className="text-xl font-bold tracking-tight">Favorite Harvests</h3>
               <p className="text-xs text-brand-accent/60 leading-relaxed italic">Quick access to your most-loved products and farms.</p>
             </div>
             <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-bold transition-all uppercase tracking-widest border border-white/5">
                Go to Wishlist
             </button>
           </div>

           <div className="bg-white p-8 rounded-[3.5rem] border border-gray-100 shadow-xl space-y-6">
             <div className="flex items-center justify-between italic">
               <h3 className="font-bold text-gray-900">Recommended for You</h3>
               <Star className="size-4 text-yellow-400 fill-yellow-400" />
             </div>
             <div className="space-y-6">
               {[
                 { name: "Organic Honey", price: "$12.00", farm: "Wild Bee Estates" },
                 { name: "Sourdough Bread", price: "$5.50", farm: "Heritage Bakes" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-10 bg-gray-50 rounded-xl flex items-center justify-center grayscale group-hover:grayscale-0 transition-all overflow-hidden border border-gray-100">
                        <img src={`https://picsum.photos/seed/${item.name}/100/100`} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{item.name}</p>
                        <p className="text-[10px] text-gray-400 italic flex items-center gap-1"><MapPin className="size-2" /> {item.farm}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-primary">{item.price}</span>
                 </div>
               ))}
               <button className="w-full btn-secondary text-xs py-3 border-dashed border-gray-300">Browse Suggestions</button>
             </div>
           </div>

           <div className="editorial-card !p-8 bg-brand-primary text-white space-y-6">
              <div className="flex items-center gap-3">
                 <Package className="size-6 text-brand-accent scale-x-[-1]" />
                 <h3 className="text-xl font-bold tracking-tight italic">Are you a Farmer?</h3>
              </div>
              <p className="text-xs text-brand-accent/60 leading-relaxed font-medium">
                List your harvests directly to thousands of consumers and use our neural engines to grow your business.
              </p>
              <button 
                onClick={async () => {
                   if (profile) {
                     await updateDoc(doc(db, 'users', profile.uid), {
                       role: 'farmer',
                       isVerified: false
                     });
                     window.location.reload();
                   }
                }}
                className="w-full py-4 bg-brand-secondary text-brand-primary font-bold rounded-2xl hover:bg-brand-accent transition-all text-[10px] uppercase tracking-[0.2em]"
              >
                Launch Farmer Application
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

