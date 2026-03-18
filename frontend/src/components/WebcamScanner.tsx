import { motion } from "framer-motion";
import { useRef, useState, useCallback, useEffect } from "react";
import { Camera, Scan, CheckCircle } from "lucide-react";
import { analyzeScan } from "@/services/api";

interface WebcamScannerProps {
  onScanComplete: (result: ScanResult) => void;
  ageGroup?: string;
  sessionToken?: string;
}

export interface ScanResult {
  emotion: string;
  ageGroup: string;
  attentionLevel: number;
}

const emotions = ["Joy", "Sad"];

function normalizeEmotion(raw: string | undefined): string | null {
  if (!raw) return null;
  const value = raw.trim().toLowerCase();
  if (value === "joy") return "Joy";
  if (value === "fear" || value === "sad") return "Sad";
  return null;
}

const WebcamScanner = ({
  onScanComplete,
  ageGroup = "1-10",
  sessionToken,
}: WebcamScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [stage, setStage] = useState<"idle" | "streaming" | "scanning" | "done">("idle");
  const [countdown, setCountdown] = useState(5);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [cameraReady, setCameraReady] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          try {
            await videoRef.current?.play();
          } catch {
            // Ignore autoplay issues; metadata is enough for scanning.
          }
          setCameraReady(true);
          setStage("streaming");
        };
      }
    } catch {
      setCameraReady(false);
      setStage("streaming");
    }
  }, []);

  const startScan = useCallback(() => {
    if (!cameraReady) return;
    setStage("scanning");
    setCountdown(5);
  }, [cameraReady]);

  const waitForVideoReady = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return false;
    if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2) {
      return true;
    }

    return new Promise<boolean>((resolve) => {
      const timeout = window.setTimeout(() => resolve(false), 2500);
      const handleReady = () => {
        window.clearTimeout(timeout);
        resolve(video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= 2);
      };

      video.addEventListener("loadeddata", handleReady, { once: true });
      video.addEventListener("canplay", handleReady, { once: true });
    });
  }, []);

  const captureFrames = useCallback(async (count: number, intervalMs: number) => {
    const frames: string[] = [];
    const video = videoRef.current;
    if (!video) return frames;

    const ready = await waitForVideoReady();
    if (!ready || !video.videoWidth || !video.videoHeight || video.readyState < 2) {
      return frames;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return frames;

    for (let i = 0; i < count; i += 1) {
      ctx.drawImage(video, 0, 0);
      const encoded = canvas.toDataURL("image/jpeg", 0.85);
      if (encoded.startsWith("data:image/jpeg;base64,") && encoded.length > 2000) {
        frames.push(encoded);
      }
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, intervalMs));
      }
    }
    return frames;
  }, [waitForVideoReady]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    if (stage !== "scanning") return;
    if (countdown <= 0) {
      const run = async () => {
        try {
          const frames = await captureFrames(5, 180);
          if (!frames.length) throw new Error("Video frame unavailable");
          const apiResult = await analyzeScan(frames[0], ageGroup, sessionToken, frames);
          console.debug("scan api result", apiResult);
          const normalizedEmotion = normalizeEmotion(apiResult.emotion);
          const parsedResult: ScanResult = {
            emotion: normalizedEmotion || emotions[Math.floor(Math.random() * emotions.length)],
            ageGroup: apiResult.estimated_age_group || ageGroup,
            attentionLevel: Math.round(apiResult.attention_level || 75),
          };
          setResult(parsedResult);
          setStage("done");
          onScanComplete(parsedResult);
        } catch (error) {
          console.error("scan api failed, using fallback", error);
          const fallbackResult: ScanResult = {
            emotion: emotions[Math.floor(Math.random() * emotions.length)],
            ageGroup,
            attentionLevel: Math.floor(Math.random() * 30) + 70,
          };
          setResult(fallbackResult);
          setStage("done");
          onScanComplete(fallbackResult);
        }
      };
      run();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [stage, countdown, onScanComplete, ageGroup, sessionToken, captureFrames]);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        {stage === "scanning" && (
          <div className="absolute inset-0 rounded-full animate-pulse_ring border-4 border-primary/40" />
        )}
        <div className="webcam-ring w-64 h-64 sm:w-72 sm:h-72 overflow-hidden relative bg-muted flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover rounded-full"
          />
          {stage === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-full">
              <Camera size={48} className="text-muted-foreground mb-2" />
              <span className="text-sm text-muted-foreground font-semibold">Camera Off</span>
            </div>
          )}
          {stage === "scanning" && (
            <div className="absolute inset-0 flex items-center justify-center bg-primary/10 rounded-full">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              >
                <Scan size={48} className="text-primary" />
              </motion.div>
              <span className="absolute bottom-16 text-3xl font-display font-bold text-primary">
                {countdown}
              </span>
            </div>
          )}
          {stage === "done" && result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/20 rounded-full">
              <CheckCircle size={40} className="text-accent mb-2" />
              <span className="font-display font-bold text-foreground">{result.emotion}</span>
              <span className="text-xs text-muted-foreground">Attention: {result.attentionLevel}%</span>
            </div>
          )}
        </div>
      </div>

      {stage === "idle" && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startCamera}
          className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-display font-bold text-lg shadow-lg"
        >
          Start Camera
        </motion.button>
      )}
      {stage === "streaming" && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={startScan}
          disabled={!cameraReady}
          className="px-8 py-3 rounded-2xl bg-accent text-accent-foreground font-display font-bold text-lg shadow-lg"
        >
          {cameraReady ? "Scan My Face" : "Preparing Camera..."}
        </motion.button>
      )}
      {stage === "done" && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setStage("streaming");
            setResult(null);
            setCameraReady(Boolean(videoRef.current?.videoWidth));
          }}
          className="px-8 py-3 rounded-2xl bg-secondary text-secondary-foreground font-display font-bold text-lg shadow-lg"
        >
          Scan Again
        </motion.button>
      )}
    </div>
  );
};

export default WebcamScanner;
