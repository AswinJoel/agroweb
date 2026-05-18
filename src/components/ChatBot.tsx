import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, Leaf, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { cn } from "../lib/utils";

interface Message {
  role: "user" | "bot";
  content: string;
}

const SYSTEM_PROMPT = "You are Agro, the friendly assistant for AgroConnect — India's direct farm-to-customer marketplace. Help users with: order tracking, finding fresh produce, understanding AI freshness grades (Very good to buy, Good to buy, Better, Quick to cook, Not fair), payment issues, and app navigation. Keep replies short and friendly.";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hi! I'm **Agro** 🌱. Fresh from the fields and ready to help. What's on your mind today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickReplies = [
    "Track my order",
    "What's fresh today?",
    "How does grading work?",
    "Talk to support"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (text?: string) => {
    const messageToSend = text || input.trim();
    if (!messageToSend || loading) return;

    if (!text) setInput("");
    const newMessages = [...messages, { role: "user" as const, content: messageToSend }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageToSend, context: SYSTEM_PROMPT })
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();
      const botResponse = data.response || "Agro is here to help!";

      setMessages(prev => [...prev, { role: "bot", content: botResponse }]);
    } catch (err) {
      console.error("ChatBot Error:", err);
      setMessages(prev => [...prev, { role: "bot", content: "Agro is resting 🌱 Please try again in a moment" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 size-14 bg-green-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform active:scale-95 z-[100] group"
        id="chatbot-trigger"
      >
        <MessageCircle className={cn("size-7 transition-all", isOpen ? "scale-0 opacity-0" : "scale-100 opacity-100")} />
        <Leaf className={cn("size-7 absolute transition-all", isOpen ? "scale-100 opacity-100" : "scale-0 opacity-0")} />
        <div className="absolute -top-1 -right-1 size-4 bg-yellow-400 rounded-full border-2 border-white animate-pulse" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 100, x: 100 }}
            className="fixed bottom-24 right-6 w-[90vw] md:w-[400px] h-[600px] max-h-[80vh] bg-white rounded-[2rem] shadow-2xl z-[100] border border-gray-100 overflow-hidden flex flex-col"
            id="chatbot-container"
          >
            {/* Header */}
            <div className="bg-green-700 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Leaf className="size-6 text-yellow-300" />
                </div>
                <div>
                  <h3 className="font-bold leading-none">Agro Assistant</h3>
                  <span className="text-[10px] text-green-200 uppercase font-bold tracking-widest">Always Fresh</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                id="close-chatbot"
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
                    m.role === "user" ? "bg-green-600 text-white" : "bg-green-50 text-green-700"
                  )}>
                    {m.role === "user" ? <User className="size-4" /> : <Leaf className="size-4" />}
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
                     <div className="size-1 bg-green-600 rounded-full animate-bounce" />
                   </div>
                   Agro is thinking...
                </div>
              )}
            </div>

            {/* Quick Replies */}
            {!loading && (
              <div className="px-6 pb-4 flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <button 
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="text-[10px] font-bold uppercase tracking-widest px-3 py-2 bg-green-50 text-green-700 rounded-full border border-green-100 hover:bg-green-100 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-gray-50 flex items-center gap-3 bg-brand-bg/30">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask Agro anything..."
                className="flex-grow p-4 bg-white rounded-2xl text-sm outline-none border focus:border-green-500 transition-all shadow-sm"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="size-12 bg-green-600 text-white rounded-2xl flex items-center justify-center disabled:opacity-50 transition-all hover:shadow-lg active:scale-95 shadow-md"
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
