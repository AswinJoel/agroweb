import { motion, AnimatePresence } from "motion/react";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { formatCurrency, cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, total, updateQty, removeFromCart, count } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[101] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShoppingBag className="text-brand-primary size-6" />
                <h3 className="text-xl font-bold italic text-brand-primary">Your Harvest</h3>
                <span className="text-xs bg-brand-bg text-brand-primary font-bold px-2 py-0.5 rounded-full">
                  {count}
                </span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="size-6 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                  <div className="size-20 bg-brand-bg rounded-full flex items-center justify-center">
                    <ShoppingBag className="size-10 text-brand-primary" />
                  </div>
                  <p className="text-sm font-medium italic">Empty basket. Start exploring local harvests!</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="size-20 bg-brand-bg rounded-2xl overflow-hidden shrink-0 border border-brand-primary/5">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-grow space-y-1">
                      <h4 className="font-bold text-brand-primary text-sm line-clamp-1">{item.name}</h4>
                      <p className="text-xs font-mono text-gray-500">{formatCurrency(item.price)} / unit</p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center bg-brand-bg rounded-lg border border-brand-primary/5">
                           <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:text-brand-secondary transition-colors"><Minus className="size-3" /></button>
                           <span className="text-xs font-bold w-6 text-center">{item.qty}</span>
                           <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:text-brand-secondary transition-colors"><Plus className="size-3" /></button>
                        </div>
                        <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                           <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                    <p className="font-bold text-sm text-brand-primary">{formatCurrency(item.price * item.qty)}</p>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 bg-brand-bg border-t border-brand-primary/5 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Amount</span>
                  <span className="text-2xl font-bold text-brand-primary italic">{formatCurrency(total)}</span>
                </div>
                
                <button 
                  onClick={() => {
                    onClose();
                    navigate('/checkout');
                  }}
                  className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 duration-200"
                >
                  Proceed to Checkout <ArrowRight className="size-4" />
                </button>
                <p className="text-[9px] text-center text-gray-400 font-bold uppercase tracking-widest">
                  Secure Neural Checkout &middot; Free Delivery &gt; $50
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
