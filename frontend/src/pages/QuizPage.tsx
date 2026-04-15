import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, Eye, Star, Trophy, XCircle } from "lucide-react";

import { findVideoByUrl } from "@/data/sampleVideos";
import { submitQuiz } from "@/services/api";

interface QuizQuestion {
  question: string;
  options: [string, string];
  correct: 0 | 1;
  explanation: string;
}

const buildVideoQuiz = (
  emotion: string,
  theme: string,
  ageGroup: string
): QuizQuestion[] => [
  {
    question: "What is the moral of this video?",
    options: [
      emotion === "Joy" ? "Stay hopeful and kind." : "It is okay to feel sad and ask for support.",
      "Be confused and give up.",
    ],
    correct: 0,
    explanation:
      emotion === "Joy"
        ? "This video encourages hope, kindness, and confidence."
        : "This video gently supports calm feelings and comfort.",
  },
  {
    question: "What is the main goal of this video?",
    options: [
      emotion === "Joy"
        ? "To build happy and brave feelings."
        : "To comfort the viewer and reduce stress.",
      "To make the viewer feel lost.",
    ],
    correct: 0,
    explanation:
      emotion === "Joy"
        ? "The main goal is to create a positive and encouraging feeling."
        : "The main goal is to comfort the child and create calm support.",
  },
  {
    question: "What should the child learn from this video?",
    options: [
      theme === "Hearing"
        ? "To follow captions and visual cues."
        : theme === "Visual"
        ? "To listen carefully and imagine the scene."
        : theme === "ADHD"
        ? "To focus on one main idea step by step."
        : "To follow a calm and predictable story flow.",
      "To skip the meaning of the story.",
    ],
    correct: 0,
    explanation: `This video is adapted for ${theme} mode and age group ${ageGroup}.`,
  },
  {
    question: "How does this mode support the video?",
    options: [
      theme === "Hearing"
        ? "With captions and visual support."
        : theme === "Visual"
        ? "With rich audio description."
        : theme === "ADHD"
        ? "With focus cues and short pacing."
        : "With a gentle and easy-to-follow structure.",
      "By removing all support.",
    ],
    correct: 0,
    explanation: `${theme} mode helps the child understand the story more easily.`,
  },
];

const GazeProgress = ({ active, onComplete }: { active: boolean; onComplete: () => void }) => {
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clear();
    setProgress(0);
    setCompleted(false);
  }, [clear]);

  const start = useCallback(() => {
    clear();
    setCompleted(false);
    setProgress(0);
    intervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + 5, 100));
    }, 100);
  }, [clear]);

  useEffect(() => {
    if (active) start();
    else stop();
    return () => stop();
  }, [active, start, stop]);

  useEffect(() => {
    if (!active || progress < 100 || completed) return;
    clear();
    setCompleted(true);
    onComplete();
  }, [active, progress, completed, clear, onComplete]);

  if (!active && progress === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 h-1.5 w-full overflow-hidden rounded-b-2xl bg-muted">
      <motion.div className="h-full bg-gradient-to-r from-primary to-secondary" style={{ width: `${progress}%` }} />
    </div>
  );
};

const QuizPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const theme = searchParams.get("theme") || "Autism";
  const emotion = searchParams.get("emotion") || "Joy";
  const ageGroup = searchParams.get("age") || "1-10";
  const videoUrl = searchParams.get("video") || "";
  const sessionToken = searchParams.get("session") || "";
  const storyTitleParam = decodeURIComponent(searchParams.get("story") || "Story");
  const matchedVideo = findVideoByUrl(videoUrl);
  const storyTitle = matchedVideo?.title || storyTitleParam;

  const questions = useMemo(
    () => matchedVideo?.quizQuestions || buildVideoQuiz(emotion, theme, ageGroup),
    [matchedVideo, emotion, theme, ageGroup]
  );

  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<0 | 1 | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);
  const [hoveredOption, setHoveredOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const autoAdvanceRef = useRef<number | null>(null);
  const submitRef = useRef(false);

  const q = questions[currentQ];
  const isCorrect = selected === q.correct;

  const handleSelect = (index: 0 | 1) => {
    if (showResult) return;
    if (autoAdvanceRef.current) {
      window.clearTimeout(autoAdvanceRef.current);
    }
    setSelected(index);
    setShowResult(true);
    setHoveredOption(null);
    const correct = index === q.correct;
    setAnswers((prev) => [...prev, correct]);
    if (correct) {
      setScore((prev) => prev + 1);
    }

    autoAdvanceRef.current = window.setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ((prev) => prev + 1);
        setSelected(null);
        setShowResult(false);
      } else {
        setQuizDone(true);
      }
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) {
        window.clearTimeout(autoAdvanceRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!quizDone || submitRef.current) return;
    submitRef.current = true;
    if (!sessionToken || answers.length === 0) return;

    setSubmitting(true);
    submitQuiz({ session_token: sessionToken, answers })
      .catch(() => null)
      .finally(() => setSubmitting(false));
  }, [quizDone, sessionToken, answers]);

  if (quizDone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-card w-full max-w-lg p-10 text-center"
        >
          <div className="mb-6">
            <Trophy className="mx-auto text-yellow-500" size={78} />
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Quiz Complete</h1>
          <p className="mb-6 text-lg text-muted-foreground">
            You scored {score} out of {questions.length}
          </p>
          {submitting && <p className="mb-4 text-sm text-muted-foreground">Saving quiz result...</p>}
          <div className="mb-6 flex items-center justify-center gap-2">
            {questions.map((_, index) => (
              <Star
                key={index}
                size={28}
                className={index < score ? "fill-yellow-400 text-yellow-400" : "text-muted"}
              />
            ))}
          </div>
          <p className="mb-8 text-lg font-semibold text-foreground">
            {score >= 3 ? "Wonderful. You understood the video very well." : "Nice try. Watch again and you will do even better."}
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => navigate("/suggested-videos")}
              className="rounded-xl bg-gradient-to-r from-primary to-secondary px-6 py-3 font-bold text-primary-foreground"
            >
              More Videos
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-xl bg-muted px-6 py-3 font-bold text-foreground"
            >
              Home
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="mx-auto max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
          <h1 className="mb-2 font-display text-3xl font-bold text-foreground">Video Quiz</h1>
          <p className="text-muted-foreground">{storyTitle}</p>
        </motion.div>

        <div className="mb-6 flex items-center gap-2">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                index < currentQ ? "bg-accent" : index === currentQ ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-sm text-muted-foreground">
          <Eye size={16} className="text-primary" />
          Keep the pointer over A or B for 2 seconds. No click needed.
        </div>

        <motion.div
          key={currentQ}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mx-auto max-w-5xl p-6 sm:p-8"
        >
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Question {currentQ + 1} of {questions.length}
          </p>

          <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_minmax(280px,420px)_1fr]">
            <div className="order-1">
              <div
                className={`relative flex h-full flex-col justify-center rounded-2xl border-2 ${
                  showResult
                    ? q.correct === 0
                      ? "border-accent bg-accent/10"
                      : selected === 0
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card"
                    : hoveredOption === 0
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                } p-5 text-center font-semibold text-foreground transition-colors`}
                onMouseEnter={() => !showResult && setHoveredOption(0)}
                onMouseLeave={() => setHoveredOption(null)}
                onFocus={() => !showResult && setHoveredOption(0)}
                onBlur={() => setHoveredOption(null)}
                onTouchStart={() => handleSelect(0)}
              >
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-base font-bold text-muted-foreground">
                  A
                </span>
                <span className="text-base sm:text-lg">{q.options[0]}</span>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {showResult && q.correct === 0 && <CheckCircle className="text-accent" size={22} />}
                  {showResult && selected === 0 && q.correct !== 0 && <XCircle className="text-destructive" size={22} />}
                </div>
                <GazeProgress active={hoveredOption === 0 && !showResult} onComplete={() => handleSelect(0)} />
              </div>
            </div>

            <div className="order-2 flex items-center">
              <div className="w-full rounded-3xl bg-background/80 px-5 py-8 text-center shadow-inner">
                <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{q.question}</h2>
              </div>
            </div>

            <div className="order-3">
              <div
                className={`relative flex h-full flex-col justify-center rounded-2xl border-2 ${
                  showResult
                    ? q.correct === 1
                      ? "border-accent bg-accent/10"
                      : selected === 1
                      ? "border-destructive bg-destructive/10"
                      : "border-border bg-card"
                    : hoveredOption === 1
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                } p-5 text-center font-semibold text-foreground transition-colors`}
                onMouseEnter={() => !showResult && setHoveredOption(1)}
                onMouseLeave={() => setHoveredOption(null)}
                onFocus={() => !showResult && setHoveredOption(1)}
                onBlur={() => setHoveredOption(null)}
                onTouchStart={() => handleSelect(1)}
              >
                <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-base font-bold text-muted-foreground">
                  B
                </span>
                <span className="text-base sm:text-lg">{q.options[1]}</span>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {showResult && q.correct === 1 && <CheckCircle className="text-accent" size={22} />}
                  {showResult && selected === 1 && q.correct !== 1 && <XCircle className="text-destructive" size={22} />}
                </div>
                <GazeProgress active={hoveredOption === 1 && !showResult} onComplete={() => handleSelect(1)} />
              </div>
            </div>
          </div>
        </motion.div>

        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mx-auto mt-5 max-w-3xl rounded-xl border p-5 text-center ${
              isCorrect ? "border-accent/30 bg-accent/10" : "border-destructive/30 bg-destructive/10"
            }`}
          >
            <p className={`mb-2 text-lg font-bold ${isCorrect ? "text-accent" : "text-destructive"}`}>
              {isCorrect ? "Correct" : "Almost there"}
            </p>
            <p className="text-sm text-muted-foreground">{q.explanation}</p>
            <p className="mt-3 text-xs text-muted-foreground">Moving to the next question automatically...</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
