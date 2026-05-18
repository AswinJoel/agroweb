import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Upload, Camera, BrainCircuit, ShieldCheck, AlertCircle, RefreshCw, ChevronRight, History, ShoppingBag } from "lucide-react";
import { cn } from "../lib/utils";

interface PredictionResult {
  disease: string;
  confidence: string;
  treatment: string;
  prevention: string;
  severity: "Low" | "Medium" | "High";
}

export default function DiseaseDetection() {
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setAnalyzing(true);
    setError(null);

    try {
      const base64Data = image.split(",")[1];
      
      const response = await fetch("/api/ai/analyze-plant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Data })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || errorData.error || "Neural Scan Failed");
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.error("Analysis client error:", err);
      setError(err.message || "Failed to analyze image. Please try again with a clearer photo of a plant leaf.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F7F0] pb-20">
      {/* Hero */}
      <div className="bg-brand-primary pt-24 pb-32 px-4 text-center text-white relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--color-brand-accent)_0%,transparent_70%)]" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 glass rounded-full text-brand-accent text-[10px] font-bold tracking-[0.2em] uppercase mb-4">
            <BrainCircuit className="size-4" />
            Bio-Diagnostic Interface
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-[-0.05em] max-w-4xl mx-auto leading-[0.9]">
            Autonomous <span className="accent-text italic">Neural Scan</span> Center.
          </h1>
          <p className="text-brand-accent/60 max-w-lg mx-auto text-sm md:text-lg italic font-medium">
            Upload harvests for real-time pathology analysis using our TensorFlow neural engine.
          </p>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-20">
        <div className="grid md:grid-cols-12 gap-8">
          {/* Upload Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "glass p-8 rounded-[3rem] shadow-2xl space-y-8 h-fit",
              result ? "md:col-span-5" : "md:col-span-12"
            )}
          >
            <div 
              onClick={() => !analyzing && fileInputRef.current?.click()}
              className={cn(
                "relative aspect-square md:aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer group bg-white/30",
                image ? "border-brand-secondary/50 overflow-hidden" : "border-gray-300 hover:border-brand-secondary hover:bg-white/50",
                analyzing && "opacity-50 pointer-events-none cursor-wait"
              )}
            >
              {image ? (
                <>
                  <img src={image} alt="Upload" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <RefreshCw className="text-white size-8" />
                  </div>
                  {analyzing && (
                    <div className="absolute inset-0 bg-brand-primary/20 backdrop-blur-[2px] flex flex-col items-center justify-center">
                      <motion.div 
                        initial={{ top: "0%" }}
                        animate={{ top: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 w-full h-[2px] bg-white shadow-[0_0_15px_rgba(255,255,255,1)] z-20"
                      />
                      <div className="flex flex-col items-center gap-3 relative z-30">
                        <div className="size-16 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-white font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">Scanning Bio-Data...</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center p-6 space-y-4">
                  <div className="size-16 bg-brand-accent/20 rounded-full flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                    <Upload className="text-brand-primary size-8" />
                  </div>
                  <div>
                    <p className="font-bold text-brand-primary">Drop leaf image here</p>
                    <p className="text-xs text-gray-500">or click to browse your files</p>
                  </div>
                  <div className="pt-2 text-[10px] text-gray-400 font-medium">JPEG, PNG supported up to 10MB</div>
                </div>
              )}
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              accept="image/*" 
              className="hidden" 
            />

            {image && !result && !analyzing && (
              <button 
                onClick={analyzeImage}
                className="w-full btn-primary py-4 text-sm tracking-widest uppercase flex items-center justify-center gap-2"
              >
                Start AI Analysis
              </button>
            )}

            {error && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-xl text-red-600 text-xs font-medium border border-red-100">
                <AlertCircle className="size-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
              <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-brand-primary transition-colors">
                <History className="size-3" />
                View Scan History
              </button>
              <div className="flex items-center gap-1">
                <ShieldCheck className="size-3 text-brand-secondary" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Neural v3.1</span>
              </div>
            </div>
          </motion.div>

          {/* Result Section */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="md:col-span-7 space-y-6"
              >
                <div className="glass p-8 rounded-[3rem] shadow-2xl border-white/50 space-y-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Analysis Result</h4>
                      <h3 className="text-3xl font-bold text-brand-primary">{result.disease}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-brand-secondary">{result.confidence}</div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Confidence</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/50 p-4 rounded-2xl border border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Severity</p>
                      <div className={cn(
                        "text-sm font-bold",
                        result.severity === "High" ? "text-red-500" : result.severity === "Medium" ? "text-orange-500" : "text-green-500"
                      )}>{result.severity}</div>
                    </div>
                    <div className="bg-white/50 p-4 rounded-2xl border border-gray-50">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="text-sm font-bold text-brand-primary">Action Required</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                       <h4 className="text-xs font-bold text-brand-primary uppercase flex items-center gap-2">
                         <RefreshCw className="size-3" />
                         Treatment Plan
                       </h4>
                       <p className="text-sm text-gray-600 leading-relaxed italic">{result.treatment}</p>
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-xs font-bold text-brand-primary uppercase flex items-center gap-2">
                         <ShieldCheck className="size-3" />
                         Prevention Strategy
                       </h4>
                       <p className="text-sm text-gray-600 leading-relaxed italic">{result.prevention}</p>
                    </div>
                  </div>

                  <div className="pt-6 flex gap-4">
                    <button className="flex-grow btn-primary py-3 text-xs uppercase font-bold tracking-widest">
                      Download Report
                    </button>
                    <button className="flex-grow btn-secondary py-3 text-xs uppercase font-bold tracking-widest">
                      Consult Expert
                    </button>
                  </div>
                </div>

                <div className="bg-brand-primary p-6 rounded-[2rem] text-white flex items-center justify-between transition-transform hover:scale-[1.02] cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="size-6 text-brand-accent" />
                    </div>
                    <div>
                      <h5 className="font-bold">Recommended Products</h5>
                      <p className="text-[10px] text-brand-accent uppercase tracking-widest">Organic pesticides & tools</p>
                    </div>
                  </div>
                  <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Information Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          {[
            { title: "AI Accuracy", description: "Continuously trained on 100k+ organic samples.", icon: BrainCircuit },
            { title: "Real-time Support", description: "Talk to our AI bot for specialized farming tips.", icon: AlertCircle },
            { title: "Privacy First", description: "All farm imagery is encrypted and used only for local data.", icon: ShieldCheck }
          ].map((item, i) => (
             <div key={i} className="editorial-card space-y-4 !p-8">
               <item.icon className="size-8 text-brand-secondary" />
               <h4 className="text-xl font-bold text-brand-primary italic">{item.title}</h4>
               <p className="text-xs text-gray-500 font-medium leading-relaxed">{item.description}</p>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
