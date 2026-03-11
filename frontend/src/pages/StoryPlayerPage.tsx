import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAge } from "@/context/AgeContext";
import { sampleVideos } from "@/data/sampleVideos";
import {
  Play, Pause, SkipForward, Volume2, VolumeX, Heart,
  Wind, AlertTriangle, Shield, Sparkles, ArrowRight
} from "lucide-react";

// Story content generator based on age, emotion, theme
const generateStoryContent = (age: string, emotion: string, theme: string) => {
  const stories: Record<string, { title: string; scenes: { text: string; bg: string; emoji: string }[] }> = {
    "1–10": {
      title: "The Magical Garden 🌈",
      scenes: [
        { text: "Once upon a time, in a garden full of rainbow flowers, a little butterfly named Luna woke up...", bg: "from-blue-400 to-purple-400", emoji: "🦋" },
        { text: "Luna fluttered her colorful wings and flew over the sparkling stream where friendly fish waved hello!", bg: "from-cyan-400 to-blue-400", emoji: "🐟" },
        { text: "She met a gentle teddy bear sitting under a big oak tree. 'Will you be my friend?' asked the bear.", bg: "from-green-400 to-emerald-400", emoji: "🧸" },
        { text: "'Of course!' said Luna. They danced together as musical flowers played a sweet melody.", bg: "from-pink-400 to-rose-400", emoji: "🌸" },
        { text: "As the sun set, they promised to meet every day. Luna learned that kindness makes the best friendships! 💖", bg: "from-orange-400 to-yellow-400", emoji: "🌅" },
      ],
    },
    "10–20": {
      title: "The Code Breaker's Quest 🔐",
      scenes: [
        { text: "Maya discovered a mysterious encrypted message in her computer science class. It read: 'Find the hidden lab...'", bg: "from-indigo-500 to-blue-500", emoji: "💻" },
        { text: "Using her problem-solving skills, she decoded the first clue. It led her to the school's old library basement.", bg: "from-purple-500 to-indigo-500", emoji: "📚" },
        { text: "There she found a forgotten robotics lab! Dusty machines blinked to life as she entered.", bg: "from-slate-500 to-gray-500", emoji: "🤖" },
        { text: "She rebuilt the central robot, who revealed it was designed to help students with learning challenges.", bg: "from-teal-500 to-cyan-500", emoji: "⚡" },
        { text: "Maya presented her discovery to the school. Now every student had an AI tutor. She proved that curiosity changes the world!", bg: "from-emerald-500 to-green-500", emoji: "🏆" },
      ],
    },
    "20–40": {
      title: "The Silent Symphony 🎵",
      scenes: [
        { text: "In a bustling city, an artist named Eli had forgotten how to hear the music within. Life had become noise.", bg: "from-gray-600 to-slate-600", emoji: "🏙️" },
        { text: "One morning, a child at the park drew a picture of sound waves. 'Can you see music?' she asked.", bg: "from-amber-500 to-orange-500", emoji: "🎨" },
        { text: "That question haunted Eli. He began painting not what he saw, but what he felt — emotions became colors.", bg: "from-violet-500 to-purple-500", emoji: "🖌️" },
        { text: "His exhibition moved people to tears. Each painting resonated like a song only the heart could hear.", bg: "from-rose-500 to-pink-500", emoji: "🎭" },
        { text: "Eli realized: when we stop and truly feel, we find that life itself is the most beautiful symphony.", bg: "from-sky-500 to-blue-500", emoji: "✨" },
      ],
    },
  };
  return stories[age] || stories["1–10"];
};

const SafetyPauseOverlay = ({ onResume }: { onResume: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-blue-900/95 to-purple-900/95 rounded-2xl"
  >
    <motion.div
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      className="text-8xl mb-8"
    >
      🫧
    </motion.div>
    <Shield className="text-blue-300 mb-4" size={48} />
    <h2 className="font-display text-3xl font-bold text-white mb-4">Safety Pause</h2>
    <p className="text-blue-200 text-center max-w-md mb-6 text-lg">
      Let's take a moment to breathe together. Follow the bubble...
    </p>

    {/* Breathing guide */}
    <motion.div
      className="w-32 h-32 rounded-full border-4 border-blue-300/50 flex items-center justify-center mb-8"
      animate={{ scale: [1, 1.5, 1.5, 1], borderColor: ["rgba(147,197,253,0.5)", "rgba(147,197,253,1)", "rgba(147,197,253,1)", "rgba(147,197,253,0.5)"] }}
      transition={{ duration: 8, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
    >
      <motion.p
        className="text-white font-bold text-lg"
        animate={{ opacity: [1, 1, 0.5, 1] }}
        transition={{ duration: 8, repeat: Infinity, times: [0, 0.3, 0.7, 1] }}
      >
        <Wind className="inline mr-1" size={20} />
        Breathe
      </motion.p>
    </motion.div>

    <motion.button
      onClick={onResume}
      className="px-8 py-3 bg-white/20 hover:bg-white/30 text-white rounded-full font-bold text-lg transition-colors"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      I'm Ready to Continue 💪
    </motion.button>
  </motion.div>
);

const StoryPlayerPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { age } = useAge();
  const theme = searchParams.get("theme") || "Autism";
  const emotion = searchParams.get("emotion") || "Happy";

  const [currentScene, setCurrentScene] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [safetyPause, setSafetyPause] = useState(false);
  const [blinkCount, setBlinkCount] = useState(0);
  const [storyComplete, setStoryComplete] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const story = generateStoryContent(age, emotion, theme);

  // Simulate distress detection (random trigger for demo)
  useEffect(() => {
    if (!isPlaying || safetyPause) return;
    const distressCheck = setInterval(() => {
      const fakeBlink = Math.random();
      if (fakeBlink > 0.92) {
        setBlinkCount((prev) => prev + 1);
      }
    }, 2000);
    return () => clearInterval(distressCheck);
  }, [isPlaying, safetyPause]);

  useEffect(() => {
    if (blinkCount >= 3 && !safetyPause) {
      setSafetyPause(true);
      setIsPlaying(false);
    }
  }, [blinkCount, safetyPause]);

  // Auto-advance scenes
  useEffect(() => {
    if (!isPlaying || safetyPause || storyComplete) return;
    timerRef.current = setTimeout(() => {
      if (currentScene < story.scenes.length - 1) {
        setCurrentScene((prev) => prev + 1);
      } else {
        setStoryComplete(true);
        setIsPlaying(false);
      }
    }, 8000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentScene, isPlaying, safetyPause, storyComplete, story.scenes.length]);

  const handleResumeSafety = () => {
    setSafetyPause(false);
    setBlinkCount(0);
    setIsPlaying(true);
  };

  const handleNext = () => {
    if (currentScene < story.scenes.length - 1) {
      setCurrentScene((prev) => prev + 1);
    } else {
      setStoryComplete(true);
      setIsPlaying(false);
    }
  };

  const scene = story.scenes[currentScene];
  const progress = ((currentScene + 1) / story.scenes.length) * 100;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="text-primary" size={24} />
            <h1 className="font-display text-3xl font-bold text-foreground">{story.title}</h1>
            <Sparkles className="text-primary" size={24} />
          </div>
          <p className="text-muted-foreground">Age: {age} • Theme: {theme} • Mood: {emotion}</p>
        </motion.div>

        {/* Story Player */}
        <motion.div
          className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video mb-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentScene}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -60 }}
              transition={{ duration: 0.6 }}
              className={`absolute inset-0 bg-gradient-to-br ${scene.bg} flex flex-col items-center justify-center p-8 sm:p-12`}
            >
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="text-7xl sm:text-8xl mb-6"
              >
                {scene.emoji}
              </motion.div>
              <p className="text-white text-lg sm:text-2xl font-semibold text-center leading-relaxed max-w-2xl drop-shadow-lg">
                {scene.text}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Safety Pause Overlay */}
          <AnimatePresence>
            {safetyPause && <SafetyPauseOverlay onResume={handleResumeSafety} />}
          </AnimatePresence>

          {/* Distress indicator */}
          {blinkCount >= 2 && !safetyPause && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-4 right-4 bg-destructive/80 text-destructive-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1"
            >
              <AlertTriangle size={14} /> Monitoring...
            </motion.div>
          )}
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-muted rounded-full h-3 mb-4 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <p className="text-center text-sm text-muted-foreground mb-4">
          Scene {currentScene + 1} of {story.scenes.length}
        </p>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg"
            disabled={storyComplete}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleNext}
            className="w-12 h-12 rounded-full bg-muted text-foreground flex items-center justify-center"
            disabled={storyComplete}
          >
            <SkipForward size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsMuted(!isMuted)}
            className="w-12 h-12 rounded-full bg-muted text-foreground flex items-center justify-center"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSafetyPause(true)}
            className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 flex items-center justify-center"
            title="Activate Safety Pause"
          >
            <Shield size={20} />
          </motion.button>
        </div>

        {/* Story Complete → Go to Quiz */}
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
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Story Complete!</h2>
              <p className="text-muted-foreground mb-6">Great job! Let's see how much you remember.</p>
              <div className="flex items-center justify-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/quiz?theme=${theme}&emotion=${emotion}&age=${age}&story=${encodeURIComponent(story.title)}`)}
                  className="px-8 py-4 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-2xl font-bold text-lg shadow-xl flex items-center gap-2"
                >
                  Take the Quiz <ArrowRight size={20} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/suggested-videos`)}
                  className="px-8 py-4 bg-muted text-foreground rounded-2xl font-bold text-lg"
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
