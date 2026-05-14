import { useState, useEffect, useRef } from "react";
import { socketService } from "../services/socketService";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "motion/react";
import { 
  Navigation, MapPin, Package, CheckCircle2, 
  Map as MapIcon, Power, AlertTriangle, 
  ChevronRight, Phone, Send
} from "lucide-react";
import { db } from "../lib/firebase";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { cn } from "../lib/utils";

export default function AgentDashboard() {
  const { user, profile } = useAuth();
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [isOnline, setIsOnline] = useState(false);
  const [location, setLocation] = useState<GeolocationPosition | null>(null);

  // 1. Fetch pending deliveries
  useEffect(() => {
    const q = query(collection(db, "orders"), where("deliveryStatus", "in", ["shipped", "out-for-delivery"]));
    const unsub = onSnapshot(q, (snap) => {
      const orders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveOrders(orders);
    }, (err) => {
      console.error("Agent Dashboard Snapshot Error:", err);
      setActiveOrders([]);
    });
    return unsub;
  }, []);

  // 2. Handle GPS updates
  const [isSimulating, setIsSimulating] = useState(false);
  const simulationInterval = useRef<any>(null);

  useEffect(() => {
    if (!isOnline) return;

    socketService.connect();

    if (isSimulating && currentOrder) {
      let lat = 34.0522;
      let lng = -118.2437;
      simulationInterval.current = setInterval(() => {
        lat += 0.0005;
        lng += 0.0005;
        socketService.updateLocation({
          orderId: currentOrder.id,
          lat,
          lng,
          speed: 25,
        });
      }, 2000);
    } else {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setLocation(pos);
          if (currentOrder) {
            socketService.updateLocation({
              orderId: currentOrder.id,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              speed: pos.coords.speed || 0,
              heading: pos.coords.heading || 0
            });
          }
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }

    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
      socketService.disconnect();
    };
  }, [isOnline, currentOrder, isSimulating]);

  const updateStatus = async (orderId: string, status: string) => {
    await updateDoc(doc(db, "orders", orderId), { deliveryStatus: status });
  };

  return (
    <div className="min-h-screen bg-brand-bg pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
           <div className="space-y-1">
              <h1 className="text-3xl font-bold text-brand-primary italic tracking-tight">Delivery Command.</h1>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">Agent: {profile?.name}</p>
           </div>
           
           <button 
             onClick={() => setIsOnline(!isOnline)}
             className={cn(
               "px-8 py-4 rounded-2xl flex items-center gap-3 font-bold text-[10px] uppercase tracking-widest transition-all shadow-xl",
               isOnline ? "bg-red-500 text-white hover:bg-red-600" : "bg-brand-primary text-brand-accent hover:bg-brand-primary/90"
             )}
           >
              <Power className="size-4" />
              {isOnline ? "Go Offline" : "Go Online"}
           </button>
        </div>

        {isOnline && (
           <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="grid grid-cols-2 md:grid-cols-4 gap-4"
           >
              <div className="glass p-4 rounded-2xl text-center space-y-1">
                 <p className="text-[10px] font-bold uppercase text-gray-400">Signal</p>
                 <p className="text-sm font-bold text-green-500">Strong GPS</p>
              </div>
              <div className="glass p-4 rounded-2xl text-center space-y-1">
                 <p className="text-[10px] font-bold uppercase text-gray-400">Shift Time</p>
                 <p className="text-sm font-bold text-brand-primary">2h 45m</p>
              </div>
              <div className="glass p-4 rounded-2xl text-center space-y-1">
                 <p className="text-[10px] font-bold uppercase text-gray-400">Delivered</p>
                 <p className="text-sm font-bold text-brand-primary">12 Orders</p>
              </div>
              <div className="glass p-4 rounded-2xl text-center space-y-1">
                 <p className="text-[10px] font-bold uppercase text-gray-400">Earnings</p>
                 <p className="text-sm font-bold text-green-600">$184.20</p>
              </div>
           </motion.div>
        )}

        <div className="grid md:grid-cols-12 gap-8">
           {/* Left: Active Order Queue */}
           <div className="md:col-span-12 lg:col-span-5 space-y-6">
              <div className="flex items-center justify-between">
                 <h3 className="text-lg font-bold text-brand-primary flex items-center gap-2">
                    <Package className="size-5" /> Deliveries
                 </h3>
                 <span className="bg-brand-secondary text-brand-primary text-[10px] font-bold px-2 py-1 rounded-lg">
                    {activeOrders.length} Pending
                 </span>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                 {activeOrders.map(order => (
                   <button 
                     key={order.id}
                     onClick={() => setCurrentOrder(order)}
                     className={cn(
                       "w-full editorial-card !p-5 text-left border-2 transition-all",
                       currentOrder?.id === order.id ? "border-brand-secondary bg-white shadow-xl scale-[1.02]" : "border-transparent opacity-80"
                     )}
                   >
                      <div className="flex justify-between mb-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded-md">
                           {order.deliveryStatus}
                        </span>
                        <span className="text-[10px] font-mono font-medium text-gray-400">#{order.id.slice(-6)}</span>
                      </div>
                      <div className="space-y-2">
                         <h4 className="font-bold text-brand-primary">{order.shipping.name}</h4>
                         <div className="flex items-center gap-2 text-xs text-gray-500 font-medium italic">
                            <MapPin className="size-3" /> {order.shipping.city}
                         </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                         <p className="text-xs font-bold text-brand-primary italic">2.4 Miles Away</p>
                         <ChevronRight className="size-4 text-brand-primary" />
                      </div>
                   </button>
                 ))}
                 
                 {activeOrders.length === 0 && (
                    <div className="p-12 text-center text-gray-400 opacity-50 border-2 border-dashed border-gray-200 rounded-3xl">
                       <MapIcon className="size-12 mx-auto mb-4" />
                       <p className="text-sm font-medium italic">Searching for local harvests...</p>
                    </div>
                 )}
              </div>
           </div>

           {/* Right: Active Navigation / Status */}
           <div className="md:col-span-12 lg:col-span-7">
              {currentOrder ? (
                <div className="editorial-card !p-8 space-y-8 sticky top-24 shadow-2xl">
                   <div className="flex items-center justify-between border-b border-gray-100 pb-6">
                      <div className="space-y-1">
                         <h3 className="text-2xl font-bold text-brand-primary italic tracking-tight">Active Navigation</h3>
                         <p className="text-xs text-brand-secondary font-bold uppercase tracking-widest">{currentOrder.id.slice(-6)}</p>
                      </div>
                      <button className="p-4 bg-brand-bg rounded-2xl text-brand-primary hover:bg-brand-secondary transition-colors">
                         <Phone className="size-5" />
                      </button>
                   </div>

                   <div className="space-y-6">
                      <div className="p-6 bg-brand-bg rounded-3xl space-y-4">
                         <div className="flex gap-4">
                            <div className="size-10 bg-brand-primary text-brand-accent rounded-xl flex items-center justify-center shrink-0">
                               <MapPin className="size-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Destination</p>
                               <p className="text-sm font-bold text-brand-primary">{currentOrder.shipping.address}</p>
                               <p className="text-xs text-gray-500">{currentOrder.shipping.city}</p>
                            </div>
                         </div>
                         <div className="flex gap-4">
                            <div className="size-10 bg-white text-brand-primary rounded-xl flex items-center justify-center border border-brand-primary/10 shrink-0">
                               <Package className="size-5" />
                            </div>
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Items</p>
                               <p className="text-sm font-bold text-brand-primary">{currentOrder.items.length} Packages</p>
                            </div>
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <button 
                           onClick={() => {
                             updateStatus(currentOrder.id, 'out-for-delivery');
                             setIsSimulating(true);
                           }}
                           disabled={currentOrder.deliveryStatus === 'out-for-delivery'}
                           className="btn-secondary py-5 flex flex-col items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest disabled:opacity-50"
                         >
                            <Navigation className="size-4" /> 
                            <span>{isSimulating ? "Simulating..." : "Start & Simulate"}</span>
                         </button>
                         <button 
                            onClick={() => {
                              updateStatus(currentOrder.id, 'delivered');
                              setIsSimulating(false);
                            }}
                            className="bg-green-600 text-white rounded-2xl py-5 flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-200"
                         >
                            <CheckCircle2 className="size-4" /> Delivered
                         </button>
                      </div>
                      
                      <button className="w-full flex items-center justify-center gap-2 py-4 text-xs font-bold text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                         <AlertTriangle className="size-4" /> Report Delivery Issue
                      </button>
                   </div>
                   
                   <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-200 flex gap-3 text-xs text-yellow-700 italic font-medium">
                      <Send className="size-8 shrink-0" />
                      <p>GPS broadcasting active. The consumer can see your position moving in real-time. Ensure background location is allowed.</p>
                   </div>
                </div>
              ) : (
                <div className="h-full editorial-card !p-12 flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                   <div className="size-24 bg-brand-bg rounded-full flex items-center justify-center text-brand-primary">
                      <Navigation className="size-10 animate-pulse" />
                   </div>
                   <div className="space-y-2">
                     <h3 className="text-xl font-bold text-brand-primary italic">No Active Route</h3>
                     <p className="text-sm text-gray-500 max-w-xs mx-auto">Select a delivery from the left queue to begin GPS tracking and navigation.</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
