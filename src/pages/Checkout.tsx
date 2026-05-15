import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { ShoppingBag, ChevronRight, MapPin, CreditCard, CheckCircle2, ShieldCheck, Loader2, Sparkles, Truck, Phone, Mail, User, Globe, Home, Briefcase, Landmark } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { useNavigate } from "react-router-dom";
import { db } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { syncToSheets } from "../services/sheetsService";

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "sb"; 

export default function Checkout() {
  const { user, profile } = useAuth();
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'paypal' | 'cod'>('paypal');
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    area: "",
    city: "",
    state: "",
    zipCode: "",
  });

  useEffect(() => {
    console.log("Checkout: Profile loaded/changed", profile);
    if (profile) {
      setShippingInfo(prev => ({
        ...prev,
        firstName: prev.firstName || profile.name?.split(' ')[0] || "",
        lastName: prev.lastName || profile.name?.split(' ').slice(1).join(' ') || "",
        email: prev.email || profile.email || user?.email || "",
      }));
    }
  }, [profile, user]);

  useEffect(() => {
    console.log("Checkout: Rendered, step:", step);
  }, [step]);

  const deliveryFee = total > 50 ? 0 : 5.00;
  const finalTotal = total + deliveryFee;

  const [gpsDetected, setGpsDetected] = useState(false);

  const handleOrderSubmission = async (paymentDetails?: any) => {
    setIsProcessing(true);
    const orderId = `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    try {
      const orderData = {
        orderId,
        userId: user?.uid, // Keep both for backward compatibility
        consumerId: user?.uid,
        userName: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
        items,
        subtotal: total,
        deliveryFee,
        total: finalTotal,
        paymentMethod,
        status: 'confirmed',
        deliveryStatus: 'preparing',
        shipping: shippingInfo,
        paymentId: paymentDetails?.id || 'COD',
        gpsLocation: gpsDetected ? 'Detected' : 'Not provided',
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      
      // Sync to External Apps Script URL
      const scriptUrl = "https://script.google.com/macros/s/AKfycbyd_PT3RnIZBBTHY_BK6bYB59i-iQEWf4NOMb4X0GLa5yRLckZHJ0EnnDcpAcB9_1JVzA/exec";
      
      const payload = {
        firstName: shippingInfo.firstName,
        lastName: shippingInfo.lastName,
        mobileNumber: shippingInfo.phone,
        emailAddress: shippingInfo.email,
        fullAddress: shippingInfo.address,
        areaStreet: shippingInfo.area,
        city: shippingInfo.city,
        state: shippingInfo.state,
        pincode: shippingInfo.zipCode,
        productName: items.map(i => `${i.name} (x${i.qty})`).join(', '),
        productQuantity: items.reduce((acc, i) => acc + i.qty, 0),
        totalPrice: finalTotal,
        paymentMethod: paymentMethod === 'paypal' ? 'Online Payment' : 'Cash on Delivery',
        orderDateTime: new Date().toLocaleString(),
        orderId: orderId,
        gpsDetected: gpsDetected ? "Yes" : "No"
      };

      try {
        // Non-blocking background sync
        fetch(scriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(err => console.warn("Background sync failed:", err));
      } catch (sheetsErr) {
        console.warn("External sync preparation failed:", sheetsErr);
      }

      clearCart();
      navigate(`/order-confirmation/${orderId}`);
    } catch (err) {
      console.error(err);
      alert("Order placement failed. Please verify your details or try a different payment method.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-brand-bg space-y-6">
         <div className="size-24 bg-white rounded-full flex items-center justify-center shadow-xl">
            <ShoppingBag className="size-10 text-brand-primary" />
         </div>
         <h2 className="text-2xl font-bold italic text-brand-primary">Your basket is empty.</h2>
         <button onClick={() => navigate('/marketplace')} className="btn-primary px-8 py-4 text-[10px] uppercase font-bold tracking-widest">Back to Market</button>
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ "clientId": PAYPAL_CLIENT_ID, components: "buttons", currency: "USD" }}>
      <div className="min-h-screen pt-32 pb-24 bg-brand-bg">
      <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-12 gap-12">
        
        {/* Left: Checkout Flow */}
        <div className="md:col-span-7 space-y-8">
           <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-brand-primary italic">Checkout.</h1>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
                <span className={cn(step === 1 ? "text-brand-secondary" : "")}>Address & Location</span>
                <ChevronRight className="size-3" />
                <span className={cn(step === 2 ? "text-brand-secondary" : "")}>Payment Method</span>
              </div>
           </div>

           <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div 
                 key="details"
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 20 }}
                 className="editorial-card space-y-8"
               >
                 <div className="flex items-center gap-3 text-brand-primary">
                    <User className="size-5" />
                    <h3 className="text-lg font-bold italic">Contact & Delivery Information</h3>
                 </div>

                 <div className="grid gap-6">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">First Name</label>
                          <input 
                            value={shippingInfo.firstName}
                            onChange={e => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                            placeholder="John"
                            className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Last Name</label>
                          <input 
                            value={shippingInfo.lastName}
                            onChange={e => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                            placeholder="Doe"
                            className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Mobile Number</label>
                          <input 
                            value={shippingInfo.phone}
                            onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})}
                            placeholder="+1 (555) 000-0000"
                            className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Email Address</label>
                          <input 
                            type="email"
                            value={shippingInfo.email}
                            onChange={e => setShippingInfo({...shippingInfo, email: e.target.value})}
                            placeholder="john@example.com"
                            className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                       </div>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Full Address</label>
                       <textarea 
                         value={shippingInfo.address}
                         onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})}
                         placeholder="House No, Building Name, Street"
                         className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium h-24" 
                       />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Area / Street</label>
                          <input 
                            value={shippingInfo.area}
                            onChange={e => setShippingInfo({...shippingInfo, area: e.target.value})}
                            placeholder="Green Valley Estate"
                            className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">City</label>
                          <input 
                            value={shippingInfo.city}
                            onChange={e => setShippingInfo({...shippingInfo, city: e.target.value})}
                            placeholder="Los Angeles"
                            className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">State</label>
                          <input 
                            value={shippingInfo.state}
                            onChange={e => setShippingInfo({...shippingInfo, state: e.target.value})}
                            placeholder="California"
                            className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Pincode / Zip</label>
                          <div className="relative group">
                            <input 
                              value={shippingInfo.zipCode}
                              onChange={e => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                              placeholder="90001"
                              className="w-full px-5 py-4 bg-brand-bg border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium pr-12" 
                            />
                            <button 
                              onClick={() => {
                                if (navigator.geolocation) {
                                  navigator.geolocation.getCurrentPosition((pos) => {
                                    console.log("GPS Detected:", pos.coords.latitude, pos.coords.longitude);
                                    setGpsDetected(true);
                                    // Normally we'd reverse geocode here, but for now we note detection
                                    setShippingInfo(prev => ({...prev, area: `${prev.area} (GPS Verified)`.trim() }));
                                  }, (err) => {
                                    console.warn("GPS Access Denied");
                                    alert("Location access denied. Please enter your address manually.");
                                  });
                                }
                              }}
                              className={cn(
                                "absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all",
                                gpsDetected ? "text-green-500 bg-green-50" : "text-brand-secondary hover:bg-brand-secondary/10"
                              )}
                              title={gpsDetected ? "Location Verified" : "Detect Location"}
                            >
                              {gpsDetected ? <CheckCircle2 className="size-4" /> : <MapPin className="size-4" />}
                            </button>
                          </div>
                       </div>
                    </div>
                 </div>

                 <button 
                   onClick={() => setStep(2)}
                   disabled={!shippingInfo.address || !shippingInfo.phone || !shippingInfo.city}
                   className="w-full btn-primary py-5 font-bold tracking-widest text-[10px] uppercase disabled:opacity-50 shadow-xl"
                 >
                   Continue to Payment
                 </button>
               </motion.div>
             )}

             {step === 2 && (
                <motion.div 
                  key="payment"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="editorial-card space-y-10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-brand-primary">
                       <CreditCard className="size-5" />
                       <h3 className="text-lg font-bold italic">Secure Checkout</h3>
                    </div>
                    <button onClick={() => setStep(1)} className="text-[10px] font-bold uppercase text-gray-400 hover:text-brand-primary tracking-widest">Back to Details</button>
                  </div>

                  <div className="space-y-6">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 ml-1">Choose Payment Method</p>
                     
                     <div className="grid grid-cols-2 gap-4">
                        <button 
                          onClick={() => setPaymentMethod('paypal')}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                            paymentMethod === 'paypal' ? "border-brand-secondary bg-brand-secondary/5" : "border-gray-100 bg-white opacity-60"
                          )}
                        >
                           <Globe className="size-8 text-brand-primary" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">PayPal / Cards</span>
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('cod')}
                          className={cn(
                            "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                            paymentMethod === 'cod' ? "border-brand-secondary bg-brand-secondary/5" : "border-gray-100 bg-white opacity-60"
                          )}
                        >
                           <Truck className="size-8 text-brand-primary" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Cash on Delivery</span>
                        </button>
                     </div>

                     <div className="p-8 bg-brand-bg rounded-3xl border border-brand-primary/5">
                        {isProcessing ? (
                           <div className="flex flex-col items-center justify-center py-12 space-y-4">
                              <Loader2 className="animate-spin size-8 text-brand-secondary" />
                              <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Securing Harvest Transaction...</p>
                           </div>
                        ) : paymentMethod === 'paypal' ? (
                          <div className="space-y-6">
                             <div className="min-h-[150px]">
                               <PayPalButtons 
                                 style={{ layout: "vertical", shape: "rect", color: "gold", label: "pay" }}
                                 createOrder={(data, actions) => {
                                   console.log("PayPal: Creating order for amount:", finalTotal);
                                   return actions.order.create({
                                     intent: "CAPTURE",
                                     purchase_units: [{
                                       amount: { 
                                         currency_code: "USD", 
                                         value: finalTotal.toFixed(2) 
                                       }
                                     }]
                                   });
                                 }}
                                 onApprove={async (data, actions) => {
                                   console.log("PayPal: Order approved");
                                   if (actions.order) {
                                     const details = await actions.order.capture();
                                     console.log("PayPal: Capture successful");
                                     handleOrderSubmission(details);
                                   }
                                 }}
                                 onError={(err) => {
                                   console.error("PayPal Error:", err);
                                   alert("PayPal failed to load or process. Please try again or use COD.");
                                 }}
                               />
                             </div>
                             <div className="relative">
                               <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                               <div className="relative flex justify-center text-[8px]"><span className="bg-brand-bg px-4 text-gray-400 font-bold uppercase">Simulator Mode</span></div>
                             </div>
                             <button 
                               onClick={() => handleOrderSubmission({ id: 'SIM-' + Date.now() })}
                               className="w-full py-4 bg-white border-2 border-brand-primary/5 hover:border-brand-secondary text-brand-primary font-bold rounded-2xl transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 group"
                             >
                                <Sparkles className="size-4 group-hover:rotate-12 transition-transform" />
                                Instant Secure Checkout (Demo)
                             </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                             <div className="p-6 bg-white rounded-2xl border border-brand-primary/5 space-y-4">
                                <div className="size-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                   <Landmark className="size-6" />
                                </div>
                                <div className="space-y-1">
                                   <p className="text-sm font-bold text-brand-primary italic">Pay upon successful delivery.</p>
                                   <p className="text-[10px] text-gray-400 font-medium leading-relaxed uppercase tracking-widest">A neural specialist will verify your address before transit.</p>
                                </div>
                             </div>
                             <button 
                               onClick={() => handleOrderSubmission()}
                               className="w-full btn-primary py-5 font-bold tracking-widest text-[10px] uppercase shadow-xl"
                             >
                               Confirm Order (COD)
                             </button>
                          </div>
                        )}
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-gray-400 justify-center">
                     <div className="flex items-center gap-1"><ShieldCheck className="size-4" /> SSL Encrypted</div>
                     <div className="size-1 bg-gray-300 rounded-full" />
                     <div className="flex items-center gap-1">Verified Node</div>
                  </div>
                </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* Right: Summary */}
        <div className="md:col-span-5">
           <div className="editorial-card !p-8 sticky top-32 space-y-8 shadow-2xl">
              <div className="flex items-center gap-3 pb-6 border-b border-gray-100">
                 <ShoppingBag className="size-6 text-brand-primary" />
                 <h3 className="text-xl font-bold tracking-tight italic text-brand-primary">Order Summary</h3>
              </div>
              
              <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2">
                 {items.map(item => (
                   <div key={item.id} className="flex gap-4 group">
                      <div className="size-16 bg-brand-bg rounded-xl overflow-hidden shrink-0 border border-brand-primary/5">
                         <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-grow">
                        <p className="font-bold text-brand-primary text-sm line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Qty: {item.qty} &middot; {formatCurrency(item.price)}</p>
                      </div>
                      <p className="font-bold text-sm text-brand-primary">{formatCurrency(item.price * item.qty)}</p>
                   </div>
                 ))}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                 <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(total)}</span>
                 </div>
                 <div className="flex justify-between text-xs text-gray-500 font-medium">
                    <span>Neural Delivery</span>
                    {deliveryFee === 0 ? (
                      <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                    ) : (
                      <span className="font-mono">{formatCurrency(deliveryFee)}</span>
                    )}
                 </div>
                 <div className="flex justify-between text-2xl font-bold text-brand-primary italic pt-4 border-t border-brand-primary/5">
                    <span>Total</span>
                    <span className="font-mono non-italic">{formatCurrency(finalTotal)}</span>
                 </div>
              </div>

              <div className="p-5 bg-brand-bg rounded-3xl border border-brand-secondary/20 space-y-2">
                 <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-brand-secondary" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary">Platform Guarantee</p>
                 </div>
                 <p className="text-[10px] text-brand-primary/70 font-medium leading-relaxed italic">
                   Direct from farm. Real-time GPS tracking enabled instantly after harvest preparation.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
    </PayPalScriptProvider>
  );
}

