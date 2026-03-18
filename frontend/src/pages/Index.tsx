import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Sparkles, Star, Zap } from "lucide-react";

import ThemeCard from "@/components/ThemeCard";
import VideoGrid from "@/components/VideoGrid";
import { sampleVideos } from "@/data/sampleVideos";
import { useAge } from "@/context/AgeContext";

const quotes = [
  "Every child is special. Every child can shine.",
  "Different minds create the most beautiful stories.",
  "Your uniqueness is your superpower.",
];

const floatingIcons = [Sparkles, Star, Heart, Zap, Sparkles, Star];

const Index = () => {
  const navigate = useNavigate();
  const { age } = useAge();
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  const handleThemeClick = (theme: string) => {
    navigate(`/scan?theme=${theme}`);
  };

  const filteredVideos = sampleVideos.filter((video) => video.ageGroup === age || video.ageGroup === "All");

  return (
    <div className="min-h-screen overflow-hidden">
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute left-[10%] top-10 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "hsl(var(--primary))" }}
            animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 8, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-10 right-[10%] h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "hsl(var(--secondary))" }}
            animate={{ x: [0, -50, 0], y: [0, 40, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 10, repeat: Infinity }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-15 blur-3xl"
            style={{ background: "hsl(var(--accent))" }}
            animate={{ scale: [1, 1.4, 1] }}
            transition={{ duration: 6, repeat: Infinity }}
          />
        </div>

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

        <div className="relative z-10 mx-auto max-w-6xl text-center">
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
            className="mb-4 font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Magic Mirror
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mx-auto mb-3 max-w-2xl font-display text-lg font-bold text-primary sm:text-xl"
          >
            {quote}
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-12 font-semibold text-muted-foreground"
          >
            Choose a mode to begin your personalized story journey
          </motion.p>

          <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Autism Mode",
                desc: "Predictable, calm stories with structured flow",
                icon: "🧩",
                variant: "autism" as const,
                theme: "Autism",
              },
              {
                title: "ADHD Mode",
                desc: "Interactive, engaging stories with focus cues",
                icon: "⚡",
                variant: "adhd" as const,
                theme: "ADHD",
              },
              {
                title: "Visual Mode",
                desc: "Audio-rich descriptions with high contrast",
                icon: "👁️",
                variant: "visual" as const,
                theme: "Visual",
              },
              {
                title: "Hearing Mode",
                desc: "Subtitle-focused with visual sound indicators",
                icon: "👂",
                variant: "hearing" as const,
                theme: "Hearing",
              },
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
            Click a mode above and the Magic Mirror will scan and suggest a story for you
          </motion.p>
        </div>
      </section>

      <section className="relative px-4 py-12">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="mb-2 flex items-center gap-3">
              <div className="h-1 w-10 rounded-full bg-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
                Stories for Age {age}
              </h2>
            </div>
            <p className="mb-8 ml-[3.25rem] text-muted-foreground">
              {filteredVideos.length} curated videos for this age group
            </p>
          </motion.div>
          <VideoGrid videos={filteredVideos} />
        </div>
      </section>

      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 text-center font-display text-2xl font-bold text-foreground sm:text-3xl"
          >
            How Magic Mirror Works
          </motion.h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "1", emoji: "🎯", title: "Pick a Mode", desc: "Choose the mode that fits best" },
              { step: "2", emoji: "📸", title: "Face Scan", desc: "AI detects your emotion and attention" },
              { step: "3", emoji: "📖", title: "Enjoy Stories", desc: "Get personalized, adaptive stories" },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card group relative overflow-hidden p-6 text-center"
              >
                <div className="absolute -right-4 -top-4 font-display text-7xl font-bold text-primary/5 transition-colors group-hover:text-primary/10">
                  {item.step}
                </div>
                <div className="mb-3 text-4xl">{item.emoji}</div>
                <h3 className="mb-1 text-lg font-bold text-foreground font-display">{item.title}</h3>
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
