import { motion } from "motion/react";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ChevronLeft } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { formatCurrency, cn } from "../lib/utils";
import { useNavigate, Link } from "react-router-dom";

export default function Cart() {
  const { items, total, updateQty, removeFromCart, count } = useCart();
  const navigate = useNavigate();

  const deliveryFee = total > 50 ? 0 : 5.00;
  const finalTotal = total + deliveryFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center justify-center bg-brand-bg space-y-6">
         <div className="size-24 bg-white rounded-full flex items-center justify-center shadow-xl">
            <ShoppingBag className="size-10 text-brand-primary" />
         </div>
         <h2 className="text-2xl font-bold italic text-brand-primary">Your basket is empty.</h2>
         <p className="text-gray-500 italic">Looks like you haven't added any fresh produce yet.</p>
         <button onClick={() => navigate('/marketplace')} className="btn-primary px-8 py-4 text-[10px] uppercase font-bold tracking-widest">Explore Marketplace</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-24 bg-brand-bg">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-brand-primary italic">Your Basket.</h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Review your fresh harvest selections</p>
          </div>
          <Link to="/marketplace" className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-primary hover:text-brand-secondary transition-colors">
            <ChevronLeft className="size-4" /> Back to Market
          </Link>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-8 space-y-6">
            {items.map((item) => (
              <motion.div 
                layout
                key={item.id} 
                className="editorial-card flex gap-6 items-center group"
              >
                <div className="size-24 bg-brand-bg rounded-2xl overflow-hidden shrink-0 border border-brand-primary/5">
                  <img 
                    src={item.imageUrl} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                <div className="flex-grow space-y-1">
                  <h4 className="font-bold text-brand-primary text-lg italic">{item.name}</h4>
                  <p className="text-xs font-mono text-gray-500">{formatCurrency(item.price)} / unit</p>
                  
                  <div className="flex items-center gap-6 mt-4">
                    <div className="flex items-center bg-brand-bg rounded-xl border border-brand-primary/5 p-1">
                       <button onClick={() => updateQty(item.id, -1)} className="p-1.5 hover:text-brand-secondary transition-colors"><Minus className="size-4" /></button>
                       <span className="text-sm font-bold w-8 text-center">{item.qty}</span>
                       <button onClick={() => updateQty(item.id, 1)} className="p-1.5 hover:text-brand-secondary transition-colors"><Plus className="size-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                       <Trash2 className="size-4" /> Remove
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-brand-primary">{formatCurrency(item.price * item.qty)}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4">
            <div className="editorial-card !p-8 sticky top-32 space-y-8 shadow-2xl">
              <h3 className="text-xl font-bold tracking-tight italic text-brand-primary border-b border-gray-100 pb-4">Cart Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Subtotal ({count} items)</span>
                  <span className="font-mono">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500 font-medium">
                  <span>Delivery Fee</span>
                  {deliveryFee === 0 ? (
                    <span className="text-green-600 font-bold uppercase tracking-widest text-[10px]">Free</span>
                  ) : (
                    <span className="font-mono">{formatCurrency(deliveryFee)}</span>
                  )}
                </div>
                {deliveryFee > 0 && (
                  <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest bg-brand-bg p-2 rounded-lg text-center">
                    Add {formatCurrency(50 - total)} more for free delivery
                  </p>
                )}
                
                <div className="flex justify-between text-2xl font-bold text-brand-primary italic pt-6 border-t border-brand-primary/5">
                  <span>Total</span>
                  <span className="font-mono non-italic">{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <button 
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 duration-200"
              >
                Proceed to Checkout <ArrowRight className="size-4" />
              </button>
              
              <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                By proceeding, you agree to local farm-direct terms & conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
