import { motion } from "framer-motion";
import { useState } from "react";
import { Video, Wand2 } from "lucide-react";
import { customizeYouTube } from "@/services/api";

const modes = [
  { id: "autism", label: "Autism Mode", emoji: "🧩", desc: "Reduced flashing, slower transitions" },
  { id: "adhd", label: "ADHD Mode", emoji: "⚡", desc: "Highlight key segments, focus markers" },
  { id: "visual", label: "Visual Impairment", emoji: "👁️", desc: "Audio descriptions, high contrast" },
  { id: "hearing", label: "Hearing Impairment", emoji: "👂", desc: "Large subtitles, visual sound cues" },
];

const YouTubeConverter = () => {
  const [url, setUrl] = useState("");
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [done, setDone] = useState(false);
  const [plan, setPlan] = useState<string[]>([]);

  const handleConvert = async () => {
    if (!url || !selectedMode) return;
    setConverting(true);
    setDone(false);
    try {
      const response = await customizeYouTube(url, selectedMode);
      setPlan(response.operations || []);
      setDone(true);
    } catch {
      setDone(false);
    } finally {
      setConverting(false);
    }
  };

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-foreground mb-2"
        >
          🎬 Video Converter
        </motion.h1>
        <p className="text-muted-foreground mb-8">Transform any YouTube video for accessibility</p>

        <div className="glass-card p-6 mb-6">
          <label className="block text-sm font-semibold text-foreground mb-2">YouTube URL</label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center gap-2 rounded-2xl border border-border bg-card px-4">
              <Video size={18} className="text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 py-3 text-sm text-foreground bg-transparent placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6 mb-6">
          <label className="block text-sm font-semibold text-foreground mb-4">Select Adaptation Mode</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {modes.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMode(mode.id)}
                className={`p-4 rounded-xl border-2 text-left transition-colors ${
                  selectedMode === mode.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-2xl">{mode.emoji}</span>
                <p className="font-display font-bold text-sm text-foreground mt-1">{mode.label}</p>
                <p className="text-xs text-muted-foreground">{mode.desc}</p>
              </motion.button>
            ))}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConvert}
          disabled={!url || !selectedMode || converting}
          className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {converting ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Wand2 size={20} />
              </motion.div>
              Converting...
            </>
          ) : done ? (
            "Conversion Complete"
          ) : (
            <>
              <Wand2 size={20} /> Convert Video
            </>
          )}
        </motion.button>

        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mt-6 text-center"
          >
            <p className="font-display font-bold text-lg text-foreground mb-2">Video Plan Ready</p>
            <p className="text-sm text-muted-foreground">
              Accessibility customization steps were generated successfully.
            </p>
            {plan.length > 0 && (
              <div className="mt-4 text-left max-w-md mx-auto">
                {plan.map((item, idx) => (
                  <p key={idx} className="text-xs text-muted-foreground">
                    - {item}
                  </p>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default YouTubeConverter;
