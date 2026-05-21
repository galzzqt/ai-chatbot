"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "ai/react";
import { Avatar } from "@/components/ui/avatar";
import { AI_MODELS, type AIModel } from "@/lib/ai/models";
import {
  Send,
  Sparkles,
  RefreshCw,
  User,
  Bot,
  Smartphone,
  Scale,
  CreditCard,
  HelpCircle,
  Loader2,
  Sun,
  Moon,
  CheckCircle2,
  Tag,
  Mic,
  ArrowUp,
  ChevronDown,
} from "lucide-react";

// ─── Suggestion chips data ────────────────────────────────────────────────────
const CHIPS = [
  { label: "Cari HP", icon: Smartphone },
  { label: "Bandingkan Spek", icon: Scale },
  { label: "Simulasi Cicilan", icon: CreditCard },
  { label: "Promo Terkini", icon: Tag },
  { label: "Garansi & Kebijakan", icon: HelpCircle },
  { label: "Rekomendasi", icon: Sparkles },
];

// ─── Suggestion full prompts ───────────────────────────────────────────────────
const CHIP_PROMPTS: Record<string, string> = {
  "Cari HP": "Cari HP Oppo terbaru",
  "Bandingkan Spek": "Bandingkan Oppo A6X vs Infinix Note Edge",
  "Simulasi Cicilan": "Hitung cicilan HP harga 4 juta tenor 12 bulan",
  "Promo Terkini": "Ada promo atau diskon apa sekarang di Topsell?",
  "Garansi & Kebijakan": "Bagaimana kebijakan garansi di Topsell?",
  Rekomendasi: "Rekomendasikan HP gaming terbaik budget 3 juta",
};

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState<AIModel>(AI_MODELS[0]);
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat({
    api: "/api/ai/chat",
    body: {
      modelId: selectedModel.id,
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");
  const [syncCount, setSyncCount] = useState<number | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(true);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  }, [input]);

  // WooCommerce Sync Handler — ambil semua halaman
  const handleSync = async () => {
    setSyncStatus("syncing");
    setSyncCount(null);
    try {
      const res = await fetch("/api/sync/products");
      const data = await res.json();
      if (data.success) {
        setSyncStatus("success");
        setSyncCount(data.synced ?? data.total ?? null);
      } else {
        setSyncStatus("error");
      }
    } catch {
      setSyncStatus("error");
    }
    setTimeout(() => setSyncStatus("idle"), 5000);
  };

  const handleSuggestionClick = (text: string) => {
    setInput(text);
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
      }
    }
  };

  // ── Rich-text renderer ──────────────────────────────────────────────────────
  const renderMessageContent = (text: string) => {
    const escapeHTML = (str: string) =>
      str.replace(/[&<>'\"]/g, (tag) =>
        ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[tag] || tag)
      );

    let formatted = escapeHTML(text)
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-red-400">$1</strong>'
      )
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-red-500 hover:text-red-400 underline decoration-red-500/30 underline-offset-2">$1</a>'
      );

    return formatted.split("\n").map((line, idx) => {
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        return (
          <li key={idx} className="ml-4 list-disc my-1 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: line.trim().substring(2) }} />
        );
      }
      const numMatch = line.trim().match(/^(\d+)\.\s(.*)/);
      if (numMatch) {
        return (
          <li key={idx} className="ml-4 list-decimal my-1 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: numMatch[2] }} />
        );
      }
      if (line.trim() === "") return <div key={idx} className="h-2" />;
      return (
        <p key={idx} className="leading-relaxed my-1"
          dangerouslySetInnerHTML={{ __html: line }} />
      );
    });
  };

  const isEmptyChat = messages.length === 0;

  return (
    <div className={darkMode ? "dark" : ""} style={{ height: "100dvh", overflow: "hidden" }}>
      <div className="relative h-full w-full flex flex-col font-sans overflow-hidden transition-colors duration-300"
        style={{ backgroundColor: darkMode ? "#0d0d0d" : "#f5f4f0" }}
      >
        {/* Subtle radial glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div
            style={{
              position: "absolute",
              top: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "600px",
              height: "600px",
              background: darkMode
                ? "radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%)"
                : "radial-gradient(circle, rgba(220,38,38,0.04) 0%, transparent 70%)",
              borderRadius: "50%",
            }}
          />
        </div>

        {/* ── Navbar ── */}
        <header
          className="flex-shrink-0 z-20 flex items-center justify-between px-5 py-3 border-b transition-colors duration-300"
          style={{
            backgroundColor: darkMode ? "rgba(13,13,13,0.85)" : "rgba(245,244,240,0.85)",
            borderColor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.08)",
            backdropFilter: "blur(16px)",
          }}
        >
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 shadow-lg shadow-red-600/30">
              <Bot className="h-4 w-4 text-white" />
              <span
                className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400"
                style={{
                  outline: `2px solid ${darkMode ? "#0d0d0d" : "#f5f4f0"}`,
                  outlineOffset: "0px",
                }}
              />
            </div>
            <span className="font-bold tracking-tight text-sm"
              style={{ color: darkMode ? "#ffffff" : "#111111" }}>
              VIRANDA
            </span>
            <span className="hidden sm:inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border"
              style={{
                backgroundColor: darkMode ? "rgba(220,38,38,0.1)" : "rgba(220,38,38,0.06)",
                borderColor: darkMode ? "rgba(220,38,38,0.2)" : "rgba(220,38,38,0.15)",
                color: darkMode ? "#f87171" : "#dc2626",
              }}>
              TopsellBelanja
            </span>
          </div>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            {/* Sync button */}
            <button
              onClick={handleSync}
              disabled={syncStatus === "syncing"}
              title="Sync Products"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium border transition-all duration-200 hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                color: darkMode ? "#a1a1aa" : "#52525b",
              }}
            >
              {syncStatus === "syncing" ? (
                <><Loader2 className="h-3 w-3 animate-spin text-red-500" /><span className="hidden sm:inline">Syncing semua...</span></>
              ) : syncStatus === "success" ? (
                <><CheckCircle2 className="h-3 w-3 text-emerald-500" /><span className="hidden sm:inline">{syncCount ? `${syncCount} produk ✓` : "Synced!"}</span></>
              ) : syncStatus === "error" ? (
                <><RefreshCw className="h-3 w-3 text-red-400" /><span className="hidden sm:inline text-red-400">Gagal, coba lagi</span></>
              ) : (
                <><RefreshCw className="h-3 w-3 text-red-500" /><span className="hidden sm:inline">Sync Produk</span></>
              )}
            </button>

            {/* Dark/Light toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? "Light mode" : "Dark mode"}
              className="flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-200 hover:opacity-80"
              style={{
                backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              }}
            >
              {darkMode ? (
                <Sun className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Moon className="h-3.5 w-3.5 text-indigo-500" />
              )}
            </button>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 overflow-hidden min-h-0">

          {isEmptyChat ? (
            /* ── Empty / Welcome state ── */
            <div className="flex-1 flex flex-col items-center justify-center gap-8 py-12">
              {/* Headline */}
              <div className="text-center space-y-2">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight"
                  style={{ color: darkMode ? "#ffffff" : "#111111" }}>
                  Ada yang bisa Viranda bantu?
                </h1>
                <p className="text-sm"
                  style={{ color: darkMode ? "#71717a" : "#71717a" }}>
                  AI Shopping Assistant dari TopsellBelanja — cari gadget, bandingkan spek, hitung cicilan.
                </p>
              </div>

              {/* Suggestion Chips */}
              <div className="flex flex-wrap justify-center gap-2.5 max-w-xl">
                {CHIPS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() => handleSuggestionClick(CHIP_PROMPTS[label] ?? label)}
                    className="flex items-center gap-2 rounded-full px-4 py-2 text-sm border font-medium transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                    style={{
                      backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      borderColor: darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
                      color: darkMode ? "#d4d4d8" : "#3f3f46",
                    }}
                  >
                    <Icon className="h-3.5 w-3.5 text-red-500" />
                    {label}
                  </button>
                ))}
              </div>

              {/* Input box (welcome state) */}
              <div className="w-full">
                <InputBox
                  darkMode={darkMode}
                  input={input}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  handleKeyDown={handleKeyDown}
                  isLoading={isLoading}
                  textareaRef={textareaRef}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                />
              </div>
            </div>
          ) : (
            /* ── Chat messages state ── */
            <div className="flex-1 flex flex-col overflow-hidden min-h-0">
              {/* Messages scroll area — ONLY this scrolls */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto py-6 space-y-6 min-h-0"
                style={{ scrollbarWidth: "thin", scrollbarColor: darkMode ? "#27272a transparent" : "#d4d4d8 transparent" }}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {/* Bot icon */}
                    {message.role !== "user" && (
                      <div className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-red-600 to-rose-500">
                        <Bot className="h-4 w-4 text-white" />
                      </div>
                    )}

                    {/* Bubble */}
                    <div
                      className="max-w-[85%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm"
                      style={
                        message.role === "user"
                          ? {
                            background: "linear-gradient(135deg, #dc2626, #e11d48)",
                            color: "#ffffff",
                            borderBottomRightRadius: "4px",
                          }
                          : {
                            backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                            border: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                            color: darkMode ? "#e4e4e7" : "#27272a",
                            borderBottomLeftRadius: "4px",
                          }
                      }
                    >
                      <div className="space-y-1">
                        {message.role === "user" ? (
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                          renderMessageContent(message.content)
                        )}
                      </div>
                    </div>

                    {/* User icon */}
                    {message.role === "user" && (
                      <div
                        className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center border"
                        style={{
                          backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                          borderColor: darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
                        }}
                      >
                        <User className="h-4 w-4" style={{ color: darkMode ? "#a1a1aa" : "#71717a" }} />
                      </div>
                    )}
                  </div>
                ))}

                {/* Typing indicator */}
                {isLoading && (
                  <div className="flex gap-3 justify-start">
                    <div className="flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-red-600 to-rose-500 animate-pulse">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div
                      className="rounded-2xl px-4 py-3 flex items-center gap-1.5"
                      style={{
                        backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                        border: `1px solid ${darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}`,
                        borderBottomLeftRadius: "4px",
                      }}
                    >
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-2 w-2 rounded-full animate-bounce"
                          style={{
                            backgroundColor: darkMode ? "#52525b" : "#a1a1aa",
                            animationDelay: `${delay}ms`,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Input box (chat state) — stays fixed at bottom */}
              <div className="flex-shrink-0 pb-4 pt-2">
                <InputBox
                  darkMode={darkMode}
                  input={input}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  handleKeyDown={handleKeyDown}
                  isLoading={isLoading}
                  textareaRef={textareaRef}
                  selectedModel={selectedModel}
                  setSelectedModel={setSelectedModel}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ─── InputBox component ────────────────────────────────────────────────────────
function InputBox({
  darkMode,
  input,
  handleInputChange,
  handleSubmit,
  handleKeyDown,
  isLoading,
  textareaRef,
  selectedModel,
  setSelectedModel,
}: {
  darkMode: boolean;
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  selectedModel: AIModel;
  setSelectedModel: (model: AIModel) => void;
}) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <form
      onSubmit={handleSubmit}
      className="relative w-full rounded-2xl border overflow-visible transition-all duration-200"
      style={{
        backgroundColor: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
        borderColor: darkMode ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.10)",
        boxShadow: darkMode
          ? "0 0 0 1px rgba(255,255,255,0.04), 0 4px 32px rgba(0,0,0,0.4)"
          : "0 0 0 1px rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Tanya Viranda soal spek HP, cicilan, atau promo..."
        disabled={isLoading}
        rows={1}
        className="w-full resize-none bg-transparent px-5 pt-4 pb-3 text-sm outline-none placeholder-opacity-50 transition-colors duration-200"
        style={{
          color: darkMode ? "#e4e4e7" : "#27272a",
          caretColor: "#dc2626",
          minHeight: "52px",
          maxHeight: "200px",
        }}
      />

      {/* Bottom toolbar */}
      <div className="flex items-center justify-between px-4 pb-3 pt-1">
        {/* Left tools: Gemini Model Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs border font-medium transition-all duration-200 hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
              color: darkMode ? "#a1a1aa" : "#52525b",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 text-red-500" />
            <span>{selectedModel.name}</span>
            <ChevronDown className="h-3 w-3 opacity-60" />
          </button>

          {showDropdown && (
            <div
              className="absolute left-0 bottom-full mb-2 w-64 rounded-xl border shadow-lg z-50 p-1 animate-in fade-in slide-in-from-bottom-2 duration-150"
              style={{
                backgroundColor: darkMode ? "#18181b" : "#ffffff",
                borderColor: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                boxShadow: darkMode
                  ? "0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)"
                  : "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                className="px-2.5 py-1.5 text-[10px] font-semibold tracking-wider uppercase border-b mb-1"
                style={{
                  color: darkMode ? "#a1a1aa" : "#71717a",
                  borderColor: darkMode ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
                }}
              >
                Pilih Model Gemini AI
              </div>
              {AI_MODELS.map((model) => (
                <button
                  key={model.id}
                  type="button"
                  onClick={() => {
                    setSelectedModel(model);
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-all hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  style={{
                    backgroundColor:
                      selectedModel.id === model.id
                        ? darkMode
                          ? "rgba(220,38,38,0.15)"
                          : "rgba(220,38,38,0.08)"
                        : "transparent",
                    color: darkMode ? "#e4e4e7" : "#27272a",
                  }}
                >
                  <Sparkles
                    className={`h-3.5 w-3.5 flex-shrink-0 ${selectedModel.id === model.id ? "text-red-500" : "text-zinc-400 dark:text-zinc-500"
                      }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate flex items-center gap-1.5">
                      {model.name}
                      {model.id === selectedModel.id && (
                        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div
                      className="text-[10px] truncate mt-0.5"
                      style={{ color: darkMode ? "#a1a1aa" : "#71717a" }}
                    >
                      {model.description}
                    </div>
                  </div>
                  {model.isFree && (
                    <span
                      className="flex-shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded"
                      style={{
                        backgroundColor: darkMode ? "rgba(34,197,94,0.15)" : "rgba(34,197,94,0.1)",
                        color: "#22c55e",
                      }}
                    >
                      FREE
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Send button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background:
              !isLoading && input.trim()
                ? "linear-gradient(135deg, #dc2626, #e11d48)"
                : darkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.08)",
            color: !isLoading && input.trim() ? "#ffffff" : darkMode ? "#52525b" : "#a1a1aa",
            boxShadow: !isLoading && input.trim() ? "0 2px 12px rgba(220,38,38,0.35)" : "none",
          }}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ArrowUp className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </form>
  );
}
