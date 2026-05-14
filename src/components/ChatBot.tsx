import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Leaf, BrainCircuit, User } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

interface Message {
  role: "user" | "bot";
  content: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I'm **AgroBot**. How can I help you with your farming or shopping today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: messages.map(m => ({ 
          role: m.role === "user" ? "user" : "model", 
          parts: [{ text: m.content }] 
        })).concat({ role: "user", parts: [{ text: userMessage }] }),
        config: {
          systemInstruction: "You are AgroBot, a helpful AI assistant for AgroConnect, a smart agriculture platform. You specialize in farming tips, organic product knowledge, and helping users navigate the app. Keep responses concise, helpful, and use markdown where appropriate."
        }
      });

      setMessages(prev => [...prev, { role: "bot", content: response.text }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I'm experiencing some tech issues. Please try again in a moment!" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 size-14 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-[100] group"
      >
        <MessageCircle className={cn("size-7 transition-all", isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100")} />
        <BrainCircuit className={cn("size-7 absolute transition-all", isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
        <div className="absolute -top-1 -right-1 size-4 bg-brand-secondary rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-[2rem] shadow-2xl z-[100] border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-brand-primary p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Leaf className="size-6 text-brand-accent" />
                </div>
                <div>
                  <h3 className="font-bold leading-none">AgroBot</h3>
                  <span className="text-[10px] text-brand-accent uppercase font-bold tracking-widest">AI Farming Assistant</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-grow overflow-y-auto p-6 space-y-4 scroll-smooth"
            >
              {messages.map((m, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                    m.role === "user" ? "bg-brand-primary text-white" : "bg-brand-accent/20 text-brand-primary"
                  )}>
                    {m.role === "user" ? <User className="size-4" /> : <BrainCircuit className="size-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm leading-relaxed",
                    m.role === "user" ? "bg-brand-bg text-brand-primary rounded-tr-none" : "bg-gray-100 text-gray-800 rounded-tl-none"
                  )}>
                    <div className="prose prose-sm prose-green max-w-none shadow-text text-gray-800">
                      <ReactMarkdown>
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3 max-w-[85%] mr-auto italic text-xs text-gray-400">
                   <div className="size-8 rounded-lg bg-gray-100 flex items-center justify-center">
                     <div className="size-1 bg-brand-primary rounded-full animate-bounce" />
                   </div>
                   AgroBot is thinking...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-50 flex items-center gap-3 bg-brand-bg/30">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything about farming..."
                className="flex-grow p-3 bg-white rounded-xl text-sm outline-none border focus:border-brand-secondary transition-all"
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="size-11 bg-brand-primary text-white rounded-xl flex items-center justify-center disabled:opacity-50 transition-all hover:shadow-lg active:scale-95"
              >
                <Send className="size-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
