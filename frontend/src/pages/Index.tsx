import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ThemeCard from "@/components/ThemeCard";
import VideoGrid from "@/components/VideoGrid";
import { sampleVideos } from "@/data/sampleVideos";
import { useAge } from "@/context/AgeContext";
import { Sparkles, Star, Heart, Zap } from "lucide-react";

const quotes = [
  "Every child is special. Every child can shine. ✨",
  "Different minds create the most beautiful stories. 🌈",
  "Your uniqueness is your superpower. 💫",
];

const floatingIcons = [Sparkles, Star, Heart, Zap, Sparkles, Star];

const Index = () => {
  const navigate = useNavigate();
  const { age } = useAge();
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const handleThemeClick = (theme: string) => {
    navigate(`/scan?theme=${theme}`);
  };

  const filteredVideos = sampleVideos.filter((v) => v.ageGroup === age || v.ageGroup === "All");

  return (
    <div className="min-h-screen overflow-hidden">
      {/* ─── Hero Section ─── */}
      <section className="relative py-16 sm:py-24 px-4 overflow-hidden">
        {/* Animated background blobs */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute top-10 left-[10%] w-72 h-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "hsl(var(--primary))" }}
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 right-[10%] w-80 h-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "hsl(var(--secondary))" }}
            animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-15 blur-3xl"
            style={{ background: "hsl(var(--accent))" }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

        {/* Floating icons */}
        {floatingIcons.map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20"
            style={{ left: `${10 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{ y: [0, -20, 0], rotate: [0, 360] }}
            transition={{ duration: 5 + i, repeat: Infinity, delay: i * 0.5 }}
          >
            <Icon size={20 + i * 4} />
          </motion.div>
        ))}

        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="mb-4"
          >
            <span className="text-6xl sm:text-7xl">🪞</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-4 leading-tight"
          >
            Magic Mirror
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl font-display font-bold text-primary mb-3 max-w-2xl mx-auto"
          >
            {quote}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground font-semibold mb-12"
          >
            Choose a mode to begin your personalized story journey
          </motion.p>

          {/* ─── Theme Cards ─── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
            {[
              { title: "Autism Mode", desc: "Predictable, calm stories with structured flow", icon: "🧩", variant: "autism" as const, theme: "Autism" },
              { title: "ADHD Mode", desc: "Interactive, engaging stories with focus cues", icon: "⚡", variant: "adhd" as const, theme: "ADHD" },
              { title: "Visual Mode", desc: "Audio-rich descriptions with high contrast", icon: "👁️", variant: "visual" as const, theme: "Visual" },
              { title: "Hearing Mode", desc: "Subtitle-focused with visual sound indicators", icon: "👂", variant: "hearing" as const, theme: "Hearing" },
            ].map((card, i) => (
              <motion.div
                key={card.theme}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <ThemeCard
                  title={card.title}
                  description={card.desc}
                  icon={card.icon}
                  variant={card.variant}
                  onClick={() => handleThemeClick(card.theme)}
                />
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xs text-muted-foreground"
          >
            Click a mode above → The Magic Mirror will scan & suggest stories for you
          </motion.p>
        </div>
      </section>

      {/* ─── Featured Stories Section ─── */}
      <section className="py-12 px-4 relative">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-10 rounded-full bg-primary" />
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-foreground">
                🎬 Stories for Age {age}
              </h2>
            </div>
            <p className="text-muted-foreground mb-8 ml-[3.25rem]">
              {filteredVideos.length} curated stories matched to your age group
            </p>
          </motion.div>
          <VideoGrid videos={filteredVideos} />
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-display text-2xl sm:text-3xl font-bold text-foreground text-center mb-12"
          >
            ✨ How Magic Mirror Works
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", emoji: "🎯", title: "Pick a Mode", desc: "Choose the mode that fits best" },
              { step: "2", emoji: "📸", title: "Face Scan", desc: "AI detects your emotion & attention" },
              { step: "3", emoji: "📖", title: "Enjoy Stories", desc: "Get personalized, adaptive stories" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6 text-center relative overflow-hidden group"
              >
                <div className="absolute -top-4 -right-4 text-7xl font-bold text-primary/5 font-display group-hover:text-primary/10 transition-colors">
                  {item.step}
                </div>
                <div className="text-4xl mb-3">{item.emoji}</div>
                <h3 className="font-display font-bold text-foreground text-lg mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
