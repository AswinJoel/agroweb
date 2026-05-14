import { motion } from "motion/react";
import { ArrowRight, BrainCircuit, ShoppingBag, Truck, ShieldCheck, Users, BarChart3, CloudSun } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../lib/utils";

export default function Landing() {
  const stats = [
    { label: "Connected Farmers", value: "2.5k+", icon: Users },
    { label: "Orders Delivered", value: "15k+", icon: ShoppingBag },
    { label: "AI Disease Scans", value: "50k+", icon: BrainCircuit },
  ];

  const features = [
    {
      title: "AI-Powered Diagnostics",
      description: "Detect crop diseases instantly with our advanced vision AI. Get treatment suggestions and prevention maps.",
      icon: BrainCircuit,
      color: "bg-blue-50 text-blue-600"
    },
    {
      title: "Direct Market Access",
      description: "Eliminate middlemen and sell directly to consumers. Farmers get better prices, consumers get fresher food.",
      icon: ShoppingBag,
      color: "bg-green-50 text-green-600"
    },
    {
      title: "Smart Logistics",
      description: "Track your orders in real-time. Our logistics partners ensure farm-to-table freshness within 24 hours.",
      icon: Truck,
      color: "bg-orange-50 text-orange-600"
    },
    {
      title: "Data-Driven Growth",
      description: "Access market analytics and weather predictions to make informed decisions about your farming business.",
      icon: BarChart3,
      color: "bg-purple-50 text-purple-600"
    }
  ];

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center pt-20 pb-20 md:pb-0">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-brand-secondary/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-brand-accent/20 rounded-full blur-[150px]" />
          <img 
            src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=2070" 
            alt="Agriculture background" 
            className="absolute inset-0 w-full h-full object-cover opacity-10 grayscale-[0.5]"
            referrerPolicy="no-referrer"
          />
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/50 border border-brand-accent/30 rounded-full text-brand-primary text-xs font-semibold tracking-wider uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-secondary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-secondary"></span>
              </span>
              Next-Gen Agriculture
            </div>
            
            <h1 className="text-6xl md:text-[82px] font-bold leading-[0.95] text-brand-primary tracking-[-0.05em]">
              Empowering <span className="accent-text italic">Farmers</span> with AI & Direct Market Access.
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-lg leading-relaxed font-medium opacity-80">
              AgroConnect bridges the gap between field and table. Use our AI vision system to detect blight or list your harvest to 12k+ direct buyers.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/marketplace" className="btn-primary group flex items-center gap-2 py-4 px-8 text-lg">
                Explore Marketplace
                <ArrowRight className="size-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/disease-detection" className="btn-secondary flex items-center gap-2 py-4 px-8 text-lg">
                Analyze Crop Health
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-4">
                {[1,2,3,4].map(i => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" className="size-10 rounded-full border-2 border-white grayscale hover:grayscale-0 transition-all cursor-pointer" referrerPolicy="no-referrer" />
                ))}
              </div>
              <div className="text-sm">
                <p className="font-bold text-brand-primary">Joined by 2500+ Farmers</p>
                <div className="flex text-yellow-500 items-center">
                  {[1,2,3,4,5].map(i => <Star key={i} fill="currentColor" className="size-3" />)}
                  <span className="text-gray-500 ml-1 text-xs">4.9/5 Average Rating</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white/30 backdrop-blur-sm">
              <img 
                src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=2070" 
                alt="Agri AI" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 glass p-4 rounded-xl flex items-center gap-3 animate-bounce">
                <BrainCircuit className="text-brand-secondary size-8" />
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-500 leading-none">AI Insight</p>
                  <p className="text-xs font-bold text-brand-primary">Tomato Leaf: Healthy</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 glass p-6 rounded-2xl shadow-xl space-y-2 max-w-[200px]">
              <div className="flex items-center gap-2 text-brand-secondary">
                <ShieldCheck className="size-5" />
                <span className="font-bold text-sm">Verified Farm</span>
              </div>
              <p className="text-xs text-gray-500">Green Oaks Estate is 100% organic certified.</p>
            </div>
            
            {/* Background elements */}
            <div className="absolute -z-10 -top-10 -right-10 size-40 bg-brand-accent/30 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-y border-brand-primary/10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="stat-card flex items-center gap-6 group"
            >
              <div className="p-4 bg-brand-bg rounded-2xl group-hover:scale-110 transition-transform">
                <stat.icon className="text-brand-primary size-8" />
              </div>
              <div>
                <p className="text-4xl font-bold text-brand-primary tracking-tighter">{stat.value}</p>
                <p className="text-xs text-gray-400 uppercase font-bold tracking-widest">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-primary italic">Innovation Meets Earth</h2>
            <p className="text-gray-600">We combining centuries of agricultural wisdom with modern artificial intelligence to build a sustainable food system for everyone.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="editorial-card group"
              >
                <div className={cn("size-14 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:rotate-6", feature.color)}>
                  <feature.icon className="size-7" />
                </div>
                <h3 className="text-xl font-bold text-brand-primary mb-3 italic">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto rounded-[3rem] bg-brand-bg border border-brand-accent overflow-hidden relative p-12 md:p-20 text-center space-y-8">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-secondary to-transparent" />
          <h2 className="text-4xl md:text-6xl font-bold text-brand-primary max-w-3xl mx-auto leading-tight">
            Ready to Digitalize Your <span className="text-brand-secondary italic">Farm Business?</span>
          </h2>
          <p className="text-gray-600 max-w-lg mx-auto">
            Join thousands of successful farmers and start selling your products directly to millions of customers.
          </p>
          <div className="flex justify-center gap-4">
            <button className="btn-primary py-4 px-10">Register as Farmer</button>
            <button className="btn-secondary py-4 px-10">Browse Market</button>
          </div>
          
          <div className="pt-8 grid grid-cols-2 md:grid-cols-4 gap-4 opacity-50 grayscale transition-all hover:grayscale-0">
            <img src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" className="h-6 mx-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Logo_TV_2015.svg/1200px-Logo_TV_2015.svg.png" className="h-6 mx-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/51/IBM_logo.svg" className="h-6 mx-auto" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/bd/Tesla_Motors.svg" className="h-6 mx-auto" />
          </div>
        </div>
      </section>
    </div>
  );
}

function Star({ className, fill }: { className?: string, fill?: string }) {
  return (
    <svg className={className} fill={fill || "none"} stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
}
