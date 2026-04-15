const BASE_URL = "http://127.0.0.1:5000/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function sendMessageToBackend(message: string, emotion = "joy", mode = "Autism") {
  return request<{ reply: string; source?: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({ message, emotion, mode }),
  });
}

export async function startGuestSession(age_group: string, theme: string) {
  return request<{ session_token: string }>("/session/start", {
    method: "POST",
    body: JSON.stringify({ age_group, theme }),
  });
}

export async function analyzeScan(
  frame_base64: string,
  age_group: string,
  session_token?: string,
  frames_base64?: string[]
) {
  return request<{
    emotion: string;
    estimated_age_group: string;
    attention_level: number;
    blink_rate: number;
    gaze_focus_duration: number;
  }>("/scan/analyze", {
    method: "POST",
    body: JSON.stringify({ frame_base64, frames_base64, age_group, session_token }),
  });
}

export async function generateStory(payload: {
  emotion: string;
  age_group: string;
  theme: string;
  session_token?: string;
  generate_audio?: boolean;
}) {
  return request<{ story: any; audio_path?: string }>("/story/generate", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function completeStory(payload: { session_token?: string; title?: string }) {
  return request<{ status: string; stories_completed: number }>("/story/complete", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function submitQuiz(payload: { session_token?: string; answers: boolean[] }) {
  return request<{ accuracy: number; correct: number; total: number }>("/quiz/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getRecommendations(emotion: string, age_group: string, theme: string) {
  return request<{ items: any[] }>("/recommendations", {
    method: "POST",
    body: JSON.stringify({ emotion, age_group, theme }),
  });
}

export async function customizeYouTube(youtube_url: string, mode: string) {
  return request<{
    status: string;
    operations: string[];
    summary?: string;
    converted_title?: string;
    converted_url?: string;
    converted_video_id?: string;
    converted_start_seconds?: number;
    captions_enabled?: boolean;
    audio_description_enabled?: boolean;
  }>("/youtube/customize", {
    method: "POST",
    body: JSON.stringify({ youtube_url, mode }),
  });
}

export async function getSmartFriendHelp(prompt: string, mode: string) {
  return request<{
    title: string;
    materials: string[];
    steps: string[];
    encouragement: string;
    voice_text: string;
    source?: string;
  }>("/smart-friend/respond", {
    method: "POST",
    body: JSON.stringify({ prompt, mode }),
  });
}

export async function getQuizGazeDirection(frame_base64: string) {
  return request<{ direction: "left" | "right" | "center" }>("/quiz/gaze", {
    method: "POST",
    body: JSON.stringify({ frame_base64 }),
  });
}

export async function getParentDashboard() {
  return request<{
    emotion_history: Record<string, number>;
    emotion_chart: { labels: string[]; values: number[] };
    attention_chart: { labels: string[]; values: number[] };
    story_chart: { labels: string[]; values: number[] };
    quiz_chart: { labels: string[]; values: number[] };
    attention_trend_average: number;
    story_completion_rate: number;
    quiz_accuracy: number;
    summary: {
      stories_completed: number;
      avg_attention: number;
      sessions_count: number;
      improvement: number;
      reward_points: number;
    };
    recommended_improvements: string[];
  }>("/dashboard/parent");
}
