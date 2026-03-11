import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Home, BarChart3, MessageCircle, Video, Play, Menu, X } from "lucide-react";
import { useAge } from "@/context/AgeContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/parent-dashboard", label: "Parent Dashboard", icon: BarChart3 },
  { to: "/chatbot", label: "AI Chatbot", icon: MessageCircle },
  { to: "/youtube-converter", label: "Video Converter", icon: Video },
  { to: "/suggested-videos", label: "Suggested Videos", icon: Play },
];

const Navbar = () => {
  const location = useLocation();
  const { age, setAge, ageGroups } = useAge();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🪞
          </motion.span>
          <span className="font-display font-bold text-lg text-foreground hidden sm:inline">
            Magic Mirror
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link flex items-center gap-2 ${active ? "nav-link-active" : ""}`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <label className="text-xs font-semibold text-muted-foreground hidden sm:block">Age</label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value as any)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {ageGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-muted"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden mt-3 flex flex-col gap-1 pb-2"
        >
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={`nav-link flex items-center gap-2 ${active ? "nav-link-active" : ""}`}
              >
                <item.icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
