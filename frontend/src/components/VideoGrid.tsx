import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAge } from "@/context/AgeContext";

export interface VideoItem {
  id: string;
  title: string;
  thumbnail: string;
  emotion: string;
  theme: string;
  ageGroup: string;
  url?: string;
  caption?: string;
  quizQuestions?: {
    question: string;
    options: [string, string];
    correct: 0 | 1;
    explanation: string;
  }[];
}

interface VideoGridProps {
  videos: VideoItem[];
  title?: string;
}

const emotionColors: Record<string, string> = {
  Joy: "bg-sunshine text-sunshine-foreground",
  Sad: "bg-muted text-muted-foreground",
  Calm: "bg-calm text-calm-foreground",
  Curious: "bg-accent text-accent-foreground",
  Excited: "bg-warm text-warm-foreground",
  Neutral: "bg-muted text-muted-foreground",
};

const themeColors: Record<string, string> = {
  Autism: "bg-autism text-primary-foreground",
  ADHD: "bg-adhd text-warm-foreground",
  Visual: "bg-visual text-accent-foreground",
  Hearing: "bg-hearing text-secondary-foreground",
};

const VideoGrid = ({ videos, title }: VideoGridProps) => {
  const navigate = useNavigate();
  const { age } = useAge();

  return (
    <div>
      {title && <h2 className="font-display text-2xl font-bold mb-6 text-foreground">{title}</h2>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video, i) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6 }}
            className="glass-card overflow-hidden cursor-pointer group"
            onClick={() => {
              if (video.url) {
                navigate(
                  `/story?theme=${video.theme}&emotion=${video.emotion}&age=${age}&video=${encodeURIComponent(
                    video.url
                  )}`
                );
              }
            }}
          >
            <div className="aspect-video bg-muted relative overflow-hidden">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-primary-foreground text-xl ml-1">▶</span>
                </div>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-display font-bold text-sm mb-2 text-card-foreground line-clamp-2">{video.title}</h3>
              {video.caption && (
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{video.caption}</p>
              )}
              <div className="flex gap-2 flex-wrap">
                <span className={`badge-emotion ${emotionColors[video.emotion] || "bg-muted text-muted-foreground"}`}>
                  {video.emotion}
                </span>
                <span className={`badge-emotion ${themeColors[video.theme] || "bg-muted text-muted-foreground"}`}>
                  {video.theme}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default VideoGrid;
