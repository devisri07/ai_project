import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { sendMessageToBackend } from "../services/api";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
}

const ChatbotPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm your Magic Mirror friend 🪞✨ How are you feeling today?",
      sender: "bot",
    },
  ]);

  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    try {
      // 🔥 CALL BACKEND HERE
      const data = await sendMessageToBackend(input);

      const botMsg: Message = {
        id: Date.now() + 1,
        text: data.reply || "Sorry, I couldn't understand that.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 2,
        text: "Server error. Please try again later.",
        sender: "bot",
      };

      setMessages((prev) => [...prev, errorMsg]);
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
          💬 AI Chatbot
        </motion.h1>
        <p className="text-muted-foreground mb-6">
          Your friendly emotion-aware companion
        </p>

        {/* Chat area */}
        <div className="flex-1 glass-card p-4 mb-4 overflow-y-auto max-h-[60vh] space-y-3">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-body ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.text}
              </div>
            </motion.div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input */}
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