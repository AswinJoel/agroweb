import { Link, useLocation } from "react-router-dom";
import { Leaf, ShoppingBag, BrainCircuit, User, LayoutDashboard, LogOut, ShoppingCart as CartIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../lib/utils";
import { useState } from "react";
import CartSidebar from "./CartSidebar";

export default function Navbar() {
  const { user, profile, signIn, logout } = useAuth();
  const { count } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Marketplace", path: "/marketplace", icon: ShoppingBag },
    { name: "AI Disease Scan", path: "/disease-detection", icon: BrainCircuit },
    { name: "About", path: "/about", icon: Leaf },
  ];

  return (
    <nav className="sticky top-0 z-50 glass h-20 flex items-center px-4 md:px-12 justify-between border-b border-brand-primary/5">
      <Link to="/" className="flex items-center gap-3 group">
        <div className="bg-brand-primary w-8 h-8 rounded-lg group-hover:rotate-12 transition-transform shadow-lg" />
        <span className="text-2xl font-bold tracking-[-0.05em] text-brand-primary">AgroConnect</span>
      </Link>

      <div className="hidden md:flex items-center gap-10">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "nav-link flex items-center gap-2",
              location.pathname === item.path ? "text-brand-primary font-bold" : "text-gray-600"
            )}
          >
            {item.name}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-2 hover:bg-brand-bg rounded-lg transition-colors group"
        >
          <CartIcon className="size-5 text-gray-700 group-hover:text-brand-primary" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 size-4 bg-brand-secondary text-brand-primary text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white">
              {count}
            </span>
          )}
        </button>

        {user ? (
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-brand-primary">
              <LayoutDashboard className="size-4" />
              <span>Dashboard</span>
            </Link>
            <button onClick={logout} className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors" title="Logout">
              <LogOut className="size-4" />
            </button>
            <div className="size-8 rounded-full bg-brand-accent flex items-center justify-center text-brand-primary font-bold overflow-hidden border border-brand-primary/20">
              {user.photoURL ? <img src={user.photoURL} referrerPolicy="no-referrer" alt="" /> : <User className="size-4" />}
            </div>
          </div>
        ) : (
          <Link to="/login" className="btn-primary py-1.5 h-auto text-sm">
            Sign In
          </Link>
        )}
      </div>
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </nav>
  );
}
