import { motion } from "motion/react";
import { ShieldCheck, Target, Users, BrainCircuit, Leaf, Globe, Zap, Compass } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Hero */}
      <section className="bg-brand-bg py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
           <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/graphy.png')]" />
        </div>
        
        <div className="max-w-4xl mx-auto space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block p-4 bg-white rounded-3xl shadow-xl mb-4"
          >
            <Leaf className="size-12 text-brand-primary" />
          </motion.div>
          <h1 className="text-5xl md:text-8xl font-bold italic text-brand-primary tracking-[-0.05em] leading-[0.9]">Our Green Mission.</h1>
          <p className="text-xl md:text-2xl text-gray-600 max-w-2xl mx-auto italic font-medium opacity-80">
            "Redefining the relationship between those who grow food and those who nourish themselves with it."
          </p>
        </div>
      </section>

      {/* Grid Content */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24 grid md:grid-cols-2 gap-20 items-center">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="space-y-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-brand-primary leading-tight lowercase tracking-tighter italic underline decoration-brand-accent/50 underline-offset-8">
            the problem we solve.
          </h2>
          <div className="space-y-6 text-gray-600 leading-relaxed">
            <p>
              The current agricultural supply chain is broken. Farmers often receive less than 30% of the final market price, while consumers pay a premium for produce that has spent weeks in warehouses and transit.
            </p>
            <p className="font-bold text-gray-900 border-l-4 border-brand-secondary pl-6 italic">
              "AgroConnect was born out of a simple realization: Technology should empower the producer, not just the distributor."
            </p>
            <p>
              By leveraging AI Diagnostics and Blockchain-verified marketplace logic, we provide a transparent, instantaneous connection between the farm and the table.
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-8 pt-6">
             <div className="space-y-2">
               <h4 className="text-3xl font-bold text-brand-primary italic">70%</h4>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">More Income for Farmers</p>
             </div>
             <div className="space-y-2">
               <h4 className="text-3xl font-bold text-brand-primary italic">24h</h4>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Delivery Latency</p>
             </div>
          </div>
        </motion.div>

        <div className="relative">
          <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative z-10 border-[12px] border-white/50 grayscale hover:grayscale-0 transition-all duration-700">
             <img src="https://images.unsplash.com/photo-1595008064538-4e172e27606e?auto=format&fit=crop&q=80&w=2070" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="absolute -bottom-10 -right-10 size-64 bg-brand-accent/20 rounded-full blur-[100px] -z-10" />
          <div className="absolute top-[20%] -left-12 glass p-6 rounded-2xl shadow-xl space-y-2 max-w-[150px] animate-bounce">
             <ShieldCheck className="size-6 text-brand-secondary" />
             <p className="text-[10px] font-bold uppercase tracking-widest text-brand-primary">Verified Origin</p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mt-40 bg-brand-primary py-24 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20 border-b border-white/10 pb-12">
            <h2 className="text-5xl font-bold italic tracking-tighter">Core Principles.</h2>
            <p className="max-w-md text-brand-accent/60 text-sm leading-relaxed">Defining the standard for digitalized sustainable agriculture through relentless innovation.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              { icon: BrainCircuit, title: "AI Transparency", desc: "No black boxes. Every scan and prediction is backed by transparent data models and agricultural research." },
              { icon: Target, title: "Direct Economies", desc: "We are not a store; we are a conduit. Our profit model is built on farmer success, not margin extraction." },
              { icon: Globe, title: "Regenerative Future", desc: "AgroConnect incentivizes sustainable farming practices that restore soil health and biodiversity." }
            ].map((v, i) => (
              <div key={i} className="space-y-6 group">
                <div className="size-16 bg-white/10 rounded-2xl flex items-center justify-center transition-all group-hover:bg-brand-secondary group-hover:rotate-12">
                  <v.icon className="size-8 text-brand-accent" />
                </div>
                <h3 className="text-2xl font-bold italic tracking-tight">{v.title}</h3>
                <p className="text-sm text-brand-accent/60 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="py-24 px-4 bg-brand-bg/30">
        <div className="max-w-5xl mx-auto text-center space-y-12">
          <div className="space-y-4">
             <h3 className="text-[10px] uppercase font-bold text-gray-400 tracking-[0.3em]">The Tech Stack</h3>
             <h2 className="text-4xl font-bold text-brand-primary italic">Built for the Next Decade.</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <div className="glass p-8 rounded-3xl space-y-4">
                <Zap className="size-8 mx-auto text-yellow-500" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-brand-primary">Neural Core</h4>
             </div>
             <div className="glass p-8 rounded-3xl space-y-4">
                <Compass className="size-8 mx-auto text-brand-secondary" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-brand-primary">Supply Vision</h4>
             </div>
             <div className="glass p-8 rounded-3xl space-y-4">
                <Users className="size-8 mx-auto text-blue-500" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-brand-primary">Community Mesh</h4>
             </div>
             <div className="glass p-8 rounded-3xl space-y-4">
                <Leaf className="size-8 mx-auto text-green-500" />
                <h4 className="font-bold text-xs uppercase tracking-widest text-brand-primary">Bio Analytics</h4>
             </div>
          </div>
        </div>
      </section>
    </div>
  );
}
