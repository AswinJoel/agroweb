import { useState, useRef, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Package, TrendingUp, Users, AlertTriangle, 
  Plus, LayoutGrid, List, BarChart3, Settings, 
  ShieldCheck, ArrowUpRight, BrainCircuit, Send, Loader2, User, Leaf, Sparkles,
  ShoppingBag, Camera, Microscope, FileCheck, MapPin, Trash2, Edit3, 
  MoreVertical, CheckCircle2, XCircle, Map, Search, ChevronRight, Globe, 
  Navigation, Eye, EyeOff, ChevronLeft
} from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { getFarmerAssistantResponse } from "../services/aiService";
import ReactMarkdown from "react-markdown";
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, updateDoc, deleteDoc, orderBy } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { useNavigate } from "react-router-dom";

const categories = ["Vegetables", "Fruits", "Grains", "Dairy", "Spices", "Flowers", "Other"];
const units = ["kg", "quintal", "ton", "litre", "dozen", "packet", "box", "crate"];

interface FarmerDashboardProps {
  initialTab?: 'overview' | 'inventory' | 'add' | 'assistant';
}

export default function FarmerDashboard({ initialTab }: FarmerDashboardProps) {
  const { profile, user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'add' | 'assistant'>(initialTab || 'overview');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time synchronization
  useEffect(() => {
    if (!profile?.uid) return;
    setLoading(true);
    const q = query(
      collection(db, "products"), 
      where("farmerId", "==", profile.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, "products");
      setLoading(false);
    });
    return unsub;
  }, [profile]);

  // AI Assistant Integration
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
    const context = `Farmer: ${profile?.name}. Yields: ${products.length} listed.`;
    const response = await getFarmerAssistantResponse(userMsg, context);
    setAssistantMessages(prev => [...prev, { role: 'bot', content: response }]);
    setIsTyping(false);
  };

  // Form & CRUD Logic
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiReport, setAiReport] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    category: "Vegetables",
    unit: "kg",
    imageUrl: "",
    location: { village: "", district: "", state: "" },
    description: "",
    status: "active" as "active" | "inactive" | "sold"
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const detectLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setNewProduct(prev => ({
          ...prev,
          location: {
            village: prev.location.village,
            district: "Detected",
            state: `Coord: ${pos.coords.latitude.toFixed(2)}`
          }
        }));
      });
    }
  };

  const handleAnalyzeHarvest = async () => {
    if (!newProduct.imageUrl) return alert("Select photo first.");
    setAnalyzing(true);
    try {
      const base64 = newProduct.imageUrl.split(',')[1];
      const response = await fetch("/api/ai/analyze-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 })
      });
      const result = await response.json();
      if (response.ok) {
        setAiReport(result);
        setNewProduct(prev => ({ ...prev, description: prev.description + `\n\n[Neural Scan: ${result.disease}]` }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    setUploading(true);
    try {
      const locStr = `${newProduct.location.village}, ${newProduct.location.district}, ${newProduct.location.state}`;
      const payload = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stockAmount: newProduct.stock,
        location: locStr,
        farmerId: profile.uid,
        farmerName: profile.name,
        isAiVerified: !!aiReport,
        aiGrade: aiReport?.severity || "Standard",
        createdAt: editingId ? undefined : serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (editingId) {
        await updateDoc(doc(db, "products", editingId), payload);
        setToast("Listing updated successfully!");
      } else {
        await addDoc(collection(db, "products"), payload);
        setToast("Harvest listed to marketplace!");
      }
      resetForm();
      setActiveTab('inventory');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, "products");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      name: "", price: "", stock: "", category: "Vegetables", unit: "kg",
      imageUrl: "", location: { village: "", district: "", state: "" },
      description: "", status: "active"
    });
    setAiReport(null);
    setEditingId(null);
  };

  const startEdit = (p: any) => {
    const lp = (p.location || "").split(', ');
    setNewProduct({
      name: p.name, price: (p.price || 0).toString(), stock: p.stockAmount || "",
      category: p.category || "Vegetables", unit: p.unit || "kg", imageUrl: p.imageUrl || "",
      location: { village: lp[0] || "", district: lp[1] || "", state: lp[2] || "" },
      description: p.description || "", status: p.status || "active"
    });
    setEditingId(p.id);
    setActiveTab('add');
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm("Remove this listing?")) {
      await deleteDoc(doc(db, "products", id));
    }
  };

  if (loading && products.length === 0) {
    return <div className="min-h-screen bg-brand-bg flex items-center justify-center"><Loader2 className="animate-spin text-brand-primary" /></div>;
  }

  const revenueData = [
    { name: 'Jan', revenue: 4200 },
    { name: 'Feb', revenue: 3800 },
    { name: 'Mar', revenue: 5600 },
    { name: 'Apr', revenue: 4780 },
    { name: 'May', revenue: 6890 },
  ];

  return (
    <div className="min-h-screen bg-brand-bg flex font-sans">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-brand-primary/5 p-8 flex flex-col h-screen sticky top-0 shadow-sm">
        <div className="flex items-center gap-4 mb-20">
          <div className="size-12 bg-brand-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brand-primary/20"><Leaf className="size-7" /></div>
          <div><h1 className="text-2xl font-bold font-playfair italic text-brand-primary">AgroConnect.</h1><p className="text-[10px] font-bold uppercase tracking-widest text-brand-secondary/60">Farmer Suite</p></div>
        </div>
        <nav className="flex-grow space-y-3">
          {[
            { id: 'overview', icon: LayoutGrid, label: 'Dashboard' },
            { id: 'add', icon: Plus, label: editingId ? 'Edit Listing' : 'List Harvest' },
            { id: 'inventory', icon: Package, label: 'My Yields' },
            { id: 'assistant', icon: BrainCircuit, label: 'AI Advisor' },
            { id: 'market', icon: Globe, label: 'Portal', action: () => navigate('/marketplace') }
          ].map(it => (
            <button key={it.id} onClick={() => it.action ? it.action() : setActiveTab(it.id as any)} className={cn("w-full flex items-center gap-4 px-6 py-5 rounded-2xl font-bold text-sm transition-all", activeTab === it.id ? "bg-brand-primary text-white shadow-xl" : "text-gray-400 hover:text-brand-primary")}>
              <it.icon className="size-5" /> {it.label}
            </button>
          ))}
        </nav>
        <div className="mt-auto border-t pt-8 space-y-4">
          <div className="flex items-center gap-4 p-3 bg-brand-bg/50 rounded-2xl">
             <div className="size-10 rounded-xl bg-brand-primary/10 flex items-center justify-center"><User className="text-brand-primary" /></div>
             <p className="font-bold text-xs truncate text-brand-primary">{profile?.name || user?.email}</p>
          </div>
          <button onClick={logout} className="w-full text-red-500 font-bold text-xs uppercase p-4 hover:bg-red-50 rounded-2xl">Sign Out</button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-grow p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{opacity:0, y:20}} animate={{opacity:1, y:0}} className="space-y-16">
              <header><h2 className="text-5xl font-playfair italic text-brand-primary mb-2">Farmer Overview.</h2><p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Live metrics from your farm</p></header>
              <div className="grid grid-cols-4 gap-8">
                {[
                  { l: "Stock Count", v: products.length, i: Package, c: "text-emerald-600", b: "bg-emerald-50" },
                  { l: "Inquiries", v: "24", i: Users, c: "text-blue-600", b: "bg-blue-50" },
                  { l: "Revenue Est.", v: "₹45k", i: TrendingUp, c: "text-amber-600", b: "bg-amber-50" },
                  { l: "Quality Index", v: "4.9", i: ShieldCheck, c: "text-purple-600", b: "bg-purple-50" }
                ].map((s, i) => (
                  <div key={i} className={cn("p-10 rounded-[2.5rem] border shadow-sm", s.b)}>
                    <div className="flex justify-between mb-8"><s.i className={cn("size-8", s.c)} /><span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.l}</span></div>
                    <p className={cn("text-4xl font-playfair font-bold italic", s.c)}>{s.v}</p>
                  </div>
                ))}
              </div>
              <div className="grid lg:grid-cols-3 gap-12">
                 <div className="lg:col-span-2 editorial-card h-[500px]">
                    <h3 className="text-2xl font-playfair italic text-brand-primary mb-10">Revenue Analytics</h3>
                    <ResponsiveContainer width="100%" height="80%"><AreaChart data={revenueData}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" /><YAxis /><Tooltip /><Area type="monotone" dataKey="revenue" stroke="#2D6A4F" fill="#2D6A4F22" strokeWidth={3} /></AreaChart></ResponsiveContainer>
                 </div>
                 <div className="editorial-card h-[500px] flex flex-col">
                    <h3 className="text-2xl font-playfair italic text-brand-primary mb-8">Recent Activity</h3>
                    <div className="flex-grow overflow-y-auto space-y-6">
                       {products.slice(0, 5).map(p => (
                         <div key={p.id} className="flex gap-4 items-center bg-brand-bg/30 p-3 rounded-2xl">
                           <img src={p.imageUrl} className="size-12 rounded-xl object-cover" />
                           <div className="min-w-0"><p className="text-sm font-bold truncate text-brand-primary">{p.name}</p><p className="text-[10px] text-gray-400">{p.stockAmount}</p></div>
                           <p className="ml-auto font-bold text-xs">{formatCurrency(p.price)}</p>
                         </div>
                       ))}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'inventory' && (
             <motion.div key="inv" initial={{opacity:0}} animate={{opacity:1}} className="space-y-12">
                <header className="flex justify-between"><h2 className="text-4xl font-playfair italic text-brand-primary">Inventory Vault.</h2><button onClick={() => {resetForm(); setActiveTab('add');}} className="btn-primary px-8">List New Harvest</button></header>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                   {products.map(p => (
                     <div key={p.id} className="editorial-card !p-0 overflow-hidden group">
                        <div className="aspect-square relative overflow-hidden">
                           <img src={p.imageUrl} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                           <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                              <div className="flex gap-2">
                                 <button onClick={() => startEdit(p)} className="flex-grow bg-white py-2 rounded-xl text-[10px] font-bold uppercase text-brand-primary">Edit</button>
                                 <button onClick={() => deleteProduct(p.id)} className="bg-red-500 text-white size-10 flex items-center justify-center rounded-xl"><Trash2 size={16} /></button>
                              </div>
                           </div>
                        </div>
                        <div className="p-6 space-y-4">
                           <div className="flex justify-between"><h4 className="font-bold text-brand-primary text-sm truncate">{p.name}</h4><p className="font-playfair italic text-brand-primary flex-shrink-0">{formatCurrency(p.price)}</p></div>
                           <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 truncate"><MapPin size={12} className="text-brand-secondary flex-shrink-0" /> {p.location}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </motion.div>
          )}

          {activeTab === 'add' && (
             <motion.div key="add" initial={{scale:0.95}} animate={{scale:1}} className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
                <form onSubmit={handleSubmit} className="editorial-card space-y-8">
                   <h2 className="text-3xl font-playfair italic text-brand-primary border-b pb-6">{editingId ? 'Edit Harvest' : 'List New Yield'}</h2>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="col-span-2 space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Full Product Name</label><input required className="w-full p-4 bg-brand-bg rounded-2xl outline-none border border-transparent focus:border-brand-primary/10" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Category</label><select className="w-full p-4 bg-brand-bg rounded-2xl" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
                      <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Unit</label><select className="w-full p-4 bg-brand-bg rounded-2xl" value={newProduct.unit} onChange={e => setNewProduct({...newProduct, unit: e.target.value})}>{units.map(u => <option key={u}>{u}</option>)}</select></div>
                      <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Price (₹)</label><input type="number" required className="w-full p-4 bg-brand-bg rounded-2xl" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
                      <div className="space-y-2"><label className="text-[10px] font-bold uppercase tracking-widest opacity-60">Stock</label><input required className="w-full p-4 bg-brand-bg rounded-2xl" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /></div>
                   </div>
                   <div className="space-y-2 pt-6 border-t font-playfair italic text-lg text-brand-primary flex justify-between items-center">Origin Info <button type="button" onClick={detectLocation} className="text-[10px] font-sans not-italic uppercase tracking-widest text-brand-secondary flex items-center gap-1"><Navigation size={12}/> Detect GPS</button></div>
                   <div className="grid grid-cols-3 gap-4">
                      <input placeholder="Village" className="p-4 bg-brand-bg rounded-2xl text-sm" value={newProduct.location.village} onChange={e => setNewProduct({...newProduct, location: {...newProduct.location, village: e.target.value}})} />
                      <input placeholder="District" className="p-4 bg-brand-bg rounded-2xl text-sm" value={newProduct.location.district} onChange={e => setNewProduct({...newProduct, location: {...newProduct.location, district: e.target.value}})} />
                      <input placeholder="State" className="p-4 bg-brand-bg rounded-2xl text-sm" value={newProduct.location.state} onChange={e => setNewProduct({...newProduct, location: {...newProduct.location, state: e.target.value}})} />
                   </div>
                   <textarea rows={3} placeholder="Describe your yield..." className="w-full p-4 bg-brand-bg rounded-2xl resize-none" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                   <button disabled={uploading} className="w-full btn-primary py-5 shadow-2xl flex items-center justify-center gap-4">{uploading ? <Loader2 className="animate-spin" /> : <Send />} {editingId ? 'Save Changes' : 'Confirm Listing'}</button>
                </form>

                <div className="space-y-8">
                   <div className="editorial-card !p-0 overflow-hidden relative group rounded-[3rem]">
                      <div className="aspect-[4/3] bg-brand-bg/50 flex flex-col items-center justify-center relative cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                         {newProduct.imageUrl ? <img src={newProduct.imageUrl} className="w-full h-full object-cover" referrerPolicy="no-referrer" /> : <div className="text-center opacity-30 space-y-4"><Camera size={64}/><p className="text-[10px] font-bold uppercase tracking-widest">Yield Photo Required</p></div>}
                         <input type="file" hidden ref={fileInputRef} onChange={handleImageUpload} />
                         {newProduct.imageUrl && (
                           <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                              <button type="button" onClick={handleAnalyzeHarvest} disabled={analyzing} className="bg-brand-primary text-white p-4 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">{analyzing ? <Loader2 className="animate-spin"/> : <BrainCircuit/>} AI Scan</button>
                           </div>
                         )}
                         {aiReport && <div className="absolute top-6 right-6 bg-brand-secondary text-white px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse shadow-2xl">AI Certified</div>}
                      </div>
                      <div className="p-10 space-y-4">
                         <h3 className="text-3xl font-playfair italic text-brand-primary">{newProduct.name || 'Untitled Harvest'}</h3>
                         <div className="flex justify-between border-t pt-4"><p className="text-3xl font-bold text-brand-primary tracking-tighter">{formatCurrency(parseFloat(newProduct.price || '0'))}</p><p className="text-xs font-bold text-gray-400 mt-2 uppercase tracking-widest">per {newProduct.unit}</p></div>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}

          {activeTab === 'assistant' && (
             <motion.div key="assistant" className="h-[700px] editorial-card !p-0 overflow-hidden flex flex-col bg-white">
                <div className="p-8 border-b bg-brand-primary/5 flex items-center gap-4"><div className="size-12 bg-brand-primary text-white rounded-2xl flex items-center justify-center"><BrainCircuit/></div><div><h3 className="text-2xl font-playfair italic text-brand-primary">AgriNexus AI.</h3><p className="text-[10px] font-bold uppercase text-brand-secondary">Neural Farm Intelligence</p></div></div>
                <div ref={scrollRef} className="flex-grow p-8 space-y-6 overflow-y-auto custom-scrollbar">
                   {assistantMessages.map((m, i) => (
                     <div key={i} className={cn("flex gap-4 max-w-[80%]", m.role === 'user' ? "ml-auto flex-row-reverse" : "")}>
                        <div className={cn("size-8 rounded-lg flex items-center justify-center shrink-0 shadow", m.role === 'user' ? "bg-brand-secondary text-white" : "bg-brand-bg text-brand-primary")}>{m.role === 'user' ? <User size={16}/> : <BrainCircuit size={16}/>}</div>
                        <div className={cn("p-6 rounded-[2rem] text-sm", m.role === 'user' ? "bg-brand-primary text-white rounded-tr-none" : "bg-white border rounded-tl-none")}><ReactMarkdown>{m.content}</ReactMarkdown></div>
                     </div>
                   ))}
                   {isTyping && <div className="p-4 bg-brand-bg rounded-full w-fit flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-brand-secondary ml-12 animate-pulse"><Loader2 className="animate-spin size-3"/> Thinking...</div>}
                </div>
                <div className="p-8 border-t"><div className="flex gap-4 bg-brand-bg p-2 rounded-[2rem] border focus-within:ring-2 ring-brand-secondary/20 transition-all"><input className="flex-grow bg-transparent p-4 outline-none font-medium" value={assistantInput} onChange={e => setAssistantInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAssistantSend()} placeholder="Ask AgriNexus about crop health, pricing, or orders..." /> <button onClick={handleAssistantSend} className="size-14 bg-brand-primary text-white rounded-full flex items-center justify-center shadow-xl"><Send/></button></div></div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* SUCCESS TOASTS */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{opacity:0, y:50}} animate={{opacity:1, y:0}} exit={{opacity:0, scale:0.9}} className="fixed bottom-12 right-12 z-[100] px-8 py-4 bg-brand-primary text-white rounded-3xl shadow-[0_20px_50px_rgba(45,106,79,0.3)] flex items-center gap-4 font-bold text-sm italic backdrop-blur-xl border border-brand-primary/20">
            <div className="bg-brand-secondary p-1 rounded-full text-brand-primary"><Sparkles size={14}/></div>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
