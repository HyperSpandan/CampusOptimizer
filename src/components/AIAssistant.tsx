import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageSquare, Send, X, Bot, User, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from "react-markdown";
import { cn } from "@/lib/utils";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([
    { role: "assistant", content: "Hi! I'm your Campus Assistant. How can I help you find or book a resource today?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: "user", parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: `You are a helpful Campus Resource Assistant for the "Campus Resource Optimizer" app. 
          You help students find available study rooms, labs, and equipment. 
          Be concise, friendly, and professional. 
          If asked about availability, mention that they can check the Dashboard for real-time updates.
          Current context: It's a busy Tuesday morning. Lab 3 is currently full but Room B204 is available.`
        }
      });

      const assistantMessage = response.text || "I'm sorry, I couldn't process that. Please try again.";
      setMessages(prev => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: "assistant", content: "Sorry, I'm having trouble connecting to my brain right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground neon-glow z-50 hover:scale-110 transition-transform"
      >
        <MessageSquare className="w-6 h-6" />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[400px] h-[500px] glass rounded-3xl border border-primary/20 flex flex-col z-50 shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 border-b border-border bg-primary/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center neon-glow">
                  <Bot className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">CAMPUS AI</h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)} className="h-8 w-8 p-0 rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", 
                    msg.role === "user" ? "bg-secondary" : "bg-primary/20 text-primary"
                  )}>
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div className={cn("p-3 rounded-2xl text-sm max-w-[80%]", 
                    msg.role === "user" ? "bg-primary text-primary-foreground font-medium" : "bg-secondary/50 border border-border"
                  )}>
                    <div className="prose prose-invert prose-sm">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-secondary/50 border border-border p-3 rounded-2xl flex gap-1">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border bg-secondary/20">
              <div className="relative">
                <Input
                  placeholder="Ask me anything..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="pr-12 h-12 rounded-xl bg-background border-border focus:ring-primary"
                />
                <Button 
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-1 top-1 h-10 w-10 p-0 rounded-lg bg-primary text-primary-foreground hover:neon-glow"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[9px] text-center text-muted-foreground mt-2 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" /> Powered by Gemini AI
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
