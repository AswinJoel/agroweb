import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-brand-primary/10 bg-brand-bg flex flex-wrap">
      <div className="stat-card flex-1 min-w-[200px]">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-black">Connected Farmers</div>
        <div className="text-3xl font-bold text-brand-primary tracking-tighter">Growing.</div>
      </div>
      <div className="stat-card flex-1 min-w-[200px]">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-black">Market Volume</div>
        <div className="text-3xl font-bold text-brand-primary tracking-tighter">Real-time.</div>
      </div>
      <div className="stat-card flex-1 min-w-[200px]">
        <div className="text-[10px] uppercase tracking-wider text-gray-400 mb-2 font-black">Verified Scans</div>
        <div className="text-3xl font-bold text-brand-primary tracking-tighter">Direct.</div>
      </div>
      <div className="stat-card flex-[1.5] min-w-[280px] bg-brand-primary text-white border-0 p-8 flex flex-col justify-center">
        <div className="text-[10px] uppercase tracking-wider text-white/40 mb-3 font-black">Live Pulse</div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest mb-1 italic">
          <span>Root Vegetables</span>
          <span className="text-brand-accent">In Harvest</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest italic">
          <span>Organic Grains</span>
          <span className="text-brand-accent">Available</span>
        </div>
      </div>
    </footer>
  );
}
