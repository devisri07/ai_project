import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

import { getParentDashboard } from "@/services/api";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

type ParentDashboardResponse = Awaited<ReturnType<typeof getParentDashboard>>;

const emptyData: ParentDashboardResponse = {
  emotion_history: {},
  emotion_chart: { labels: ["No Data"], values: [1] },
  attention_chart: { labels: ["No Sessions"], values: [0] },
  story_chart: { labels: ["No Stories"], values: [0] },
  quiz_chart: { labels: ["Correct", "Incorrect"], values: [0, 0] },
  attention_trend_average: 0,
  story_completion_rate: 0,
  quiz_accuracy: 0,
  summary: {
    stories_completed: 0,
    avg_attention: 0,
    sessions_count: 0,
    improvement: 0,
    reward_points: 0,
  },
  recommended_improvements: [],
};

const ParentDashboard = () => {
  const [dashboard, setDashboard] = useState<ParentDashboardResponse>(emptyData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const result = await getParentDashboard();
        if (mounted) {
          setDashboard(result);
          setError("");
        }
      } catch {
        if (mounted) {
          setError("Dashboard data could not load right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();
    const timer = window.setInterval(load, 12000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const emotionData = useMemo(
    () => ({
      labels: dashboard.emotion_chart.labels,
      datasets: [
        {
          label: "Emotion Readings",
          data: dashboard.emotion_chart.values,
          borderColor: "hsl(272, 82%, 60%)",
          backgroundColor: "hsla(272, 82%, 60%, 0.18)",
          tension: 0.35,
          fill: true,
        },
      ],
    }),
    [dashboard]
  );

  const attentionData = useMemo(
    () => ({
      labels: dashboard.attention_chart.labels,
      datasets: [
        {
          label: "Attention %",
          data: dashboard.attention_chart.values,
          backgroundColor: "hsla(214, 90%, 57%, 0.7)",
          borderRadius: 10,
        },
      ],
    }),
    [dashboard]
  );

  const quizData = useMemo(
    () => ({
      labels: dashboard.quiz_chart.labels,
      datasets: [
        {
          data: dashboard.quiz_chart.values,
          backgroundColor: ["hsl(142, 71%, 45%)", "hsl(0, 72%, 63%)"],
          borderWidth: 0,
        },
      ],
    }),
    [dashboard]
  );

  const storyData = useMemo(
    () => ({
      labels: dashboard.story_chart.labels,
      datasets: [
        {
          label: "Stories Completed",
          data: dashboard.story_chart.values,
          backgroundColor: "hsla(38, 92%, 50%, 0.75)",
          borderRadius: 10,
        },
      ],
    }),
    [dashboard]
  );

  const stats = [
    { label: "Stories Completed", value: `${dashboard.summary.stories_completed}`, icon: "📚" },
    { label: "Avg Attention", value: `${dashboard.summary.avg_attention}%`, icon: "🎯" },
    { label: "Sessions", value: `${dashboard.summary.sessions_count}`, icon: "🗓️" },
    { label: "Improvement", value: `${dashboard.summary.improvement}%`, icon: "📈" },
    { label: "Quiz Accuracy", value: `${dashboard.quiz_accuracy}%`, icon: "✅" },
    { label: "Reward Points", value: `${dashboard.summary.reward_points}`, icon: "⭐" },
  ];

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Parent Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Live progress updates from story sessions, emotions, attention, and quiz performance.
          </p>
        </motion.div>

        {error && <div className="mb-6 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</div>}

        <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-card p-5"
            >
              <div className="mb-2 text-2xl">{item.icon}</div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="mt-1 font-display text-2xl font-bold text-foreground">{item.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">Emotion History</h3>
            <Line data={emotionData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">Attention Trend</h3>
            <Bar data={attentionData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">Quiz Performance</h3>
            <div className="mx-auto max-w-[220px]">
              <Doughnut data={quizData} options={{ plugins: { legend: { position: "bottom" } } }} />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
            <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">Story Completion</h3>
            <Bar data={storyData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass-card mt-6 p-6">
          <h3 className="mb-4 font-display text-lg font-bold text-card-foreground">Recommended Improvements</h3>
          <div className="space-y-3">
            {(dashboard.recommended_improvements.length ? dashboard.recommended_improvements : ["More session data will appear here after the next story and quiz."]).map((tip) => (
              <div key={tip} className="rounded-2xl bg-background/70 px-4 py-3 text-sm text-foreground">
                {tip}
              </div>
            ))}
          </div>
          {loading && <p className="mt-4 text-sm text-muted-foreground">Refreshing dashboard data...</p>}
        </motion.div>
      </div>
    </div>
  );
};

export default ParentDashboard;
