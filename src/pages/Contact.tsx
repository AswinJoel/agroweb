import { useState } from "react";
import { motion } from "motion/react";
import { MapPin, Phone, Mail, Send, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { cn } from "../lib/utils";

export default function Contact() {
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Hero */}
      <section className="bg-brand-primary py-24 px-4 text-center text-white relative">
        <div className="max-w-4xl mx-auto space-y-6 relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold italic tracking-[-0.05em] leading-[0.9] text-brand-bg">Get in Touch.</h1>
          <p className="text-brand-accent/60 max-w-lg mx-auto text-lg font-medium">Have questions about our AI tech or marketplace? Our team is here to support the agriculture community 24/7.</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info Side */}
          <div className="space-y-12">
            <div className="glass p-10 rounded-[3rem] shadow-2xl border-white/50 space-y-8">
              <h2 className="text-3xl font-bold text-brand-primary">Our Global Hubs</h2>
              
              <div className="space-y-8">
                {[
                  { icon: MapPin, title: "Headquarters", detail: "123 Agri-Tech Center, Silicon Valley, CA 94043" },
                  { icon: Phone, title: "Direct Support", detail: "+1 (888) AGRO-HELP" },
                  { icon: Mail, title: "Support Email", detail: "contact@agroconnect.ai" }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 items-start">
                    <div className="p-4 bg-brand-bg rounded-2xl border border-brand-accent/20">
                      <item.icon className="size-6 text-brand-primary" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 border-t border-gray-100 grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Response Time</p>
                    <p className="text-sm font-bold text-brand-primary">Under 2 Hours</p>
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] uppercase font-bold text-gray-400">Available</p>
                    <p className="text-sm font-bold text-brand-primary">Mon - Sat, 9am - 6pm</p>
                 </div>
              </div>
            </div>

            <div className="bg-brand-secondary p-8 rounded-[3rem] text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <MessageSquare className="size-10 text-white/50" />
                <div>
                  <h4 className="font-bold">Live AI Chatbot</h4>
                  <p className="text-xs text-white/70">Instant support for common queries.</p>
                </div>
              </div>
              <button className="px-6 py-2 bg-white text-brand-secondary rounded-full text-xs font-bold hover:scale-105 transition-transform uppercase tracking-widest">
                Launch Bot
              </button>
            </div>
          </div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl border border-gray-100"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-brand-primary italic">Send a Message</h3>
                <p className="text-sm text-gray-500">We respond to every single query within one business day.</p>
              </div>

              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="John Farmer"
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary outline-none transition-all text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email" 
                      required
                      placeholder="john@example.com"
                      className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary outline-none transition-all text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                  <select className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary outline-none transition-all text-sm appearance-none">
                    <option>General Inquiry</option>
                    <option>Farmer Verification</option>
                    <option>Marketplace Support</option>
                    <option>AI Scanning Issue</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Message</label>
                  <textarea 
                    rows={5}
                    required
                    placeholder="How can we help your business today?"
                    className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-brand-secondary outline-none transition-all text-sm resize-none"
                  ></textarea>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full btn-primary py-5 text-sm tracking-widest uppercase flex items-center justify-center gap-2"
                disabled={sent}
              >
                {sent ? "Message Delivered!" : <><Send className="size-4" /> Send Message</>}
              </button>

              <div className="flex items-center justify-center gap-8 grayscale opacity-40">
                 <div className="flex items-center gap-1"><ShieldCheck className="size-4" /> <span className="text-[10px] font-bold">Secure Data</span></div>
                 <div className="flex items-center gap-1"><Users className="size-4" /> <span className="text-[10px] font-bold">24/7 Support</span></div>
              </div>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
