import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import VideoGrid from "@/components/VideoGrid";
import { getVideosByAge } from "@/data/sampleVideos";
import { useAge } from "@/context/AgeContext";

const normalizeAge = (value: string) => (value || "").replace(/[–—]/g, "-");

const SuggestedVideos = () => {
  const navigate = useNavigate();
  const { age, setAge } = useAge();

  const ageTabs = ["1-10", "10-20", "20-40"];
  const filteredVideos = getVideosByAge(normalizeAge(age));

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-display text-3xl font-bold text-foreground"
        >
          Suggested Videos
        </motion.h1>
        <p className="mb-6 text-muted-foreground">
          Choose an age group to see the matching video library.
        </p>

        <div className="mb-8 flex flex-wrap gap-3">
          {ageTabs.map((tab) => {
            const active = normalizeAge(age) === tab;
            return (
              <button
                key={tab}
                onClick={() => setAge(tab as any)}
                className={`rounded-2xl px-5 py-3 font-bold transition-colors ${
                  active
                    ? "bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-lg"
                    : "bg-card text-foreground border border-border"
                }`}
              >
                Age {tab}
              </button>
            );
          })}
        </div>

        <p className="mb-8 text-sm text-muted-foreground">
          {filteredVideos.length} videos for age group {normalizeAge(age)}
        </p>

        <div className="mb-8">
          <button
            onClick={() => navigate("/smart-friend")}
            className="rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground"
          >
            Next: Smart Friend
          </button>
        </div>

        <VideoGrid videos={filteredVideos} />
      </div>
    </div>
  );
};

export default SuggestedVideos;
