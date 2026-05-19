"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  User, 
  Bot, 
  Smartphone, 
  Scale, 
  CreditCard, 
  Compass, 
  CheckCircle2, 
  HelpCircle,
  ChevronRight,
  Loader2,
  Sun,
  Moon
} from "lucide-react";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
    api: "/api/ai/chat",
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncCount, setSyncCount] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // WooCommerce Sync Handler
  const handleSync = async () => {
    setSyncStatus("syncing");
    try {
      const res = await fetch("/api/sync/products");
      const data = await res.json();
      if (data.success) {
        setSyncStatus("success");
        setSyncCount(50); // WooCommerce fetch limit in api
      } else {
        setSyncStatus("error");
      }
    } catch (error) {
      setSyncStatus("error");
    }
    setTimeout(() => setSyncStatus("idle"), 5000);
  };

  // Suggestion click handler
  const handleSuggestionClick = (text: string) => {
    setInput(text);
  };

  // Simple Markdown & Format Parser to render rich text beautifully
  const renderMessageContent = (text: string) => {
    // Escape HTML to prevent XSS
    const escapeHTML = (str: string) =>
      str.replace(/[&<>'"]/g, 
        (tag) => 
          ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
          }[tag] || tag)
      );

    const escapedText = escapeHTML(text);

    // 1. Ganti bold **text** dengan strong
    let formatted = escapedText.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-red-500">$1</strong>');
    
    // 2. Format list items
    const lines = formatted.split("\n");
    return lines.map((line, idx) => {
      // Bullet points
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc my-1 leading-relaxed" 
              dangerouslySetInnerHTML={{ __html: line.trim().substring(2) }} />
        );
      }
      // Numbered list
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal my-1 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
        );
      }
      // Empty line / spacer
      if (line.trim() === "") {
        return <div key={idx} className="h-2" />;
      }
      // Default paragraph
      return (
        <p key={idx} className="leading-relaxed my-1" 
           dangerouslySetInnerHTML={{ __html: line }} />
      );
    });
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans overflow-hidden transition-colors duration-300">
        
        {/* Background glowing gradients (only in dark mode for premium look, or soft pink in light mode) */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-red-500/5 dark:bg-red-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/5 dark:bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

        {/* Top Navbar */}
        <header className="sticky top-0 z-10 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-lg shadow-red-600/20">
              <Bot className="h-5 w-5 text-white" />
              <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-slate-950 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-slate-900 dark:text-white text-lg">OLLI AI</span>
                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-600 dark:text-red-400 border border-red-500/20">
                  Official Assistant
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">TopsellBelanja Commerce Bot</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <Button
              onClick={() => setDarkMode(!darkMode)}
              variant="outline"
              className="border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white p-2.5 h-10 w-10 rounded-xl transition-all"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? (
                <Sun className="h-4.5 w-4.5 text-amber-400" />
              ) : (
                <Moon className="h-4.5 w-4.5 text-indigo-600" />
              )}
            </Button>

            {/* Sync WooCommerce Button */}
            <Button 
              onClick={handleSync}
              disabled={syncStatus === "syncing"}
              variant="outline"
              className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs gap-2 py-1.5 h-10 rounded-xl transition-all"
            >
              {syncStatus === "syncing" ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-red-500" />
                  <span className="hidden sm:inline">Syncing...</span>
                </>
              ) : syncStatus === "success" ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span className="hidden sm:inline">Synced!</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5 text-red-500" />
                  <span className="hidden sm:inline">Sync Products</span>
                </>
              )}
            </Button>
          </div>
        </header>

        {/* Main Container */}
        <main className="flex-1 flex w-full max-w-7xl mx-auto px-4 py-6 gap-6 overflow-hidden h-[calc(100vh-73px)]">
          
          {/* Left Sidebar (Helper Guide) - Hidden on smaller screens */}
          <aside className="hidden lg:flex w-80 flex-col gap-4 flex-shrink-0">
            {/* Personality Card */}
            <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 backdrop-blur-sm transition-colors duration-300">
              <CardContent className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-white">
                  <Sparkles className="h-4.5 w-4.5 text-red-500 dark:text-red-400" />
                  Kenalan dengan OLLI
                </div>
                <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                  OLLI adalah AI shopping assistant resmi dari TopsellBelanja. OLLI ngerti banget soal gadget, spek HP, dan simulasi cicilan. Tanyain aja dengan gaya santai!
                </p>
                <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500">WooCommerce DB Cache</span>
                    <span className="text-emerald-650 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" /> Connected
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500">LLM Engine</span>
                    <span className="text-red-500 dark:text-red-400 font-semibold">Gemini 2.5 Flash</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions / Prompts */}
            <Card className="border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/40 backdrop-blur-sm flex-1 flex flex-col overflow-hidden transition-colors duration-300">
              <CardContent className="p-5 flex flex-col gap-3 overflow-y-auto">
                <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-800 dark:text-white mb-1">
                  <Compass className="h-4.5 w-4.5 text-red-500 dark:text-red-400" />
                  Coba Tanya OLLI
                </div>
                
                <div className="flex flex-col gap-2.5 text-xs">
                  <button 
                    onClick={() => handleSuggestionClick("Cari HP Oppo terbaru")}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:border-red-500/30 transition-all text-slate-700 dark:text-slate-300 flex items-start gap-2.5 group"
                  >
                    <Smartphone className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block">Rekomendasi HP</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">"Cari HP Oppo terbaru"</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSuggestionClick("Bandingkan Oppo A6X vs Infinix Note Edge")}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:border-red-500/30 transition-all text-slate-700 dark:text-slate-300 flex items-start gap-2.5 group"
                  >
                    <Scale className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block">Bandingkan Spek</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">"Bandingkan Oppo A6X vs Infinix Note Edge"</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSuggestionClick("Hitung cicilan HP harga 4 juta tenor 12 bulan")}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:border-red-500/30 transition-all text-slate-700 dark:text-slate-300 flex items-start gap-2.5 group"
                  >
                    <CreditCard className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block">Simulasi Cicilan</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">"Hitung cicilan HP harga 4 juta..."</span>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleSuggestionClick("Bagaimana kebijakan garansi di Topsell?")}
                    className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 hover:border-red-500/30 transition-all text-slate-700 dark:text-slate-300 flex items-start gap-2.5 group"
                  >
                    <HelpCircle className="h-4 w-4 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-white block">Kebijakan & FAQ</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">"Kebijakan garansi di Topsell"</span>
                    </div>
                  </button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Right Chat Column */}
          <section className="flex-1 flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/20 backdrop-blur-sm overflow-hidden transition-colors duration-300">
            
            {/* Chat Messages Panel */}
            <div 
              ref={scrollRef} 
              className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-850 scrollbar-track-transparent min-h-0"
            >
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full max-w-lg mx-auto text-center gap-6 py-12">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 shadow-xl shadow-red-600/10">
                    <Bot className="h-8 w-8 text-white animate-bounce" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Halo! OLLI di sini 👋</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      AI Shopping Assistant resmi dari TopsellBelanja. OLLI bisa bantu cari gadget terbaik, compare spesifikasi, hitung simulasi cicilan per bulan, atau jawab pertanyaan kamu seputar toko.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-2">
                    <button 
                      onClick={() => handleSuggestionClick("Cari HP Oppo harga 2 jutaan")}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all text-xs flex items-center justify-between group"
                    >
                      <span className="text-slate-700 dark:text-slate-300">Cari HP Oppo 2 jutaan</span>
                      <ChevronRight className="h-4 w-4 text-slate-450 dark:text-slate-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                    </button>
                    <button 
                      onClick={() => handleSuggestionClick("Hitung cicilan laptop harga 8 juta tenor 6 bulan")}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 text-left transition-all text-xs flex items-center justify-between group"
                    >
                      <span className="text-slate-700 dark:text-slate-300">Hitung cicilan laptop 8jt</span>
                      <ChevronRight className="h-4 w-4 text-slate-450 dark:text-slate-500 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-4 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      {/* Bot Avatar (only on bot messages) */}
                      {message.role !== "user" && (
                        <Avatar className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                          <Bot className="h-4.5 w-4.5 text-red-500" />
                        </Avatar>
                      )}

                      {/* Chat Bubble */}
                      <div
                        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 shadow-sm text-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-red-600 to-rose-600 text-white rounded-br-none"
                            : "bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-200 rounded-bl-none"
                        }`}
                      >
                        <div className="space-y-1">
                          {message.role === "user" ? (
                            <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                          ) : (
                            renderMessageContent(message.content)
                          )}
                        </div>
                      </div>

                      {/* User Avatar (only on user messages) */}
                      {message.role === "user" && (
                        <Avatar className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center flex-shrink-0 transition-colors duration-300">
                          <User className="h-4.5 w-4.5 text-slate-500 dark:text-slate-400" />
                        </Avatar>
                      )}
                    </div>
                  ))}

                  {/* Streaming / Loading Indicator */}
                  {isLoading && (
                    <div className="flex gap-4 justify-start">
                      <Avatar className="h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 flex items-center justify-center flex-shrink-0 animate-pulse transition-colors duration-300">
                        <Bot className="h-4.5 w-4.5 text-red-500" />
                      </Avatar>
                      <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl rounded-bl-none p-4 shadow-sm text-sm text-slate-400 flex items-center gap-2">
                        <span className="flex space-x-1.5 items-center h-4">
                          <span className="block h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-650 animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="block h-2 w-2 rounded-full bg-slate-500 dark:bg-slate-550 animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="block h-2 w-2 rounded-full bg-slate-650 dark:bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Form Input Area */}
            <div className="p-4 bg-slate-100/50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-md transition-colors duration-300">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Tanya OLLI soal spek HP, cicilan, atau promo..."
                  className="flex-1 bg-white dark:bg-slate-900/60 border-slate-250 dark:border-slate-850 hover:border-slate-350 dark:hover:border-slate-800 focus-visible:ring-red-500 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl h-11 text-sm shadow-inner"
                  disabled={isLoading}
                />
                <Button 
                  type="submit" 
                  disabled={isLoading || !input.trim()} 
                  className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl px-5 h-11 shadow-lg shadow-red-600/10 hover:shadow-red-600/20 active:scale-[0.98] transition-all"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>

          </section>

        </main>

      </div>
    </div>
  );
}
