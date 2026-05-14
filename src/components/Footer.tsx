import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-brand-primary/10 bg-brand-bg flex flex-wrap">
      <div className="stat-card flex-1 min-w-[200px]">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-bold">Farmers Connected</div>
        <div className="text-3xl font-bold text-brand-primary tracking-tighter">14,204</div>
      </div>
      <div className="stat-card flex-1 min-w-[200px]">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-bold">Market Volume</div>
        <div className="text-3xl font-bold text-brand-primary tracking-tighter">$2.8M</div>
      </div>
      <div className="stat-card flex-1 min-w-[200px]">
        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-bold">Successful Scans</div>
        <div className="text-3xl font-bold text-brand-primary tracking-tighter">892,110</div>
      </div>
      <div className="stat-card flex-[1.5] min-w-[280px] bg-brand-primary text-white border-0 p-8 flex flex-col justify-center">
        <div className="text-[10px] uppercase tracking-wider text-white/50 mb-3 font-bold">Live Market Update</div>
        <div className="flex justify-between items-center text-xs font-medium mb-1">
          <span>Organic Grains</span>
          <span className="text-brand-accent">+12.4%</span>
        </div>
        <div className="flex justify-between items-center text-xs font-medium">
          <span>Root Vegetables</span>
          <span className="text-brand-accent">+4.1%</span>
        </div>
      </div>
    </footer>
  );
}
