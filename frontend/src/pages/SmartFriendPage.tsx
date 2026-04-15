import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Mic, Camera, Sparkles, Volume2 } from "lucide-react";
import { getSmartFriendHelp } from "@/services/api";

const modeOptions = [
  { id: "autism", label: "Autism", hint: "Clear and calm steps" },
  { id: "adhd", label: "ADHD", hint: "Short active steps" },
  { id: "visual", label: "Visual", hint: "Voice-first help" },
  { id: "hearing", label: "Hearing", hint: "Text-first help" },
];

const samplePrompts = [
  "Help me make a paper flower",
  "Show me how to make a paper boat",
  "Help me make a pencil holder",
];

const hearingSupportEmbed =
  "https://www.youtube.com/embed/ws6BR741ios?autoplay=1&controls=1&rel=0&modestbranding=1&playsinline=1&cc_load_policy=1";

const SmartFriendPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [prompt, setPrompt] = useState(samplePrompts[0]);
  const [mode, setMode] = useState("visual");
  const [voiceOn, setVoiceOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const startCamera = async () => {
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraReady(true);
        setCameraError("");
      }
    } catch {
      setCameraReady(false);
      setCameraError("Please allow camera access, then try again.");
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      const current = videoRef.current?.srcObject as MediaStream | null;
      current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (!voiceOn || !result?.voice_text || !("speechSynthesis" in window)) return;
    const utterance = new SpeechSynthesisUtterance(result.voice_text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    return () => window.speechSynthesis.cancel();
  }, [result, voiceOn]);

  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const response = await getSmartFriendHelp(prompt, mode);
      setResult(response);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const titleText = useMemo(() => {
    const selected = modeOptions.find((item) => item.id === mode);
    return selected ? `${selected.label} Smart Friend` : "Smart Friend";
  }, [mode]);

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-display text-3xl font-bold text-foreground"
        >
          Smart Friend
        </motion.h1>
        <p className="mb-8 text-muted-foreground">
          Craft help on the left. Live webcam on the right. Voice help can read the steps aloud.
        </p>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles size={18} className="text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">{titleText}</h2>
            </div>

            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {modeOptions.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setMode(item.id)}
                  className={`rounded-xl border-2 p-4 text-left transition-colors ${
                    mode === item.id ? "border-primary bg-primary/10" : "border-border bg-card"
                  }`}
                >
                  <p className="font-display text-sm font-bold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.hint}</p>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-foreground">Example prompts</label>
              <div className="flex flex-wrap gap-2">
                {samplePrompts.map((item) => (
                  <button
                    key={item}
                    onClick={() => setPrompt(item)}
                    className="rounded-full bg-muted px-4 py-2 text-sm font-medium text-foreground"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-foreground">Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                placeholder="Help me make a paper flower"
                className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="mb-6 flex flex-wrap items-center gap-3">
              <button
                onClick={handleAsk}
                disabled={loading || !prompt.trim()}
                className="rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground disabled:opacity-50"
              >
                {loading ? "Helping..." : "Ask Smart Friend"}
              </button>
              <button
                onClick={() => setVoiceOn((prev) => !prev)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 font-bold ${
                  voiceOn ? "bg-accent text-accent-foreground" : "bg-muted text-foreground"
                }`}
              >
                <Volume2 size={18} /> {voiceOn ? "Voice On" : "Voice Off"}
              </button>
            </div>

            {result && (
              <div className="space-y-4 rounded-2xl border border-border bg-card p-5">
                <div>
                  <p className="font-display text-xl font-bold text-foreground">{result.title}</p>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{result.source || "local"}</p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Materials</p>
                  <div className="flex flex-wrap gap-2">
                    {result.materials?.map((item: string) => (
                      <span key={item} className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-foreground">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-semibold text-foreground">Steps</p>
                  <div className="space-y-2">
                    {result.steps?.map((step: string, index: number) => (
                      <div key={index} className="rounded-xl bg-muted/70 px-4 py-3 text-sm text-foreground">
                        {index + 1}. {step}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-medium text-foreground">
                  {result.encouragement}
                </div>

                {result.voice_text && (
                  <button
                    onClick={() => {
                      if (!("speechSynthesis" in window)) return;
                      const utterance = new SpeechSynthesisUtterance(result.voice_text);
                      utterance.rate = 0.9;
                      window.speechSynthesis.cancel();
                      window.speechSynthesis.speak(utterance);
                    }}
                    className="flex items-center gap-2 rounded-2xl bg-secondary px-5 py-3 font-bold text-secondary-foreground"
                  >
                    <Mic size={18} /> Read Aloud
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="mb-5 flex items-center gap-2">
              <Camera size={18} className="text-primary" />
              <h2 className="font-display text-2xl font-bold text-foreground">
                {mode === "hearing" ? "Hearing Support Video" : "Live Webcam"}
              </h2>
            </div>
            {mode === "hearing" ? (
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                  <iframe
                    src={hearingSupportEmbed}
                    title="Hearing Support Video"
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                  <div className="pointer-events-none absolute bottom-3 right-3 z-10">
                    <div className="rounded-full border border-white/20 bg-black/75 px-4 py-2 text-[10px] font-semibold tracking-[0.3em] text-white shadow-lg backdrop-blur-sm">
                      BRIGHTBRIDGE
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  This support video is shown for hearing mode with captions and visual learning cues.
                </p>
              </div>
            ) : (
              <>
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
                  <video ref={videoRef} autoPlay muted playsInline className="h-full w-full object-cover" />
                  {!cameraReady && (
                    <div className="absolute inset-0 flex items-center justify-center text-center text-sm font-medium text-muted-foreground">
                      {cameraError || "Please allow camera access to see the live view."}
                    </div>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    onClick={startCamera}
                    className="rounded-2xl bg-secondary px-5 py-3 font-bold text-secondary-foreground"
                  >
                    Start Camera
                  </button>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">
                  This webcam is only for live viewing on Smart Friend. It does not run scan detection here.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartFriendPage;
