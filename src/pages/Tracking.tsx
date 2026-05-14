import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from "@vis.gl/react-google-maps";
import { useAuth } from "../contexts/AuthContext";
import { socketService } from "../services/socketService";
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, MapPin, Navigation, Clock, 
  ChevronLeft, Phone, User, Store, 
  CheckCircle2, Sparkles, ShoppingCart
} from "lucide-react";
import { db } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { cn } from "../lib/utils";

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || "";
const hasValidKey = Boolean(API_KEY);

function RoutePolyline({ origin, destination }: { origin: any; destination: any }) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylineRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clear previous
    polylineRef.current.forEach(p => p.setMap(null));

    routesLib.Route.computeRoutes({
      origin,
      destination,
      travelMode: 'DRIVING',
      fields: ['path', 'viewport'],
    }).then(({ routes }) => {
      if (routes?.[0]) {
        const polylines = routes[0].createPolylines();
        polylines.forEach(p => {
          p.setOptions({
            strokeColor: '#2C4F31',
            strokeWeight: 4,
            strokeOpacity: 0.6
          });
          p.setMap(map);
        });
        polylineRef.current = polylines;
      }
    });

    return () => polylineRef.current.forEach(p => p.setMap(null));
  }, [routesLib, map, origin, destination]);

  return null;
}

export default function Tracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [agentLocation, setAgentLocation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    // 1. Get initial order and listen for status changes
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
      setLoading(false);
    }, (err) => {
      console.error("Tracking error:", err);
      setLoading(false);
    });

    // 2. Connect to real-time GPS
    socketService.connect();
    socketService.joinDelivery(orderId);
    socketService.onLocationUpdate((data) => {
      if (data.orderId === orderId) {
        setAgentLocation({ lat: data.lat, lng: data.lng });
      }
    });

    return () => {
      unsub();
      socketService.disconnect();
    };
  }, [orderId]);

  if (loading) return <div className="h-screen flex items-center justify-center font-serif italic text-brand-primary">Initializing Neural Tracking...</div>;

  const steps = [
    { id: 'preparing', label: 'Preparing', icon: Package },
    { id: 'shipped', label: 'Shipped', icon: Store },
    { id: 'out-for-delivery', label: 'On the Way', icon: Navigation },
    { id: 'delivered', label: 'Delivered', icon: CheckCircle2 },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === order?.deliveryStatus);
  const farmLocation = { lat: 34.0522, lng: -118.2437 }; // Mock farm location
  const deliveryLocation = { lat: 34.0689, lng: -118.4452 }; // Mock delivery location

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col pt-20">
      
      {/* Header Overlay */}
      <div className="absolute top-24 left-4 right-4 z-10 pointer-events-none">
        <div className="max-w-7xl mx-auto flex justify-between">
           <button 
             onClick={() => navigate(-1)}
             className="glass p-3 rounded-full pointer-events-auto hover:bg-white transition-all shadow-xl"
           >
              <ChevronLeft className="size-6 text-brand-primary" />
           </button>
        </div>
      </div>

      <div className="flex-grow relative min-h-[400px] overflow-hidden bg-gray-100 flex items-center justify-center">
        {hasValidKey ? (
          <APIProvider apiKey={API_KEY}>
            <Map
              defaultCenter={agentLocation || farmLocation}
              defaultZoom={13}
              mapId="AGRO_TRACKING_MAP"
              className="w-full h-full"
              gestureHandling="greedy"
              disableDefaultUI
            >
               {/* Map Markers... */}
               <AdvancedMarker position={farmLocation}>
                  <div className="size-10 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-brand-primary">
                     <Store className="size-5 text-brand-primary" />
                  </div>
               </AdvancedMarker>

               <AdvancedMarker position={deliveryLocation}>
                  <div className="size-10 bg-white rounded-2xl flex items-center justify-center shadow-xl border-2 border-brand-secondary">
                     <MapPin className="size-5 text-brand-secondary" />
                  </div>
               </AdvancedMarker>

               {agentLocation && (
                  <AdvancedMarker position={agentLocation}>
                      <div className="relative">
                         <div className="absolute inset-0 bg-brand-secondary/20 rounded-full animate-ping" />
                         <div className="size-12 bg-brand-secondary text-brand-primary rounded-full flex items-center justify-center shadow-xl border-2 border-white relative z-10">
                            <Navigation className="size-6 rotate-45" />
                         </div>
                      </div>
                  </AdvancedMarker>
               )}

               <RoutePolyline origin={agentLocation || farmLocation} destination={deliveryLocation} />
            </Map>
          </APIProvider>
        ) : (
          <div className="absolute inset-0 bg-[#F1F5F1] flex items-center justify-center overflow-hidden">
             {/* Tech Grid Background */}
             <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#2C4F31 0.5px, transparent 0.5px)', backgroundSize: '24px 24px', opacity: 0.1 }} />
             
             <div className="relative z-10 text-center space-y-6 max-w-md px-6">
                <div className="flex justify-center gap-12 relative mb-12">
                   <motion.div 
                    initial={{ x: -50 }}
                    animate={{ x: 0 }}
                    className="size-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-brand-primary/10"
                   >
                      <Store className="text-brand-primary" />
                   </motion.div>
                   
                   <div className="h-px w-24 bg-brand-primary/10 self-center relative">
                      <motion.div 
                        animate={{ left: ["0%", "100%"] }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="absolute -top-1 size-2 bg-brand-secondary rounded-full shadow-[0_0_10px_#4CAF50]" 
                      />
                   </div>

                   <motion.div 
                    initial={{ x: 50 }}
                    animate={{ x: 0 }}
                    className="size-12 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-brand-secondary/20"
                   >
                      <MapPin className="text-brand-secondary" />
                   </motion.div>
                </div>

                <div className="space-y-2">
                   <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-primary/5 rounded-full text-[10px] font-bold uppercase tracking-widest text-brand-primary">
                      <Sparkles className="size-3" /> Simulated View
                   </div>
                   <h3 className="text-2xl font-bold text-brand-primary italic">Live Map Simulation</h3>
                   <p className="text-xs text-gray-500 font-medium italic leading-relaxed">
                     To see the real-time geographic route on Google Maps, please provide your <code>GOOGLE_MAPS_PLATFORM_KEY</code> in the settings.
                   </p>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="glass !bg-white/80 backdrop-blur-2xl rounded-t-[3rem] -mt-12 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.1)]">
         <div className="max-w-4xl mx-auto p-8 space-y-10">
            {/* Delivery Info */}
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-4">
                  <div className="size-16 bg-brand-bg rounded-2xl flex items-center justify-center text-brand-primary shadow-inner">
                     <Clock className="size-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Estimated Arrival</p>
                    <h3 className="text-3xl font-bold text-brand-primary italic">12 - 18 Mins</h3>
                  </div>
               </div>
               <div className="text-right">
                  <div className="flex items-center gap-2 justify-end mb-1">
                     <div className="size-2 bg-green-500 rounded-full animate-pulse" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-green-600">Live GPS Active</p>
                  </div>
                  <p className="text-xs font-mono font-medium text-gray-400 opacity-60">ID: {orderId?.slice(-6).toUpperCase()}</p>
               </div>
            </div>

            {/* Timeline */}
            <div className="flex items-center justify-between relative px-2">
               <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 -translate-y-1/2 z-0" />
               {steps.map((s, i) => {
                 const isActive = i <= currentStepIndex;
                 return (
                   <div key={s.id} className="relative z-10 flex flex-col items-center gap-3">
                      <div className={cn(
                        "size-10 rounded-full flex items-center justify-center transition-all duration-500",
                        isActive ? "bg-brand-primary text-brand-accent shadow-lg" : "bg-white text-gray-300 border border-gray-100"
                      )}>
                        <s.icon className="size-4" />
                      </div>
                      <p className={cn(
                        "text-[9px] font-bold uppercase tracking-tighter",
                        isActive ? "text-brand-primary" : "text-gray-300"
                      )}>{s.label}</p>
                   </div>
                 );
               })}
            </div>

            {/* Agent & Actions */}
            <div className="grid md:grid-cols-2 gap-8 pt-4">
               <div className="flex items-center gap-4 p-4 bg-brand-bg rounded-3xl border border-brand-primary/5">
                  <div className="size-12 bg-brand-secondary rounded-xl flex items-center justify-center text-brand-primary">
                     <User className="size-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-brand-primary">Michael Scott</h4>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Delivery Specialist</p>
                  </div>
                  <button className="ml-auto size-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-brand-secondary hover:text-brand-primary transition-colors">
                     <Phone className="size-5" />
                  </button>
               </div>

               <div className="flex items-center gap-4">
                  <button className="flex-grow btn-secondary py-4 text-[10px] uppercase font-bold tracking-[0.2em]">Contact Help</button>
                  <button className="flex-grow btn-primary py-4 text-[10px] uppercase font-bold tracking-[0.2em] shadow-lg">Order Details</button>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
