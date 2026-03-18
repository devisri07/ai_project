import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AgeProvider } from "@/context/AgeContext";
import Navbar from "@/components/Navbar";
import Index from "./pages/Index";
import ScanPage from "./pages/ScanPage";
import ParentDashboard from "./pages/ParentDashboard";
import ChatbotPage from "./pages/ChatbotPage";
import YouTubeConverter from "./pages/YouTubeConverter";
import SuggestedVideos from "./pages/SuggestedVideos";
import StoryPlayerPage from "./pages/StoryPlayerPage";
import QuizPage from "./pages/QuizPage";
import SmartFriendPage from "./pages/SmartFriendPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AgeProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/scan" element={<ScanPage />} />
            <Route path="/story" element={<StoryPlayerPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
            <Route path="/chatbot" element={<ChatbotPage />} />
            <Route path="/youtube-converter" element={<YouTubeConverter />} />
            <Route path="/suggested-videos" element={<SuggestedVideos />} />
            <Route path="/smart-friend" element={<SmartFriendPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AgeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
