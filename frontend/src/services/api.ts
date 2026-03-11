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
  return request<{ reply: string }>("/chat", {
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
  return request<{ status: string; operations: string[] }>("/youtube/customize", {
    method: "POST",
    body: JSON.stringify({ youtube_url, mode }),
  });
}
