import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Send } from "lucide-react";
import { sendMessageToBackend } from "../services/api";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  source?: string;
}

const ChatbotPage = () => {
  const [searchParams] = useSearchParams();
  const theme = searchParams.get("theme") || "Autism";
  const emotion = (searchParams.get("emotion") || "joy").toLowerCase();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: `Hello, friend. I am your Magic Mirror helper. I can chat with you in ${theme} mode. How are you feeling today?`,
      sender: "bot",
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const userMsg: Message = {
      id: Date.now(),
      text: trimmed,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      const data = await sendMessageToBackend(trimmed, emotion, theme);
      const botMsg: Message = {
        id: Date.now() + 1,
        text: data.reply || "I am here with you.",
        sender: "bot",
        source: data.source || "unknown",
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const fallbackMsg: Message = {
        id: Date.now() + 2,
        text: "I had trouble replying just now. Please try one more time.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col py-6 px-4">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-foreground mb-2"
        >
          AI Chatbot
        </motion.h1>
        <p className="text-muted-foreground mb-6">
          Your friendly emotion-aware companion
        </p>

        <div className="flex-1 glass-card p-4 mb-4 overflow-y-auto max-h-[60vh] space-y-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.text}
                {msg.sender === "bot" && msg.source && (
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                    {msg.source}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>

        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            className="flex-1 rounded-2xl border border-border bg-card px-5 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground"
          >
            <Send size={18} />
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
