import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Search, Filter, ShoppingCart, Star, ChevronRight, X, Heart, Sparkles, Loader2, MapPin, ArrowRight, CreditCard, Leaf } from "lucide-react";
import { cn, formatCurrency } from "../lib/utils";
import { getProductRecommendations, Recommendation } from "../services/aiService";
import { useCart } from "../contexts/CartContext";
import { API_BASE_URL, PRODUCT_CATEGORIES } from "../constants";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  unit: string;
  imageUrl: string;
  farmerId: string;
  rating: number;
  reviewsCount: number;
}

export default function Marketplace() {
  const { addToCart } = useCart();
  const [showToast, setShowToast] = useState<string | null>(null);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setShowToast(`${product.name} added to your harvest basket!`);
  };
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingAI, setLoadingAI] = useState(true);

  const categories = PRODUCT_CATEGORIES;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) throw new Error("Failed to fetch products");
        const data = await response.json();
        // Ensure data is an array
        const productsList = Array.isArray(data) ? data : (data.products || []);
        setProducts(productsList);
        setFilteredProducts(productsList);
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError("Unable to load fresh harvest at the moment.");
        // We set to empty array on error as requested: "Remove ALL fake data... Replace with empty states"
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    async function loadAI() {
      try {
        const recs = await getProductRecommendations("consumer", ["Tomatoes", "Oranges"], ["Potatoes", "Onions"]);
        setRecommendations(recs);
      } catch (e) {
        console.warn("AI Recommendations unavailable");
      } finally {
        setLoadingAI(false);
      }
    }
    loadAI();
  }, []);

  useEffect(() => {
    let result = products;
    if (activeCategory !== "All") {
      result = result.filter(p => p.category === activeCategory);
    }
    if (search) {
      result = result.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
    }
    setFilteredProducts(result);
  }, [search, activeCategory, products]);


  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-brand-primary py-24 text-center text-white px-4">
        <h2 className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-accent/60 mb-4 leading-none">Fresh Deliveries</h2>
        <h1 className="text-6xl md:text-8xl font-bold tracking-[-0.05em] mb-4">Marketplace.</h1>
        <p className="text-brand-accent/70 max-w-xl mx-auto italic font-medium">Direct access to the freshest harvests from local verified farms. Fair prices for both farmers and you.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-8 space-y-12">
        {/* Featured Recommendations */}
        <div className="editorial-card !p-8 bg-brand-bg md:flex items-center gap-12 group transition-all hover:bg-white">
          <div className="flex-shrink-0 mb-6 md:mb-0">
             <div className="size-20 bg-brand-primary text-brand-accent rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:rotate-6 transition-transform">
                <Sparkles className="size-10 animate-pulse" />
             </div>
          </div>
          <div className="flex-grow space-y-6">
            <div className="space-y-1">
               <h3 className="text-3xl font-bold text-brand-primary italic tracking-tight">Curated for You.</h3>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">Based on your neural market profile</p>
            </div>
            
            {loadingAI ? (
               <div className="flex items-center gap-3 text-xs italic text-gray-400 font-medium">
                  <Loader2 className="animate-spin size-4" />
                  Generating personalized harvest links...
               </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                 {recommendations.slice(0, 2).map((rec, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className="px-6 py-3 bg-white border border-brand-primary/5 rounded-2xl flex items-center gap-3 hover:border-brand-secondary transition-colors cursor-pointer group/item"
                    >
                       <div className="size-8 bg-brand-bg rounded-lg flex items-center justify-center text-brand-primary group-hover/item:scale-110 transition-transform">
                          <ShoppingCart className="size-4" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-gray-800">{rec.name}</p>
                          <p className="text-[10px] text-gray-400 font-medium italic">{rec.category}</p>
                       </div>
                    </motion.div>
                 ))}
                 <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary pl-4 hover:underline">
                    View More Matches <ArrowRight className="size-3" />
                 </button>
              </div>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="glass p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between transition-all shadow-xl border-white/40">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search organic products..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-gray-100/50 border-none focus:ring-2 focus:ring-brand-secondary outline-none transition-all text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {categories.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all",
                  activeCategory === cat 
                    ? "bg-brand-primary text-white shadow-md scale-105" 
                    : "bg-white text-gray-600 hover:bg-gray-100"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin size-8 border-4 border-brand-secondary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group editorial-card !p-0 overflow-hidden group flex flex-col"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-100">
                    <img 
                      src={p.imageUrl} 
                      alt={p.name} 
                      className="w-full h-full object-cover group-hover:scale-110 grayscale group-hover:grayscale-0 transition-all duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-brand-primary shadow-sm">
                        {p.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(p);
                        }}
                        className="size-10 flex items-center justify-center bg-brand-secondary text-brand-primary rounded-full shadow-lg hover:scale-110 transition-all border-2 border-white"
                        title="Add to Basket"
                      >
                        <ShoppingCart className="size-4" />
                      </button>
                      <button className="size-8 flex items-center justify-center bg-white/90 backdrop-blur text-gray-400 hover:text-red-500 rounded-full shadow-sm transition-colors">
                        <Heart className="size-4" />
                      </button>
                    </div>
                  </div>

                  <div className="p-6 flex-grow flex flex-col space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 group-hover:text-brand-primary transition-colors">{p.name}</h3>
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-600">
                        <Star className="size-3 fill-current" />
                        {p.rating}
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{p.description}</p>
                    
                    <div className="pt-2 flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-xl font-bold text-brand-primary">{formatCurrency(p.price)}</span>
                        <span className="text-xs text-gray-400 ml-1">/ {p.unit}</span>
                      </div>
                      <button 
                        onClick={() => setSelectedProduct(p)}
                        className="btn-secondary px-4 py-1.5 text-[10px] h-auto flex items-center gap-1 group/btn"
                      >
                        Details
                        <ChevronRight className="size-3 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <AnimatePresence>
          {showToast && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-brand-primary text-white rounded-full shadow-2xl flex items-center gap-3 font-bold text-xs italic tracking-tight"
            >
              <div className="bg-brand-secondary p-1 rounded-full text-brand-primary">
                <ShoppingCart className="size-3" />
              </div>
              {showToast}
            </motion.div>
          )}
        </AnimatePresence>

        {!loading && filteredProducts.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-32 space-y-8 bg-white rounded-[3rem] border border-brand-primary/5 shadow-sm"
          >
            <div className="relative inline-block">
              <div className="bg-brand-bg size-32 mx-auto rounded-full flex items-center justify-center shadow-inner">
                <Leaf className="size-16 text-brand-primary/20 animate-pulse" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white p-3 rounded-2xl shadow-xl">
                 <Search className="size-6 text-brand-secondary" />
              </div>
            </div>
            <div className="space-y-4 max-w-md mx-auto">
              <h3 className="font-bold text-brand-primary italic text-3xl tracking-tight">No products available yet.</h3>
              <p className="text-gray-400 font-medium leading-relaxed italic">
                Our farmers are currently harvesting. Check back shortly for fresh, organic arrivals direct from the field.
              </p>
            </div>
            <button 
              onClick={() => {
                setActiveCategory("All");
                setSearch("");
              }}
              className="btn-secondary px-8 py-4 text-[10px] uppercase font-bold tracking-widest"
            >
              Reset Filters
            </button>
          </motion.div>
        )}
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedProduct(null)}
              className="absolute inset-0 bg-brand-primary/40 backdrop-blur-sm"
            />
            <motion.div
              layoutId={selectedProduct.id}
              className="relative w-full max-w-4xl bg-white rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => setSelectedProduct(null)}
                className="absolute top-6 right-6 z-10 glass size-10 flex items-center justify-center rounded-full text-gray-500 hover:text-black transition-colors"
              >
                <X className="size-5" />
              </button>

              <div className="md:w-1/2 aspect-square md:aspect-auto">
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="md:w-1/2 p-8 md:p-12 space-y-8 flex flex-col">
                <div className="space-y-4">
                  <span className="text-xs font-bold tracking-widest text-brand-secondary uppercase">{selectedProduct.category}</span>
                  <h2 className="text-4xl font-bold text-brand-primary">{selectedProduct.name}</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex text-yellow-500">
                      {[1,2,3,4,5].map(i => <Star key={i} fill={i <= Math.round(selectedProduct.rating) ? "currentColor" : "none"} className="size-4" />)}
                    </div>
                    <span className="text-sm text-gray-400">({selectedProduct.reviewsCount} verified reviews)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">About this product</h4>
                  <p className="text-gray-600 leading-relaxed italic">{selectedProduct.description}</p>
                </div>

                <div className="pt-6 border-t border-gray-100 mt-auto flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">Price per {selectedProduct.unit}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-brand-primary tracking-tighter">{formatCurrency(selectedProduct.price)}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button 
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="btn-secondary py-4 px-8 flex items-center justify-center gap-2 flex-1"
                    >
                      <ShoppingCart className="size-5" />
                      Add to Basket
                    </button>
                    <Link 
                      to="/checkout"
                      onClick={() => addToCart(selectedProduct)}
                      className="btn-primary py-4 px-8 flex items-center justify-center gap-2 group flex-1"
                    >
                      <CreditCard className="size-5" />
                      Checkout Now
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

