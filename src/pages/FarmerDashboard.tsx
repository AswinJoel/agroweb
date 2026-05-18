import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, TrendingUp, Users, AlertTriangle, 
  Plus, LayoutGrid, List, BarChart3, Settings, 
  ShieldCheck, ArrowUpRight, BrainCircuit, Send, Loader2, User, Leaf, Sparkles,
  ShoppingBag
} from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getFarmerAssistantResponse } from "../services/aiService";
import ReactMarkdown from "react-markdown";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";

export default function FarmerDashboard() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || "overview";
  });
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    if (!profile?.uid) return;
    const q = query(collection(db, "products"), where("farmerId", "==", profile.uid));
    const unsub = onSnapshot(q, (snap) => {
      console.log(`Farmer Dashboard: Received ${snap.size} products from Firestore`);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.warn("Farmer Dashboard Firestore Error:", err);
    });
    return unsub;
  }, [profile]);
  const [assistantInput, setAssistantInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: "Hello! I'm your AI Agricultural Assistant. How can I help you manage your farm or inventory today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [assistantMessages]);

  const handleAssistantSend = async () => {
    if (!assistantInput.trim() || isTyping) return;
    const userMsg = assistantInput.trim();
    setAssistantInput("");
    setAssistantMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsTyping(true);

    const context = `Farmer Profile: ${profile?.name || "Verified Farmer"}. Inventory Status: Healthy. Sales Trend: Up.`;
    const response = await getFarmerAssistantResponse(userMsg, context);
    
    setAssistantMessages(prev => [...prev, { role: 'bot', content: response }]);
    setIsTyping(false);
  };

  const [uploading, setUploading] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "Vegetables",
    imageUrl: ""
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !profile?.uid) return;
    
    setUploading(true);
    try {
      await addDoc(collection(db, "products"), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockAmount: newProduct.stock,
        farmerId: profile.uid,
        farmerName: profile.name,
        rating: 5.0,
        reviewsCount: 0,
        createdAt: serverTimestamp(),
        unit: 'kg' // Default unit
      });
      alert("Harvest uploaded successfully!");
      setNewProduct({ name: "", price: "", stock: "", category: "Vegetables", imageUrl: "" });
      setActiveTab('overview');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "products");
    } finally {
      setUploading(false);
    }
  };

  const stats = [
    { label: "Total Sales", value: "₹0", trend: null, icon: TrendingUp },
    { label: "Active Products", value: products.length.toString(), icon: Package },
    { label: "Total Orders", value: "0", icon: List },
    { label: "Rating", value: "5.0", icon: BarChart3 },
  ];

  const data = [
    { name: "Mon", sales: 0 },
    { name: "Tue", sales: 0 },
    { name: "Wed", sales: 0 },
    { name: "Thu", sales: 0 },
    { name: "Fri", sales: 0 },
    { name: "Sat", sales: 0 },
    { name: "Sun", sales: 0 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col p-6 space-y-8">
        <div className="space-y-4">
          <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest pl-4">Management</p>
          <nav className="space-y-1">
            {[
              { id: "overview", icon: LayoutGrid, label: "Overview" },
              { id: "assistant", icon: BrainCircuit, label: "AI Assistant" },
              { id: "inventory", icon: Package, label: "Inventory" },
              { id: "orders", icon: List, label: "Orders" },
              { id: "analytics", icon: BarChart3, label: "Analytics" },
              { id: "settings", icon: Settings, label: "Settings" }
            ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group",
                  activeTab === item.id 
                    ? "bg-brand-primary text-white shadow-lg" 
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("size-4", item.id === 'assistant' && "text-brand-secondary group-hover:animate-pulse")} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-4 bg-brand-bg rounded-2xl border border-brand-accent/30 space-y-3">
          <p className="text-[10px] font-bold text-brand-primary uppercase tracking-widest">Support</p>
          <p className="text-xs text-gray-600 leading-relaxed">Need help with your listings?</p>
          <button className="text-xs font-bold text-brand-primary hover:underline">Contact Expert</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 space-y-8 overflow-y-auto h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-brand-primary tracking-tight">Farmer Dashboard.</h1>
            <p className="text-gray-500 text-sm italic font-medium">Welcome back, {profile?.name || "Farmer"}</p>
          </div>
          <button 
            onClick={() => setActiveTab('inventory')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="size-4" />
            Add New Product
          </button>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Verification Alert */}
              {!profile?.isVerified && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-8 bg-orange-50 border border-orange-200 rounded-[2.5rem] flex items-start gap-6 shadow-sm"
                >
                  <div className="bg-orange-100 p-4 rounded-2xl flex-shrink-0">
                    <AlertTriangle className="text-orange-600 size-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-orange-900 italic">Account Pending Verification</h3>
                    <p className="text-sm text-orange-800/70 leading-relaxed font-medium">
                      Your profile is being reviewed by our agricultural experts. 
                      You can set up your store and list products, but they will be 
                      invisible to customers until you are verified. This usually takes 24-48 hours.
                    </p>
                  </div>
                </motion.div>
              )}

              {profile?.isVerified && (
                 <div className="inline-flex items-center gap-2 px-4 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase rounded-full border border-green-100">
                   <ShieldCheck className="size-3" />
                   Verified Farm Account
                 </div>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -5 }}
                    className="editorial-card space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-3 bg-brand-bg rounded-xl">
                        <stat.icon className="size-5 text-brand-primary" />
                      </div>
                      {stat.trend && (
                        <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ArrowUpRight className="size-2" />
                          {stat.trend}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-brand-primary tracking-tighter">{stat.value}</p>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{stat.label}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts and Tables */}
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 editorial-card space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-brand-primary italic">Revenue Overview</h3>
                    <select className="text-xs font-bold bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 outline-none">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                    </select>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data}>
                        <defs>
                          <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999', fontWeight: 600}} />
                        <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#999', fontWeight: 600}} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                        />
                        <Area type="monotone" dataKey="sales" stroke="#4CAF50" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="editorial-card space-y-8">
                  <h3 className="text-xl font-bold text-brand-primary italic">Top Products</h3>
                  <div className="space-y-8">
                    {[].length > 0 ? (
                      [{ name: "Red Tomatoes", sales: 120, stock: "45kg", price: "₹40" }].map((prod: any, i: number) => (
                        <div key={i} className="flex items-center justify-between group">
                          {/* ... existing item code ... */}
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center space-y-4">
                         <div className="bg-brand-bg size-12 mx-auto rounded-full flex items-center justify-center">
                            <ShoppingBag className="size-5 text-brand-primary/30" />
                         </div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">No Sales recorded yet.</p>
                      </div>
                    )}
                  </div>
                  <button onClick={() => setActiveTab('inventory')} className="w-full btn-secondary text-xs uppercase tracking-widest py-4 bg-brand-bg/50 border-brand-primary/10">View Full Inventory</button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
            <motion.div 
              key="inventory"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Upload Form */}
                <div className="editorial-card space-y-8 !p-10 shadow-xl">
                  <div className="flex items-center gap-4 border-b border-brand-primary/5 pb-6">
                    <div className="size-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center">
                       <Plus className="size-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-brand-primary italic">List Your Yield.</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mt-1">Direct to Customer</p>
                    </div>
                  </div>

                  <form className="space-y-6" onSubmit={handleUpload}>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/60 ml-1">Product Name</label>
                        <input 
                          type="text" 
                          required
                          value={newProduct.name}
                          onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                          placeholder="e.g. Organic Red Tomatoes" 
                          className="w-full px-5 py-4 bg-brand-bg/50 border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/60 ml-1">Price (₹ per unit)</label>
                          <input 
                            type="number" 
                            step="0.01"
                            required
                            value={newProduct.price}
                            onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                            placeholder="40" 
                            className="w-full px-5 py-4 bg-brand-bg/50 border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/60 ml-1">Stock Amount</label>
                          <input 
                            type="text" 
                            required
                            value={newProduct.stock}
                            onChange={e => setNewProduct({...newProduct, stock: e.target.value})}
                            placeholder="100kg" 
                            className="w-full px-5 py-4 bg-brand-bg/50 border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/60 ml-1">Category</label>
                         <select 
                            value={newProduct.category}
                            onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                            className="w-full px-5 py-4 bg-brand-bg/50 border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium outline-none"
                         >
                            <option>Vegetables</option>
                            <option>Fruits</option>
                            <option>Grains</option>
                            <option>Dairy</option>
                         </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-brand-primary/60 ml-1">Product Image URL</label>
                        <input 
                          type="text" 
                          required
                          value={newProduct.imageUrl}
                          onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
                          placeholder="https://images.unsplash.com/photo-..." 
                          className="w-full px-5 py-4 bg-brand-bg/50 border border-brand-primary/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-secondary/30 transition-all font-medium" 
                        />
                      </div>
                    </div>
                    <button 
                      type="submit"
                      disabled={uploading}
                      className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 duration-200 disabled:opacity-50"
                    >
                       {uploading ? <Loader2 className="animate-spin size-4" /> : "Upload Harvest to Market"} <Send className="size-4" />
                    </button>
                  </form>
                </div>

                {/* Live Preview / Empty State */}
                <div className="space-y-8">
                   <div className="editorial-card !p-0 overflow-hidden group border-dashed border-gray-400">
                      <div className="aspect-video bg-gray-100 flex flex-col items-center justify-center text-gray-400 space-y-4">
                         <ShoppingBag className="size-12 opacity-20" />
                         <p className="text-[10px] font-bold uppercase tracking-widest">Live Listing Preview</p>
                      </div>
                      <div className="p-8 space-y-4">
                         <div className="h-6 bg-gray-100 rounded-lg w-2/3 animate-pulse" />
                         <div className="h-4 bg-gray-50 rounded-lg w-1/2 animate-pulse" />
                         <div className="pt-4 flex justify-between items-center">
                            <div className="h-8 bg-gray-100 rounded-full w-20 animate-pulse" />
                            <div className="size-10 bg-gray-100 rounded-full animate-pulse" />
                         </div>
                      </div>
                   </div>
                   
                   <div className="bg-brand-bg p-8 rounded-[2.5rem] border border-brand-primary/5 space-y-4">
                      <h4 className="font-bold text-brand-primary italic">Pro Tip.</h4>
                      <p className="text-sm text-gray-500 leading-relaxed italic">
                        High-quality photos from your actual field increase customer trust by **40%**. Make sure to mention if your crop is organic!
                      </p>
                   </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'assistant' && (
             <motion.div 
               key="assistant"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="h-[calc(100vh-14rem)] flex flex-col gap-6"
             >
                <div className="editorial-card flex-grow flex flex-col !p-0 overflow-hidden bg-white/40">
                   <div className="p-8 border-b border-brand-primary/5 bg-brand-primary/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                         <div className="size-12 bg-brand-primary text-brand-bg rounded-2xl flex items-center justify-center shadow-lg">
                            <BrainCircuit className="size-6" />
                         </div>
                         <div>
                            <h2 className="text-2xl font-bold text-brand-primary italic">Neural Farm Assistant.</h2>
                            <p className="text-[10px] text-brand-secondary font-bold uppercase tracking-widest">Always Connected</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         <span className="p-2 bg-white rounded-lg border border-brand-primary/5 text-xs font-bold text-gray-400 uppercase tracking-widest">Diagnostic v2.4</span>
                      </div>
                   </div>

                   <div 
                    ref={scrollRef}
                    className="flex-grow overflow-y-auto p-12 space-y-8"
                   >
                     {assistantMessages.map((m, i) => (
                       <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "flex gap-6 max-w-[80%]",
                          m.role === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                       >
                          <div className={cn(
                            "size-10 rounded-xl flex items-center justify-center shrink-0 shadow-md",
                            m.role === 'user' ? "bg-brand-secondary text-white" : "bg-white text-brand-primary border border-brand-primary/10"
                          )}>
                            {m.role === 'user' ? <User className="size-5" /> : <BrainCircuit className="size-5" />}
                          </div>
                          <div className={cn(
                            "p-6 rounded-[2rem] text-sm leading-relaxed shadow-sm",
                            m.role === 'user' ? "bg-brand-primary text-white rounded-tr-none" : "bg-white text-gray-800 rounded-tl-none border border-brand-primary/5"
                          )}>
                             <div className="prose prose-sm prose-green max-w-none">
                                <ReactMarkdown>{m.content}</ReactMarkdown>
                             </div>
                          </div>
                       </motion.div>
                     ))}
                     {isTyping && (
                       <div className="flex gap-4 items-center animate-pulse text-xs font-bold text-brand-secondary uppercase tracking-[0.2em] ml-16">
                          <Loader2 className="animate-spin size-4" />
                          Processing Neural Response...
                       </div>
                     )}
                   </div>

                   <div className="p-8 bg-white border-t border-brand-primary/5">
                      <div className="flex gap-4 p-2 bg-brand-bg/50 rounded-3xl border border-brand-primary/5">
                         <input 
                            type="text"
                            value={assistantInput}
                            onChange={(e) => setAssistantInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAssistantSend()}
                            placeholder="Ask about crop health, market price predictions, or platform logistics..."
                            className="flex-grow p-4 bg-transparent outline-none text-sm font-medium"
                         />
                         <button 
                            onClick={handleAssistantSend}
                            disabled={!assistantInput.trim() || isTyping}
                            className="size-14 bg-brand-primary text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-50"
                         >
                            <Send className="size-6" />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                   {[
                     { label: "Blight Diagnosis", icon: Leaf },
                     { label: "Price Prediction", icon: Sparkles },
                     { label: "Order Logistics", icon: List }
                   ].map((suggestion, i) => (
                     <button 
                      key={i}
                      onClick={() => setAssistantInput(suggestion.label)}
                      className="p-4 bg-white/50 border border-brand-primary/5 rounded-2xl text-[10px] uppercase font-bold text-gray-400 tracking-widest hover:border-brand-secondary hover:text-brand-primary transition-all flex items-center justify-center gap-3"
                     >
                        <suggestion.icon className="size-3" />
                        {suggestion.label}
                     </button>
                   ))}
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

