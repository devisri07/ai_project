import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const sections = [
  {
    id: "vision",
    question: "What is the vision of BrightBridge?",
    answer:
      "BrightBridge aims to create a safe and supportive digital learning bridge for children with different abilities through emotion-aware stories, guided videos, quizzes, and friendly tools.",
  },
  {
    id: "mission",
    question: "What is the mission of BrightBridge?",
    answer:
      "The mission of BrightBridge is to make learning, emotional support, and storytelling more inclusive for disability students by using AI in a simple and caring way.",
  },
  {
    id: "help",
    question: "How does this website help users?",
    answer:
      "BrightBridge helps users by scanning emotion, selecting suitable stories, showing age-based suggestions, giving a simple quiz, and offering chatbot and Smart Friend support.",
  },
];

const AboutUsPage = () => {
  const location = useLocation();
  const [active, setActive] = useState("vision");

  useEffect(() => {
    const next = location.hash.replace("#", "");
    if (sections.some((section) => section.id === next)) {
      setActive(next);
    }
  }, [location.hash]);

  const current = sections.find((section) => section.id === active) || sections[0];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-display text-3xl font-bold text-foreground"
        >
          About Us
        </motion.h1>
        <p className="mb-8 text-muted-foreground">
          Tap a question to learn about BrightBridge.
        </p>

        <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card p-4">
            <div className="space-y-3">
              {sections.map((section) => {
                const selected = section.id === active;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActive(section.id)}
                    className={`w-full rounded-2xl border px-4 py-4 text-left font-semibold transition-colors ${
                      selected
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-card text-foreground"
                    }`}
                  >
                    {section.question}
                  </button>
                );
              })}
            </div>
          </div>

          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6"
          >
            <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              BrightBridge Information
            </p>
            <h2 className="mb-4 font-display text-2xl font-bold text-foreground">
              {current.question}
            </h2>
            <p className="text-base leading-8 text-muted-foreground">{current.answer}</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;
