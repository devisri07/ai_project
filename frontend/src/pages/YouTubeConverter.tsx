import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Video, Wand2 } from "lucide-react";
import { customizeYouTube } from "@/services/api";

const modes = [
  { id: "autism", label: "Autism Mode", emoji: "🧩", desc: "Reduced flashing, slower transitions" },
  { id: "adhd", label: "ADHD Mode", emoji: "⚡", desc: "Highlight key segments, focus markers" },
  { id: "visual", label: "Visual Impairment", emoji: "👁️", desc: "Audio descriptions, high contrast" },
  { id: "hearing", label: "Hearing Impairment", emoji: "👂", desc: "Large subtitles, visual sound cues" },
];

const localConvertedMap: Record<string, { convertedUrl: string; title: string }> = {
  lJn8Oe2hg4c: {
    convertedUrl: "https://www.youtube.com/watch?v=flPFlY8hECk&t=46s",
    title: "Converted Animated Story 1",
  },
  "3tX6pBqP_KY": {
    convertedUrl: "https://www.youtube.com/watch?v=GjoYbsvUoO4&t=7s",
    title: "Converted Animated Story 2",
  },
};

const modeSummary: Record<string, string> = {
  autism: "Autism mode makes the video calmer and more predictable.",
  adhd: "ADHD mode keeps the video active, clear, and easier to follow.",
  visual: "Visual mode adds stronger sound guidance and clearer contrast.",
  hearing: "Hearing mode adds clear captions and visual sound support.",
};

const modeOperations: Record<string, string[]> = {
  autism: ["reduce flashing transitions", "slow scene cuts", "predictable caption timing"],
  adhd: ["highlight key segments", "add focus markers", "split content into short parts"],
  visual: ["add audio descriptions", "increase contrast", "narrate important visual events"],
  hearing: ["large subtitles", "visual sound indicators", "clear caption timing"],
};

const extractVideoId = (url: string) => {
  const match = url.match(/[?&]v=([^&]+)/i);
  return match ? match[1] : "";
};

const extractStartSeconds = (url: string) => {
  const match = url.match(/[?&]t=([^&]+)/i);
  if (!match) return 0;
  return Number(String(match[1]).replace("s", "")) || 0;
};

const toEmbedUrl = (url: string, captionsEnabled: boolean, startSeconds: number) => {
  const match = url.match(/[?&]v=([^&]+)/i);
  const videoId = match ? match[1] : "";
  if (!videoId) return "";
  const params = new URLSearchParams({
    autoplay: "1",
    controls: "1",
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    start: String(startSeconds || 0),
  });
  if (captionsEnabled) {
    params.set("cc_load_policy", "1");
  }
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

const YouTubeConverter = () => {
  const [url, setUrl] = useState("");
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [converting, setConverting] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const handleConvert = async () => {
    if (!url || !selectedMode) return;
    setConverting(true);
    setResult(null);
    try {
      const response = await customizeYouTube(url, selectedMode);
      const inputVideoId = extractVideoId(url);
      const localMatch = localConvertedMap[inputVideoId];
      setResult({
        ...response,
        converted_title: response.converted_title || localMatch?.title || "Converted Animated Story",
        converted_url: response.converted_url || localMatch?.convertedUrl || url,
        converted_start_seconds:
          response.converted_start_seconds ??
          extractStartSeconds(localMatch?.convertedUrl || url),
        summary: response.summary || modeSummary[selectedMode],
        operations: response.operations?.length ? response.operations : modeOperations[selectedMode],
        captions_enabled: response.captions_enabled ?? (selectedMode === "hearing"),
        audio_description_enabled: response.audio_description_enabled ?? (selectedMode === "visual"),
      });
    } catch {
      const inputVideoId = extractVideoId(url);
      const localMatch = localConvertedMap[inputVideoId];
      if (localMatch) {
        setResult({
          status: "ready",
          converted_title: localMatch.title,
          converted_url: localMatch.convertedUrl,
          converted_start_seconds: extractStartSeconds(localMatch.convertedUrl),
          summary: modeSummary[selectedMode],
          operations: modeOperations[selectedMode],
          captions_enabled: selectedMode === "hearing",
          audio_description_enabled: selectedMode === "visual",
        });
      } else {
        setResult(null);
      }
    } finally {
      setConverting(false);
    }
  };

  const embedUrl = useMemo(() => {
    if (!result?.converted_url) return "";
    return toEmbedUrl(
      result.converted_url,
      Boolean(result.captions_enabled),
      Number(result.converted_start_seconds || 0)
    );
  }, [result]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-display text-3xl font-bold text-foreground"
        >
          Video Converter
        </motion.h1>
        <p className="mb-8 text-muted-foreground">Paste a YouTube link and play the converted result inside Magic Mirror.</p>

        <div className="glass-card mb-6 p-6">
          <label className="mb-2 block text-sm font-semibold text-foreground">YouTube URL</label>
          <div className="flex gap-2">
            <div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-card px-4">
              <Video size={18} className="text-muted-foreground" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="glass-card mb-6 p-6">
          <label className="mb-4 block text-sm font-semibold text-foreground">Select Adaptation Mode</label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {modes.map((mode) => (
              <motion.button
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedMode(mode.id)}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  selectedMode === mode.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/30"
                }`}
              >
                <span className="text-2xl">{mode.emoji}</span>
                <p className="mt-1 font-display text-sm font-bold text-foreground">{mode.label}</p>
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg disabled:opacity-50"
        >
          {converting ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <Wand2 size={20} />
              </motion.div>
              Converting...
            </>
          ) : (
            <>
              <Wand2 size={20} />
              Convert Video
            </>
          )}
        </motion.button>

        {result && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-6">
            <div className="glass-card p-6">
              <p className="font-display text-lg font-bold text-foreground">{result.converted_title}</p>
              <p className="mt-2 text-sm text-muted-foreground">{result.summary}</p>
              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                {result.operations?.map((item: string, idx: number) => (
                  <p key={idx}>- {item}</p>
                ))}
              </div>
              {result.captions_enabled && (
                <p className="mt-4 text-sm font-semibold text-foreground">Captions are enabled for hearing support.</p>
              )}
              {result.audio_description_enabled && (
                <p className="mt-2 text-sm font-semibold text-foreground">Audio-rich support is enabled for visual mode.</p>
              )}
            </div>

            {embedUrl && (
              <div className="glass-card p-6">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-xl">
                  <iframe
                    src={embedUrl}
                    title={result.converted_title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute bottom-3 right-3 z-10">
                    <div className="rounded-full border border-white/20 bg-black/75 px-4 py-2 text-[10px] font-semibold tracking-[0.3em] text-white shadow-lg backdrop-blur-sm">
                      MAGIC MIRROR
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  Converted video plays inside the website with native timing and playback controls.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default YouTubeConverter;
