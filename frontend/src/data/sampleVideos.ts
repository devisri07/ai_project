import { VideoItem } from "@/components/VideoGrid";

const age1 = "1-10";
const age2 = "10-20";
const age3 = "20-40";
const ageAll = "All";

const normalizeAge = (value: string) => (value || "").replace(/[–—]/g, "-");

const normalizeEmotion = (value: string) => {
  const normalized = (value || "").trim().toLowerCase();
  return normalized === "sad" ? "Sad" : "Joy";
};

const getYouTubeId = (url: string) => {
  const match = url.match(/[?&]v=([^&]+)/i);
  return match ? match[1] : url;
};

const buildQuizQuestions = (
  title: string,
  ageGroup: string,
  emotion: "Joy" | "Sad",
  theme: "Autism" | "ADHD" | "Visual" | "Hearing"
) => {
  const moralLine =
    emotion === "Joy"
      ? "Stay hopeful, kind, and confident."
      : "It is okay to feel sad, and gentle support helps.";
  const goalLine =
    emotion === "Joy"
      ? "help the child feel happy, brave, and interested"
      : "comfort the child and gently support calm feelings";
  const lessonLine =
    theme === "Hearing"
      ? "watch visual cues and read captions carefully"
      : theme === "Visual"
      ? "listen carefully and imagine the scene in the mind"
      : theme === "ADHD"
      ? "stay focused on the main idea step by step"
      : "follow a calm and predictable story flow";
  const supportLine =
    theme === "Hearing"
      ? "large captions and visual understanding"
      : theme === "Visual"
      ? "audio-rich description and clear sound guidance"
      : theme === "ADHD"
      ? "focus markers and short, engaging story pacing"
      : "gentle structure and easy-to-follow scenes";

  return [
    {
      question: "What is the moral of this video?",
      options: [moralLine, "Be worried and give up quickly"] as [string, string],
      correct: 0 as 0,
      explanation: `${title} teaches this message: ${moralLine}`,
    },
    {
      question: "What is the main goal of this video?",
      options: [goalLine, "To confuse the child with many hard ideas"] as [string, string],
      correct: 0 as 0,
      explanation: `${title} is meant to ${goalLine}.`,
    },
    {
      question: "What should the child learn from this video?",
      options: [lessonLine, "To ignore the story and skip the meaning"] as [string, string],
      correct: 0 as 0,
      explanation: `This video is designed to help the child ${lessonLine}.`,
    },
    {
      question: "How does this mode support the video?",
      options: [supportLine, "By removing all guidance and support"] as [string, string],
      correct: 0 as 0,
      explanation: `${theme} mode supports this video with ${supportLine}.`,
    },
  ];
};

const makeVideo = (
  id: string,
  url: string,
  title: string,
  ageGroup: string,
  emotion: "Joy" | "Sad",
  theme: "Autism" | "ADHD" | "Visual" | "Hearing"
): VideoItem => {
  const videoId = getYouTubeId(url);
  return {
    id,
    title,
    url,
    thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    emotion,
    theme,
    ageGroup,
    caption: `${emotion} story for age ${ageGroup}. Captions recommended.`,
    quizQuestions: buildQuizQuestions(title, ageGroup, emotion, theme),
  };
};

export const sampleVideos: VideoItem[] = [
  makeVideo("1", "https://www.youtube.com/watch?v=4BgWg2EAmww", "Joy Story 1", age1, "Joy", "Autism"),
  makeVideo("2", "https://www.youtube.com/watch?v=0GQ1T1l3CvI", "Joy Story 2", age1, "Joy", "Autism"),
  makeVideo("3", "https://www.youtube.com/watch?v=xbyEP0M9w7k", "Joy Story 3", age1, "Joy", "Autism"),
  makeVideo("4", "https://www.youtube.com/watch?v=HFMtfBbJxjI", "Joy Story 4", age1, "Joy", "Autism"),
  makeVideo("5", "https://www.youtube.com/watch?v=difvQyWFmxw", "Joy Story 5", age1, "Joy", "Autism"),
  makeVideo("6", "https://www.youtube.com/watch?v=Nczp6WNR7I4", "Joy Story 6", age1, "Joy", "Autism"),
  makeVideo("7", "https://www.youtube.com/watch?v=NNQWZf1FQyE", "Joy Story 7", age1, "Joy", "Autism"),

  makeVideo("8", "https://www.youtube.com/watch?v=pFDNl874GWk", "Sad Story 1", age1, "Sad", "Autism"),
  makeVideo("9", "https://www.youtube.com/watch?v=UbvfRCcuZLA", "Sad Story 2", age1, "Sad", "Autism"),
  makeVideo("10", "https://www.youtube.com/watch?v=FaoevMkMu1M", "Sad Story 3", age1, "Sad", "Autism"),
  makeVideo("11", "https://www.youtube.com/watch?v=6J6UpxMxG_8", "Sad Story 4", age1, "Sad", "Autism"),
  makeVideo("12", "https://www.youtube.com/watch?v=noUFuAc4K-A", "Sad Story 5", age1, "Sad", "Autism"),

  makeVideo("13", "https://www.youtube.com/watch?v=-belHnGgk9E", "Joy Story 8", age2, "Joy", "ADHD"),
  makeVideo("14", "https://www.youtube.com/watch?v=J3aJgtzvsuA", "Joy Story 9", age2, "Joy", "ADHD"),
  makeVideo("15", "https://www.youtube.com/watch?v=RmhH2uVvxmM", "Joy Story 10", age2, "Joy", "ADHD"),
  makeVideo("16", "https://www.youtube.com/watch?v=GjoYbsvUoO4", "Joy Story 11", age2, "Joy", "ADHD"),
  makeVideo("17", "https://www.youtube.com/watch?v=0dwkGhRPQW4", "Joy Story 12", age2, "Joy", "ADHD"),
  makeVideo("18", "https://www.youtube.com/watch?v=H9YMgx5T9Sk", "Joy Story 13", age2, "Joy", "ADHD"),
  makeVideo("19", "https://www.youtube.com/watch?v=-GEVcgGxgQo", "Joy Story 14", age2, "Joy", "ADHD"),
  makeVideo("20", "https://www.youtube.com/watch?v=b4jxNGl5-p0", "Joy Story 15", age2, "Joy", "ADHD"),
  makeVideo("21", "https://www.youtube.com/watch?v=ysu1JimXY0w", "Joy Story 16", age2, "Joy", "ADHD"),
  makeVideo("22", "https://www.youtube.com/watch?v=UPAkeZBxb0I", "Joy Story 17", age2, "Joy", "ADHD"),

  makeVideo("23", "https://www.youtube.com/watch?v=_mtQ9AEFn9Q", "Sad Story 6", age2, "Sad", "ADHD"),
  makeVideo("24", "https://www.youtube.com/watch?v=W5IjfYQqDbQ", "Sad Story 7", age2, "Sad", "ADHD"),
  makeVideo("25", "https://www.youtube.com/watch?v=0nTjsPJP3VA", "Sad Story 8", age2, "Sad", "ADHD"),
  makeVideo("26", "https://www.youtube.com/watch?v=-JDFStMT3XY", "Sad Story 9", age2, "Sad", "ADHD"),
  makeVideo("27", "https://www.youtube.com/watch?v=72GP8TxRF0Y", "Sad Story 10", age2, "Sad", "ADHD"),

  makeVideo("28", "https://www.youtube.com/watch?v=UX5cgiaEGMQ", "Joy Story 18", age3, "Joy", "Visual"),
  makeVideo("29", "https://www.youtube.com/watch?v=RmhH2uVvxmM", "Joy Story 19", age3, "Joy", "Visual"),
  makeVideo("30", "https://www.youtube.com/watch?v=flPFlY8hECk", "Joy Story 20", age3, "Joy", "Visual"),
  makeVideo("31", "https://www.youtube.com/watch?v=3g0W9OVJSsE", "Joy Story 21", age3, "Joy", "Visual"),
  makeVideo("32", "https://www.youtube.com/watch?v=UOraxP2BPok", "Joy Story 22", age3, "Joy", "Visual"),
  makeVideo("33", "https://www.youtube.com/watch?v=yR354C_Qw8Q", "Joy Story 23", age3, "Joy", "Visual"),
  makeVideo("34", "https://www.youtube.com/watch?v=I6i8cLXPGQE", "Joy Story 24", age3, "Joy", "Visual"),
  makeVideo("35", "https://www.youtube.com/watch?v=9W7KH6LOKkw", "Joy Story 25", age3, "Joy", "Visual"),
  makeVideo("36", "https://www.youtube.com/watch?v=uAwTWAC0vt0", "Joy Story 26", age3, "Joy", "Visual"),
  makeVideo("37", "https://www.youtube.com/watch?v=0iRbD5rM5qc", "Joy Story 27", age3, "Joy", "Visual"),
  makeVideo("38", "https://www.youtube.com/watch?v=JcXKbUIebrU", "Joy Story 28", age3, "Joy", "Visual"),
  makeVideo("39", "https://www.youtube.com/watch?v=g1J4181W8ss", "Joy Story 29", age3, "Joy", "Visual"),
  makeVideo("40", "https://www.youtube.com/watch?v=_j4Lj-BT00g", "Joy Story 30", age3, "Joy", "Visual"),
  makeVideo("41", "https://www.youtube.com/watch?v=bdUqQidffPE", "Joy Story 31", age3, "Joy", "Visual"),

  makeVideo("42", "https://www.youtube.com/watch?v=bmyb_3Ydm2Q", "Sad Story 11", age3, "Sad", "Visual"),
  makeVideo("43", "https://www.youtube.com/watch?v=B0p5SdkBydU", "Sad Story 12", age3, "Sad", "Visual"),
  makeVideo("44", "https://www.youtube.com/watch?v=sVUiCblDvNA", "Sad Story 13", age3, "Sad", "Visual"),
  makeVideo("45", "https://www.youtube.com/watch?v=wo1cyvMNpLg", "Sad Story 14", age3, "Sad", "Visual"),
  makeVideo("46", "https://www.youtube.com/watch?v=Hgk_f9YRmK4", "Sad Story 15", age3, "Sad", "Visual"),

  makeVideo("47", "https://www.youtube.com/watch?v=0dxEAAwEQcA", "Captioned Story 1", ageAll, "Joy", "Hearing"),
  makeVideo("48", "https://www.youtube.com/watch?v=88QcfP6zRIE", "Captioned Story 2", ageAll, "Joy", "Hearing"),
  makeVideo("49", "https://www.youtube.com/watch?v=ysu1JimXY0w", "Captioned Story 3", ageAll, "Joy", "Hearing"),
  makeVideo("50", "https://www.youtube.com/watch?v=CxgZh1CYUzU", "Captioned Story 4", ageAll, "Joy", "Hearing"),
];

const filterVideos = (ageGroup: string, emotion: string, theme: string) => {
  const normalizedEmotion = normalizeEmotion(emotion);
  const normalizedAge = normalizeAge(ageGroup);

  if (theme === "Hearing") {
    return sampleVideos.filter((video) => video.theme === "Hearing");
  }

  const exactMatches = sampleVideos.filter(
    (video) =>
      (normalizeAge(video.ageGroup) === normalizedAge || video.ageGroup === "All") &&
      video.emotion === normalizedEmotion &&
      video.theme === theme
  );

  if (exactMatches.length) {
    return exactMatches;
  }

  return sampleVideos.filter(
    (video) =>
      (normalizeAge(video.ageGroup) === normalizedAge || video.ageGroup === "All") &&
      video.emotion === normalizedEmotion
  );
};

const shuffle = <T,>(items: T[]) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

export const getRecommendedVideos = (ageGroup: string, emotion: string, theme: string) => {
  return shuffle(filterVideos(ageGroup, emotion, theme));
};

export const pickStoryVideo = (ageGroup: string, emotion: string, theme: string) => {
  const list = filterVideos(ageGroup, emotion, theme);
  if (!list.length) return sampleVideos[0];
  const randomIndex = Math.floor(Math.random() * list.length);
  return list[randomIndex] || list[0];
};

export const findVideoByUrl = (url: string) => {
  if (!url) return undefined;
  const targetId = getYouTubeId(url);
  return sampleVideos.find((video) => getYouTubeId(video.url || "") === targetId);
};

export const getVideosByAge = (ageGroup: string) => {
  const normalizedAge = normalizeAge(ageGroup);
  return sampleVideos.filter(
    (video) => normalizeAge(video.ageGroup) === normalizedAge || video.ageGroup === "All"
  );
};
