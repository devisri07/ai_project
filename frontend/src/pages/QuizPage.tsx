import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { CheckCircle, XCircle, Star, Trophy, ArrowRight, Eye } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
}

const quizBank: Record<string, QuizQuestion[]> = {
  "1–10": [
    { question: "What was the butterfly's name?", options: ["Luna", "Stella", "Daisy", "Ruby"], correct: 0 },
    { question: "Where did Luna fly over?", options: ["A mountain", "A sparkling stream", "A desert", "A city"], correct: 1 },
    { question: "Who did Luna meet under the oak tree?", options: ["A cat", "A rabbit", "A teddy bear", "A bird"], correct: 2 },
    { question: "What did the flowers do?", options: ["Danced", "Played music", "Grew tall", "Changed color"], correct: 1 },
    { question: "What did Luna learn?", options: ["To fly fast", "Kindness makes best friendships", "To sing", "To paint"], correct: 1 },
  ],
  "10–20": [
    { question: "What did Maya find in her class?", options: ["A robot", "An encrypted message", "A treasure map", "A book"], correct: 1 },
    { question: "Where was the hidden lab?", options: ["Rooftop", "Gym", "Library basement", "Playground"], correct: 2 },
    { question: "What did the robot help with?", options: ["Cooking", "Learning challenges", "Sports", "Music"], correct: 1 },
    { question: "What skill did Maya use?", options: ["Drawing", "Problem-solving", "Running", "Singing"], correct: 1 },
    { question: "What was the result?", options: ["A party", "Every student got an AI tutor", "A vacation", "A new game"], correct: 1 },
  ],
  "20–40": [
    { question: "What was the artist's name?", options: ["Sam", "Alex", "Eli", "Max"], correct: 2 },
    { question: "What had Eli forgotten?", options: ["How to paint", "The music within", "His name", "His home"], correct: 1 },
    { question: "Who inspired Eli?", options: ["A musician", "A teacher", "A child at the park", "A friend"], correct: 2 },
    { question: "What did Eli start painting?", options: ["Landscapes", "What he felt", "Portraits", "Animals"], correct: 1 },
    { question: "What is life compared to?", options: ["A race", "A beautiful symphony", "A puzzle", "A book"], correct: 1 },
  ],
};

const GazeProgress = ({ active, onComplete }: { active: boolean; onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (active) {
      setProgress(0);
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            onComplete();
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    } else {
      setProgress(0);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [active, onComplete]);

  if (!active && progress === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-muted rounded-b-xl overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-primary to-accent"
        style={{ width: `${progress}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  );
};

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const age = searchParams.get("age") || "1–10";
  const theme = searchParams.get("theme") || "Autism";
  const storyTitle = searchParams.get("story") || "Story";

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [stars, setStars] = useState<number[]>([]);

  const questions = quizBank[age] || quizBank["1–10"];
  const q = questions[currentQ];
  const isCorrect = selected === q.correct;

  const handleGazeSelect = (index: number) => {
    if (showResult) return;
    setSelected(index);
    setShowResult(true);
    if (index === q.correct) {
      setScore((prev) => prev + 1);
      setStars((prev) => [...prev, currentQ]);
    }
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
      setShowResult(false);
      setHoveredOption(null);
    } else {
      setQuizDone(true);
    }
  };

  if (quizDone) {
    const percentage = (score / questions.length) * 100;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card p-10 text-center max-w-lg w-full"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.5, repeat: 2 }}
            className="text-7xl mb-6"
          >
            <Trophy className="inline text-yellow-500" size={80} />
          </motion.div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Quiz Complete!</h1>
          <p className="text-muted-foreground mb-6 text-lg">You scored</p>

          <div className="relative w-32 h-32 mx-auto mb-6">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="hsl(var(--muted))" strokeWidth="8" fill="none" />
              <motion.circle
                cx="50" cy="50" r="42" stroke="hsl(var(--primary))" strokeWidth="8" fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 264" }}
                animate={{ strokeDasharray: `${percentage * 2.64} 264` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center font-display text-2xl font-bold text-foreground">
              {score}/{questions.length}
            </span>
          </div>

          {/* Stars */}
          <div className="flex justify-center gap-2 mb-6">
            {questions.map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 }}
              >
                <Star
                  size={28}
                  className={stars.includes(i) ? "text-yellow-400 fill-yellow-400" : "text-muted"}
                />
              </motion.div>
            ))}
          </div>

          <p className="text-foreground font-semibold text-lg mb-8">
            {percentage >= 80
              ? "🌟 Amazing! You're a superstar!"
              : percentage >= 60
              ? "👏 Great effort! Keep going!"
              : "💪 You tried your best! Practice makes perfect!"}
          </p>

          <div className="flex items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/suggested-videos")}
              className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-xl font-bold flex items-center gap-2"
            >
              More Stories <ArrowRight size={18} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-muted text-foreground rounded-xl font-bold"
            >
              Home
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-1">📝 Story Quiz</h1>
          <p className="text-muted-foreground text-sm">{decodeURIComponent(storyTitle)}</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {questions.map((_, i) => (
            <div key={i} className={`flex-1 h-2 rounded-full transition-colors duration-300 ${
              i < currentQ ? "bg-accent" : i === currentQ ? "bg-primary" : "bg-muted"
            }`} />
          ))}
        </div>

        {/* Gaze hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6 bg-muted/50 rounded-full px-4 py-2 mx-auto w-fit"
        >
          <Eye size={16} className="text-primary" />
          <span>Hover an answer for 2 seconds to select — <strong>no click needed!</strong></span>
        </motion.div>

        {/* Question */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card p-6 sm:p-8 mb-6"
        >
          <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">
            Question {currentQ + 1} of {questions.length}
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground mb-6">{q.question}</h2>

          <div className="grid gap-3">
            {q.options.map((option, i) => {
              let borderClass = "border-border";
              let bgClass = "bg-card hover:bg-muted/50";
              if (showResult) {
                if (i === q.correct) { borderClass = "border-accent"; bgClass = "bg-accent/10"; }
                else if (i === selected) { borderClass = "border-destructive"; bgClass = "bg-destructive/10"; }
              } else if (hoveredOption === i) {
                borderClass = "border-primary"; bgClass = "bg-primary/5";
              }

              return (
                <motion.div
                  key={i}
                  className={`relative p-4 rounded-xl border-2 ${borderClass} ${bgClass} cursor-pointer transition-colors font-semibold text-foreground`}
                  whileHover={!showResult ? { scale: 1.02 } : {}}
                  onMouseEnter={() => !showResult && setHoveredOption(i)}
                  onMouseLeave={() => setHoveredOption(null)}
                  onClick={() => handleGazeSelect(i)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span>{option}</span>
                    {showResult && i === q.correct && <CheckCircle className="ml-auto text-accent" size={22} />}
                    {showResult && i === selected && i !== q.correct && <XCircle className="ml-auto text-destructive" size={22} />}
                  </div>
                  <GazeProgress active={hoveredOption === i && !showResult} onComplete={() => handleGazeSelect(i)} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Result feedback */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`p-5 rounded-xl mb-6 text-center ${
                isCorrect
                  ? "bg-accent/10 border border-accent/30"
                  : "bg-destructive/10 border border-destructive/30"
              }`}
            >
              {isCorrect ? (
                <>
                  <motion.div
                    animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl mb-2"
                  >
                    🌟
                  </motion.div>
                  <p className="font-bold text-accent text-lg">Wonderful! That's correct! 🎉</p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-2">💪</div>
                  <p className="font-bold text-destructive mb-1">Not quite, but that's okay!</p>
                  <p className="text-muted-foreground text-sm">
                    The correct answer was: <strong>{q.options[q.correct]}</strong>. You're learning — keep going!
                  </p>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-xl font-bold"
              >
                {currentQ < questions.length - 1 ? "Next Question →" : "See Results 🏆"}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;
