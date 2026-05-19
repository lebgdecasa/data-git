"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Sparkles, RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProfileStore, isProfilePopulated } from "@/lib/profile-store";
import {
  generateAssistantResponse,
  getContextualGreeting,
  getQuickPrompts,
} from "@/lib/assistant-engine";

export function Assistant() {
  const pathname = usePathname() || "/";
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const profile = useProfileStore((s) => s.profile);
  const audit = useProfileStore((s) => s.audit);
  const messages = useProfileStore((s) => s.assistantMessages);
  const append = useProfileStore((s) => s.appendAssistantMessage);
  const clear = useProfileStore((s) => s.clearAssistantMessages);

  const populated = isProfilePopulated(profile);

  const ctx = useMemo(
    () => ({ pathname, profile, audit, isProfilePopulated: populated }),
    [pathname, profile, audit, populated],
  );

  const quickPrompts = useMemo(() => getQuickPrompts(ctx), [ctx]);

  // Greeting on first open (if empty history)
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting = getContextualGreeting(ctx);
      append({ role: "assistant", content: greeting });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Auto-scroll on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  // Lock body scroll while open on mobile
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSend = (text?: string) => {
    const message = (text ?? input).trim();
    if (!message) return;
    append({ role: "user", content: message });
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const response = generateAssistantResponse(message, ctx);
      append({ role: "assistant", content: response });
      setTyping(false);
    }, 500 + Math.random() * 400);
  };

  return (
    <>
      {/* Floating launcher */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full",
          "bg-gradient-to-br from-indigo-500 to-purple-600",
          "shadow-lg shadow-indigo-500/40 hover:shadow-indigo-500/60",
          "flex items-center justify-center text-white",
          "transition-all duration-200 hover:scale-105 active:scale-95"
        )}
        aria-label={open ? "Close assistant" : "Open AI assistant"}
      >
        {open ? <X className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        {!open && messages.length === 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-zinc-950" />
          </span>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className={cn(
            "fixed z-40 flex flex-col",
            "bottom-20 right-5 left-5 sm:left-auto",
            "w-auto sm:w-[400px] h-[min(620px,calc(100vh-7rem))]",
            "rounded-2xl border border-white/10 bg-[hsl(240,8%,8%)]/95 backdrop-blur-2xl",
            "shadow-2xl overflow-hidden",
            "fade-up"
          )}
          role="dialog"
          aria-label="AI Assistant"
        >
          {/* Header */}
          <div className="relative px-4 py-3 border-b border-white/[0.08] bg-gradient-to-br from-indigo-600/20 via-purple-600/15 to-transparent">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">ProductTwin Assistant</p>
                <p className="text-[11px] text-zinc-400">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-1" />
                  Always available · {populated ? `working on ${profile.productName}` : "no product loaded"}
                </p>
              </div>
              {messages.length > 0 && (
                <button
                  onClick={clear}
                  className="text-zinc-500 hover:text-zinc-300 transition-colors p-1"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Messages area */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3"
          >
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="h-6 w-6 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">Ask me anything about your product or the platform.</p>
              </div>
            )}
            {messages.map((m) => (
              <Bubble key={m.id} role={m.role} content={m.content} />
            ))}
            {typing && <TypingIndicator />}
          </div>

          {/* Quick prompts */}
          {messages.length < 3 && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap">
              {quickPrompts.slice(0, 4).map((p) => (
                <button
                  key={p}
                  onClick={() => handleSend(p)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-300 hover:bg-white/[0.08] hover:border-white/[0.15] transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/[0.08] bg-white/[0.02]">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2 items-end"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything…"
                className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/30"
                autoFocus
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={cn(
                  "h-9 w-9 rounded-lg flex items-center justify-center transition-all",
                  input.trim()
                    ? "bg-indigo-500 text-white hover:bg-indigo-600 shadow-md shadow-indigo-500/30"
                    : "bg-white/[0.04] text-zinc-600 cursor-not-allowed"
                )}
                aria-label="Send"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </form>
            <p className="text-[10px] text-zinc-600 mt-2 text-center">
              Rule-based · profile-aware · no external API
            </p>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Subcomponents ────────────────────────────────────────────────────────

function Bubble({ role, content }: { role: "user" | "assistant"; content: string }) {
  const isAssistant = role === "assistant";
  return (
    <div className={cn("flex gap-2", isAssistant ? "justify-start" : "justify-end")}>
      {isAssistant && (
        <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0 mt-0.5">
          <Sparkles className="h-3 w-3 text-white" />
        </div>
      )}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
          isAssistant
            ? "bg-white/[0.05] border border-white/[0.08] text-zinc-100 rounded-tl-sm"
            : "bg-gradient-to-br from-indigo-500/30 to-purple-500/20 border border-indigo-500/30 text-white rounded-tr-sm"
        )}
      >
        {content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-2 justify-start">
      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 grid place-items-center shrink-0 mt-0.5">
        <Sparkles className="h-3 w-3 text-white" />
      </div>
      <div className="bg-white/[0.05] border border-white/[0.08] rounded-2xl rounded-tl-sm px-3.5 py-3">
        <div className="dots-loader">
          <span /><span /><span />
        </div>
      </div>
    </div>
  );
}
