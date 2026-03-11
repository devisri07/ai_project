import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import WebcamScanner, { ScanResult } from "@/components/WebcamScanner";
import VideoGrid from "@/components/VideoGrid";
import { sampleVideos } from "@/data/sampleVideos";
import { useAge } from "@/context/AgeContext";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { startGuestSession } from "@/services/api";

const themeLabels: Record<string, { emoji: string; label: string }> = {
  Autism: { emoji: "🧩", label: "Autism Mode" },
  ADHD: { emoji: "⚡", label: "ADHD Mode" },
  Visual: { emoji: "👁️", label: "Visual Mode" },
  Hearing: { emoji: "👂", label: "Hearing Mode" },
};

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = searchParams.get("theme") || "Autism";
  const { age } = useAge();
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const handleScanComplete = useCallback((result: ScanResult) => {
    setScanResult(result);
  }, []);

  useEffect(() => {
    let mounted = true;
    startGuestSession(age.replace("â€“", "-"), theme)
      .then((res) => {
        if (mounted) setSessionToken(res.session_token);
      })
      .catch(() => {
        if (mounted) setSessionToken(null);
      });
    return () => {
      mounted = false;
    };
  }, [age, theme]);

  const info = themeLabels[theme] || themeLabels.Autism;

  const filteredVideos = sampleVideos.filter(
    (v) => v.ageGroup === age && (v.theme === theme || (scanResult && v.emotion === scanResult.emotion))
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden py-12 px-4" style={{ background: `var(--gradient-${theme.toLowerCase()})` }}>
        {/* Floating particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-3 h-3 rounded-full bg-white/20"
            initial={{ x: Math.random() * 100 + "%", y: "110%" }}
            animate={{ y: "-10%", opacity: [0, 1, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.button
            onClick={() => navigate("/")}
            className="absolute left-0 top-0 flex items-center gap-2 text-white/80 hover:text-white font-semibold"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft size={20} /> Back
          </motion.button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="text-6xl mb-4"
          >
            {info.emoji}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl sm:text-4xl font-bold text-white mb-2"
          >
            {info.label}
          </motion.h1>
          <p className="text-white/80 font-semibold">Age Group: {age}</p>
        </div>
      </section>

      {/* Webcam Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="text-primary" size={24} />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Let the Magic Mirror See You
              </h2>
              <Sparkles className="text-primary" size={24} />
            </div>
            <WebcamScanner
              onScanComplete={handleScanComplete}
              ageGroup={age.replace("â€“", "-")}
              sessionToken={sessionToken || undefined}
            />
          </motion.div>
        </div>
      </section>

      {/* Scan Results */}
      <AnimatePresence>
        {scanResult && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-8 px-4"
          >
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-6 mb-8 flex flex-wrap items-center justify-center gap-8">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Emotion</p>
                  <p className="font-display text-2xl font-bold text-foreground">{scanResult.emotion}</p>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Age Group</p>
                  <p className="font-display text-2xl font-bold text-foreground">{scanResult.ageGroup}</p>
                </div>
                <div className="w-px h-12 bg-border hidden sm:block" />
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Attention</p>
                  <p className="font-display text-2xl font-bold text-accent">{scanResult.attentionLevel}%</p>
                </div>
              </div>

              {/* Generate Story Button */}
              <div className="text-center mb-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/story?theme=${theme}&emotion=${scanResult.emotion}&session=${sessionToken || ""}`)}
                  className="px-10 py-5 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl font-bold text-xl shadow-2xl flex items-center gap-3 mx-auto"
                >
                  <Sparkles size={24} />
                  Generate Story
                  <Sparkles size={24} />
                </motion.button>
                <p className="text-muted-foreground text-sm mt-3">An adaptive story will be created based on your emotion & age</p>
              </div>

              <VideoGrid videos={filteredVideos} title="✨ More Stories For You" />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanPage;
