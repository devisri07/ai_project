import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";

import WebcamScanner, { ScanResult } from "@/components/WebcamScanner";
import VideoGrid from "@/components/VideoGrid";
import { getRecommendedVideos, pickStoryVideo } from "@/data/sampleVideos";
import { useAge } from "@/context/AgeContext";
import { startGuestSession } from "@/services/api";

const themeLabels: Record<string, { emoji: string; label: string }> = {
  Autism: { emoji: "Puzzle", label: "Autism Mode" },
  ADHD: { emoji: "Flash", label: "ADHD Mode" },
  Visual: { emoji: "Eye", label: "Visual Mode" },
  Hearing: { emoji: "Ear", label: "Hearing Mode" },
};

const normalizeAge = (value: string) => value.replace(/Ã¢â‚¬â€œ|â€“|â€”/g, "-");

const ScanPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const theme = searchParams.get("theme") || "Autism";
  const { age } = useAge();
  const normalizedAge = normalizeAge(age);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);

  const handleScanComplete = useCallback((result: ScanResult) => {
    setScanResult(result);
  }, []);

  useEffect(() => {
    let mounted = true;
    startGuestSession(normalizedAge, theme)
      .then((res) => {
        if (mounted) setSessionToken(res.session_token);
      })
      .catch(() => {
        if (mounted) setSessionToken(null);
      });
    return () => {
      mounted = false;
    };
  }, [normalizedAge, theme]);

  const info = themeLabels[theme] || themeLabels.Autism;

  const filteredVideos = scanResult
    ? getRecommendedVideos(age, scanResult.emotion, theme)
    : getRecommendedVideos(age, "Joy", theme);

  const handleGenerateStory = useCallback(async () => {
    if (!scanResult || isGeneratingStory) return;

    setIsGeneratingStory(true);
    try {
      const chosen = pickStoryVideo(normalizedAge, scanResult.emotion, theme);
      navigate(
        `/story?theme=${encodeURIComponent(theme)}&emotion=${encodeURIComponent(
          scanResult.emotion
        )}&age=${encodeURIComponent(normalizedAge)}&session=${encodeURIComponent(
          sessionToken || ""
        )}&video=${encodeURIComponent(chosen.url || "")}`
      );
    } catch (error) {
      console.error("story selection failed", error);
      const chosen = pickStoryVideo(normalizedAge, scanResult.emotion, theme);
      navigate(
        `/story?theme=${encodeURIComponent(theme)}&emotion=${encodeURIComponent(
          scanResult.emotion
        )}&age=${encodeURIComponent(normalizedAge)}&session=${encodeURIComponent(
          sessionToken || ""
        )}&video=${encodeURIComponent(chosen.url || "")}`
      );
    } finally {
      setIsGeneratingStory(false);
    }
  }, [isGeneratingStory, navigate, normalizedAge, scanResult, sessionToken, theme]);

  return (
    <div className="min-h-screen">
      <section
        className="relative overflow-hidden px-4 py-12"
        style={{ background: `var(--gradient-${theme.toLowerCase()})` }}
      >
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-3 w-3 rounded-full bg-white/20"
            initial={{ x: `${Math.random() * 100}%`, y: "110%" }}
            animate={{ y: "-10%", opacity: [0, 1, 0] }}
            transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.7 }}
          />
        ))}

        <div className="relative z-10 mx-auto max-w-4xl text-center">
          <motion.button
            onClick={() => navigate("/")}
            className="absolute left-0 top-0 flex items-center gap-2 font-semibold text-white/80 hover:text-white"
            whileHover={{ x: -4 }}
          >
            <ArrowLeft size={20} /> Back
          </motion.button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="mb-4 text-6xl"
          >
            {info.emoji}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-2 font-display text-3xl font-bold text-white sm:text-4xl"
          >
            {info.label}
          </motion.h1>
          <p className="font-semibold text-white/80">Age Group: {age}</p>
        </div>
      </section>

      <section className="px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="mb-6 flex items-center justify-center gap-2">
              <Sparkles className="text-primary" size={24} />
              <h2 className="font-display text-2xl font-bold text-foreground">
                Let the Magic Mirror See You
              </h2>
              <Sparkles className="text-primary" size={24} />
            </div>
            <WebcamScanner
              onScanComplete={handleScanComplete}
              ageGroup={normalizedAge}
              sessionToken={sessionToken || undefined}
            />
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {scanResult && (
          <motion.section
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-8"
          >
            <div className="mx-auto max-w-4xl">
              <div className="glass-card mb-8 flex flex-wrap items-center justify-center gap-8 p-6">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Emotion
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {scanResult.emotion}
                  </p>
                </div>
                <div className="hidden h-12 w-px bg-border sm:block" />
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Age Group
                  </p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {scanResult.ageGroup}
                  </p>
                </div>
                <div className="hidden h-12 w-px bg-border sm:block" />
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Attention
                  </p>
                  <p className="font-display text-2xl font-bold text-accent">
                    {scanResult.attentionLevel}%
                  </p>
                </div>
              </div>

              <div className="mb-10 text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateStory}
                  disabled={isGeneratingStory}
                  className="mx-auto flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-secondary px-10 py-5 text-xl font-bold text-primary-foreground shadow-2xl disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Sparkles size={24} />
                  {isGeneratingStory ? "Creating Story..." : "Generate Story"}
                  <Sparkles size={24} />
                </motion.button>
                <p className="mt-3 text-sm text-muted-foreground">
                  We will open the best matched story video for your emotion, age, and theme.
                </p>
              </div>

              <VideoGrid videos={filteredVideos} title="More Stories For You" />
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ScanPage;
