import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useMemo } from "react";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  Volume1,
  VolumeX,
  Wind,
  AlertTriangle,
  Shield,
  Sparkles,
  ArrowRight,
} from "lucide-react";

import { useAge } from "@/context/AgeContext";
import { findVideoByUrl, pickStoryVideo } from "@/data/sampleVideos";
import { toast } from "@/components/ui/sonner";

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface GeneratedStoryScene {
  id?: number;
  title?: string;
  narration?: string;
  subtitle?: string;
  seconds?: number;
}

interface GeneratedStory {
  title?: string;
  scenes?: GeneratedStoryScene[];
}

interface RenderedStoryScene {
  text: string;
  bg: string;
  emoji: string;
  seconds: number;
}

interface RenderedStory {
  title: string;
  scenes: RenderedStoryScene[];
}

const normalizeAge = (value: string) => (value || "1-10").replace(/[–—]/g, "-");

const fallbackVisuals = [
  { bg: "from-sky-500 to-cyan-400", emoji: "✨" },
  { bg: "from-violet-500 to-fuchsia-400", emoji: "📖" },
  { bg: "from-emerald-500 to-teal-400", emoji: "💛" },
  { bg: "from-amber-500 to-orange-400", emoji: "⭐" },
  { bg: "from-rose-500 to-pink-400", emoji: "🌞" },
];

const generateStoryContent = (age: string): RenderedStory => {
  const stories: Record<string, RenderedStory> = {
    "1-10": {
      title: "The Magical Garden",
      scenes: [
        {
          text: "Once upon a time, in a garden full of rainbow flowers, a little butterfly named Luna woke up.",
          bg: "from-blue-400 to-purple-400",
          emoji: "🦋",
          seconds: 8,
        },
        {
          text: "Luna flew over a sparkling stream where friendly fish waved hello and the water shined like glass.",
          bg: "from-cyan-400 to-blue-400",
          emoji: "🐟",
          seconds: 8,
        },
        {
          text: "Under a big oak tree, Luna met a soft teddy bear who asked for a kind friend.",
          bg: "from-green-400 to-emerald-400",
          emoji: "🧸",
          seconds: 8,
        },
        {
          text: "They danced with musical flowers and laughed until the whole garden felt warm and bright.",
          bg: "from-pink-400 to-rose-400",
          emoji: "🌸",
          seconds: 8,
        },
        {
          text: "At sunset, Luna learned that gentle kindness can make a magical friendship grow.",
          bg: "from-orange-400 to-yellow-400",
          emoji: "🌅",
          seconds: 8,
        },
      ],
    },
    "10-20": {
      title: "The Code Breaker's Quest",
      scenes: [
        {
          text: "Maya found a hidden message in class that invited her to solve a mystery beneath the school.",
          bg: "from-indigo-500 to-blue-500",
          emoji: "💻",
          seconds: 8,
        },
        {
          text: "She followed clue after clue until the path led her to an old library basement.",
          bg: "from-purple-500 to-indigo-500",
          emoji: "📚",
          seconds: 8,
        },
        {
          text: "There she discovered a dusty robotics lab that started glowing as soon as she stepped inside.",
          bg: "from-slate-500 to-gray-500",
          emoji: "🤖",
          seconds: 8,
        },
        {
          text: "Maya repaired the central robot and learned it was built to support students with learning challenges.",
          bg: "from-teal-500 to-cyan-500",
          emoji: "⚡",
          seconds: 8,
        },
        {
          text: "Her discovery helped the whole school, proving that problem solving can open doors for everyone.",
          bg: "from-emerald-500 to-green-500",
          emoji: "🏆",
          seconds: 8,
        },
      ],
    },
    "20-40": {
      title: "The Silent Symphony",
      scenes: [
        {
          text: "In a busy city, an artist named Eli felt surrounded by noise and disconnected from what mattered.",
          bg: "from-gray-600 to-slate-600",
          emoji: "🏙️",
          seconds: 8,
        },
        {
          text: "A child at the park asked a simple question about seeing music, and that question stayed with Eli.",
          bg: "from-amber-500 to-orange-500",
          emoji: "🎨",
          seconds: 8,
        },
        {
          text: "He began painting feelings instead of objects, letting color and emotion guide each brush stroke.",
          bg: "from-violet-500 to-purple-500",
          emoji: "🖌️",
          seconds: 8,
        },
        {
          text: "People connected deeply with the paintings because they felt honest, quiet, and full of meaning.",
          bg: "from-rose-500 to-pink-500",
          emoji: "🎭",
          seconds: 8,
        },
        {
          text: "Eli realized that when we slow down and feel fully, life becomes a beautiful symphony again.",
          bg: "from-sky-500 to-blue-500",
          emoji: "✨",
          seconds: 8,
        },
      ],
    },
  };

  return stories[normalizeAge(age)] || stories["1-10"];
};

const buildGeneratedStory = (story: GeneratedStory | null): RenderedStory | null => {
  if (!story?.scenes?.length) return null;

  return {
    title: story.title || "Adaptive Story",
    scenes: story.scenes.map((scene, index) => {
      const visual = fallbackVisuals[index % fallbackVisuals.length];
      return {
        text: scene.subtitle || scene.narration || scene.title || `Scene ${index + 1}`,
        bg: visual.bg,
        emoji: visual.emoji,
        seconds: Math.min(Math.max(scene.seconds || 8, 6), 12),
      };
    }),
  };
};

const SafetyPauseOverlay = ({ onResume }: { onResume: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br from-blue-900/95 to-purple-900/95"
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="mb-8 text-8xl"
    >
      🫧
    </motion.div>
    <Shield className="mb-4 text-blue-300" size={48} />
    <h2 className="mb-4 font-display text-3xl font-bold text-white">Safety Pause</h2>
    <p className="mb-6 max-w-md text-center text-lg text-blue-200">
      Let&apos;s slow down and breathe together for a moment.
    </p>

    <motion.div
      className="mb-8 flex h-32 w-32 items-center justify-center rounded-full border-4 border-blue-300/50"
      animate={{
        scale: [1, 1.5, 1.5, 1],
        borderColor: [
          "rgba(147,197,253,0.5)",
          "rgba(147,197,253,1)",
          "rgba(147,197,253,1)",
          "rgba(147,197,253,0.5)",
        ],
      }}
      transition={{ duration: 8, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
    >
      <motion.p
        className="text-lg font-bold text-white"
        animate={{ opacity: [1, 1, 0.5, 1] }}
        transition={{ duration: 8, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
      >
        <Wind className="mr-1 inline" size={20} />
        Breathe
      </motion.p>
    </motion.div>

    <motion.button
      onClick={onResume}
      className="rounded-full bg-white/20 px-8 py-3 text-lg font-bold text-white transition-colors hover:bg-white/30"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      I&apos;m Ready to Continue
    </motion.button>
  </motion.div>
);

const StoryPlayerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { age } = useAge();

  const selectedAge = normalizeAge(searchParams.get("age") || age);
  const theme = searchParams.get("theme") || "Autism";
  const emotion = searchParams.get("emotion") || "Joy";
  const videoParam = searchParams.get("video") || "";
  const generatedFlag = searchParams.get("generated") === "1";

  const generatedStoryFromState = (
    location.state as { generatedStory?: GeneratedStory } | null
  )?.generatedStory;

  const generatedStoryFromStorage = (() => {
    if (!generatedFlag || typeof window === "undefined") return null;
    try {
      const raw = sessionStorage.getItem("generatedStory");
      return raw ? (JSON.parse(raw) as GeneratedStory) : null;
    } catch {
      return null;
    }
  })();

  const renderedGeneratedStory = buildGeneratedStory(
    generatedStoryFromState || generatedStoryFromStorage
  );

  const selectedVideo = useMemo(
    () => findVideoByUrl(videoParam) || pickStoryVideo(selectedAge, emotion, theme),
    [videoParam, selectedAge, emotion, theme]
  );
  const videoUrl = videoParam || selectedVideo?.url || "";
  const videoIdMatch = videoUrl.match(/[?&]v=([^&]+)/i);
  const videoId = videoIdMatch ? videoIdMatch[1] : "";

  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(70);
  const [videoProgress, setVideoProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [playerReady, setPlayerReady] = useState(false);
  const [safetyPause, setSafetyPause] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [storyComplete, setStoryComplete] = useState(false);
  const [embedError, setEmbedError] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playerRef = useRef<any>(null);

  const isVideoMode = Boolean(videoId) && !renderedGeneratedStory && !embedError;
  const story = renderedGeneratedStory || generateStoryContent(selectedAge);
  const scene = story.scenes[currentScene];
  const progress = ((currentScene + 1) / story.scenes.length) * 100;

  useEffect(() => {
    setCurrentScene(0);
    setStoryComplete(false);
  }, [story.title]);

  useEffect(() => {
    if (isVideoMode || !isPlaying || safetyPause) return;

    const distressCheck = setInterval(() => {
      if (Math.random() > 0.92) {
        setBlinkCount((prev) => prev + 1);
      }
    }, 2000);

    return () => clearInterval(distressCheck);
  }, [isPlaying, safetyPause, isVideoMode]);

  useEffect(() => {
    if (isVideoMode) return;
    if (blinkCount >= 3 && !safetyPause) {
      setSafetyPause(true);
      setIsPlaying(false);
    }
  }, [blinkCount, safetyPause, isVideoMode]);

  useEffect(() => {
    if (isVideoMode || !isPlaying || safetyPause || storyComplete) return;

    timerRef.current = setTimeout(() => {
      if (currentScene < story.scenes.length - 1) {
        setCurrentScene((prev) => prev + 1);
      } else {
        setStoryComplete(true);
        setIsPlaying(false);
      }
    }, (scene?.seconds || 8) * 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentScene, isPlaying, safetyPause, scene?.seconds, storyComplete, story.scenes.length, isVideoMode]);

  useEffect(() => {
    if (!isVideoMode || !videoId) return;

    const ensurePlayer = () => {
      if (!window.YT?.Player || playerRef.current) return;

      playerRef.current = new window.YT.Player("yt-player", {
        videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          cc_load_policy: 1,
          iv_load_policy: 3,
          fs: 1,
          playsinline: 1,
          enablejsapi: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: (event: any) => {
            setPlayerReady(true);
            setTotalTime(event.target.getDuration?.() || 0);
            event.target.setVolume(volume);
            if (isMuted) {
              event.target.mute();
            } else {
              event.target.unMute();
            }
            if (isPlaying) {
              event.target.playVideo();
            }
          },
          onStateChange: (event: any) => {
            if (!window.YT) return;
            if (event.data === window.YT.PlayerState.PLAYING) {
              setPlayerReady(true);
            }
            if (event.data === window.YT.PlayerState.ENDED) {
              setStoryComplete(true);
              setIsPlaying(false);
              setVideoProgress(100);
            }
          },
          onError: () => {
            setEmbedError("This YouTube video could not be played here, so an in-app story is shown instead.");
            setPlayerReady(false);
            if (playerRef.current && typeof playerRef.current.destroy === "function") {
              playerRef.current.destroy();
            }
            playerRef.current = null;
            toast.error("That video could not be embedded. Showing an in-app story instead.");
          },
        },
      });
    };

    if (window.YT?.Player) {
      ensurePlayer();
    } else {
      const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = ensurePlayer;
    }

    return () => {
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        playerRef.current.destroy();
      }
      playerRef.current = null;
      setPlayerReady(false);
    };
  }, [isVideoMode, videoId]);

  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.playVideo !== "function") return;
    if (isPlaying) {
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.mute !== "function") return;
    if (isMuted) {
      playerRef.current.mute();
    } else {
      playerRef.current.unMute();
    }
  }, [isMuted]);

  useEffect(() => {
    if (!playerRef.current || typeof playerRef.current.setVolume !== "function") return;
    playerRef.current.setVolume(volume);
  }, [volume]);

  useEffect(() => {
    if (
      !isVideoMode ||
      !playerReady ||
      !playerRef.current ||
      typeof playerRef.current.getCurrentTime !== "function"
    ) {
      return;
    }

    const timer = setInterval(() => {
      const duration = playerRef.current.getDuration?.() || 0;
      const current = playerRef.current.getCurrentTime?.() || 0;
      setCurrentTime(current);
      setTotalTime(duration);
      if (duration > 0) {
        setVideoProgress(Math.min(100, (current / duration) * 100));
      }
    }, 500);

    return () => clearInterval(timer);
  }, [isVideoMode, playerReady]);

  const formatTime = (seconds: number) => {
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const remainingSeconds = safeSeconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const handleResumeSafety = () => {
    setSafetyPause(false);
    setBlinkCount(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentScene < story.scenes.length - 1) {
      setCurrentScene((prev) => prev + 1);
      return;
    }
    setStoryComplete(true);
    setIsPlaying(false);
  };

  const quizUrl = `/quiz?theme=${encodeURIComponent(theme)}&emotion=${encodeURIComponent(
    emotion
  )}&age=${encodeURIComponent(selectedAge)}&story=${encodeURIComponent(
    isVideoMode ? selectedVideo.title : story.title
  )}&video=${encodeURIComponent(isVideoMode ? videoUrl : "")}`;

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <div className="mb-2 flex items-center justify-center gap-2">
            <Sparkles className="text-primary" size={24} />
            <h1 className="font-display text-3xl font-bold text-foreground">
              {isVideoMode ? selectedVideo.title : story.title}
            </h1>
            <Sparkles className="text-primary" size={24} />
          </div>
          <p className="text-muted-foreground">
            Age: {selectedAge} | Theme: {theme} | Mood: {emotion}
          </p>
        </motion.div>

        <motion.div
          className="relative mb-6 aspect-video overflow-hidden rounded-2xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          {isVideoMode ? (
            <div className="absolute inset-0 bg-black">
              <div id="yt-player" className="h-full w-full" />
              <div className="pointer-events-none absolute bottom-3 right-3 z-20">
                <div className="rounded-full border border-white/20 bg-black/75 px-4 py-2 text-[10px] font-semibold tracking-[0.3em] text-white shadow-lg backdrop-blur-sm">
                  MAGIC MIRROR
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentScene}
                initial={{ opacity: 0, x: 60 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -60 }}
                transition={{ duration: 0.6 }}
                className={`absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br ${scene.bg} p-8 sm:p-12`}
              >
                <motion.div
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="mb-6 text-7xl sm:text-8xl"
                >
                  {scene.emoji}
                </motion.div>
                <p className="max-w-2xl text-center text-lg font-semibold leading-relaxed text-white drop-shadow-lg sm:text-2xl">
                  {scene.text}
                </p>
              </motion.div>
            </AnimatePresence>
          )}

          <AnimatePresence>{safetyPause && <SafetyPauseOverlay onResume={handleResumeSafety} />}</AnimatePresence>

          {blinkCount >= 2 && !safetyPause && !isVideoMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-destructive/80 px-3 py-1 text-xs font-bold text-destructive-foreground"
            >
              <AlertTriangle size={14} /> Monitoring...
            </motion.div>
          )}
        </motion.div>

        {isVideoMode ? (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-muted-foreground">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalTime)}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-red-500" style={{ width: `${videoProgress}%` }} />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4 h-3 w-full overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Scene {currentScene + 1} of {story.scenes.length}
            </p>
          </>
        )}

        <div className="mb-8 flex items-center justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
            disabled={storyComplete}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>

          {!isVideoMode && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleNext}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground"
              disabled={storyComplete}
            >
              <SkipForward size={20} />
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMuted(!isMuted)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground"
            title="Mute or unmute"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsMuted(false);
              setVolume(30);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground"
            title="Low volume"
          >
            <Volume1 size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setIsMuted(false);
              setVolume(100);
            }}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-foreground"
            title="High volume"
          >
            <Volume2 size={20} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSafetyPause(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300"
            title="Activate safety pause"
          >
            <Shield size={20} />
          </motion.button>
        </div>

        {isVideoMode && selectedVideo?.caption && (
          <div className="mb-6 text-center text-sm text-muted-foreground">{selectedVideo.caption}</div>
        )}

        {!isVideoMode && embedError && (
          <div className="mb-6 text-center text-sm text-muted-foreground">{embedError}</div>
        )}

        <AnimatePresence>
          {storyComplete && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="mb-4 text-6xl"
              >
                🎉
              </motion.div>
              <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Story Complete!</h2>
              <p className="mb-6 text-muted-foreground">
                Let&apos;s do 4 quick quiz questions based on this story.
              </p>
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(quizUrl)}
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-8 py-4 text-lg font-bold text-primary-foreground shadow-xl"
                >
                  Take the Quiz <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/suggested-videos")}
                  className="rounded-2xl bg-muted px-8 py-4 text-lg font-bold text-foreground"
                >
                  More Stories
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StoryPlayerPage;
