import { motion } from "framer-motion";
import VideoGrid from "@/components/VideoGrid";
import { sampleVideos } from "@/data/sampleVideos";
import { useAge } from "@/context/AgeContext";

const SuggestedVideos = () => {
  const { age } = useAge();
  const filteredVideos = sampleVideos.filter((v) => v.ageGroup === age);

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-3xl font-bold text-foreground mb-2"
        >
          🎥 Suggested Videos
        </motion.h1>
        <p className="text-muted-foreground mb-8">
          {filteredVideos.length} curated stories for age group {age}
        </p>
        <VideoGrid videos={filteredVideos} />
      </div>
    </div>
  );
};

export default SuggestedVideos;
