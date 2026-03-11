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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement);

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const emotionData = {
  labels: days,
  datasets: [
    { label: "Happy", data: [4, 5, 3, 6, 5, 7, 6], borderColor: "hsl(45, 95%, 60%)", backgroundColor: "hsl(45, 95%, 60%, 0.2)", tension: 0.4 },
    { label: "Calm", data: [5, 4, 6, 4, 5, 4, 5], borderColor: "hsl(200, 60%, 70%)", backgroundColor: "hsl(200, 60%, 70%, 0.2)", tension: 0.4 },
    { label: "Curious", data: [3, 4, 5, 3, 4, 5, 4], borderColor: "hsl(150, 45%, 55%)", backgroundColor: "hsl(150, 45%, 55%, 0.2)", tension: 0.4 },
  ],
};

const attentionData = {
  labels: days,
  datasets: [
    { label: "Attention %", data: [72, 80, 68, 85, 78, 90, 82], backgroundColor: "hsl(210, 70%, 55%, 0.7)", borderRadius: 8 },
  ],
};

const quizData = {
  labels: ["Correct", "Incorrect"],
  datasets: [
    { data: [78, 22], backgroundColor: ["hsl(150, 45%, 55%)", "hsl(0, 60%, 65%)"], borderWidth: 0 },
  ],
};

const ParentDashboard = () => {
  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-foreground mb-2"
        >
          📊 Parent Dashboard
        </motion.h1>
        <p className="text-muted-foreground mb-8">Track your child's engagement and progress</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Emotion History */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-card-foreground">Emotion History</h3>
            <Line data={emotionData} options={{ responsive: true, plugins: { legend: { position: "bottom" } } }} />
          </motion.div>

          {/* Attention Trend */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-card-foreground">Attention Trend</h3>
            <Bar data={attentionData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          </motion.div>

          {/* Quiz Performance */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-card-foreground">Quiz Accuracy</h3>
            <div className="max-w-[200px] mx-auto">
              <Doughnut data={quizData} options={{ plugins: { legend: { position: "bottom" } } }} />
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
            <h3 className="font-display font-bold text-lg mb-4 text-card-foreground">Summary</h3>
            <div className="space-y-4">
              {[
                { label: "Stories Completed", value: "12", icon: "📖" },
                { label: "Avg Attention", value: "79%", icon: "🎯" },
                { label: "Sessions This Week", value: "5", icon: "📅" },
                { label: "Improvement", value: "+15%", icon: "📈" },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center justify-between p-3 rounded-xl bg-muted">
                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span>{stat.icon}</span> {stat.label}
                  </span>
                  <span className="font-display font-bold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
