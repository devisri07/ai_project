import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { Home, BarChart3, MessageCircle, Video, Play, Menu, X, HandHelping, Info, Phone, ChevronDown, Puzzle } from "lucide-react";

import { useAge } from "@/context/AgeContext";

const navItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/parent-dashboard", label: "Parent Dashboard", icon: BarChart3 },
  { to: "/chatbot", label: "AI Chatbot", icon: MessageCircle },
  { to: "/youtube-converter", label: "Video Converter", icon: Video },
  { to: "/suggested-videos", label: "Suggested Videos", icon: Play },
  { to: "/smart-friend", label: "Smart Friend", icon: HandHelping },
];

const Navbar = () => {
  const location = useLocation();
  const { age, setAge, ageGroups } = useAge();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sideOpen, setSideOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <button
            onClick={(e) => {
              e.preventDefault();
              setSideOpen(true);
            }}
            className="rounded-xl p-2 hover:bg-muted"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="hidden font-display text-lg font-bold text-foreground sm:inline">
            BrightBridge
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
          <label className="hidden text-xs font-semibold text-muted-foreground sm:block">Age</label>
          <select
            value={age}
            onChange={(e) => setAge(e.target.value as any)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {ageGroups.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <button
            className="rounded-xl p-2 hover:bg-muted lg:hidden"
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
          className="mt-3 flex flex-col gap-1 pb-2 lg:hidden"
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

      {sideOpen && (
        <div className="fixed inset-0 z-[60]">
          <button
            className="absolute inset-0 bg-black/30"
            onClick={() => setSideOpen(false)}
            aria-label="Close side menu"
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="absolute left-0 top-0 h-full w-72 border-r border-border bg-background p-5 shadow-2xl"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-bold text-foreground">Menu</h2>
              <button
                onClick={() => setSideOpen(false)}
                className="rounded-xl p-2 hover:bg-muted"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <Link
                to="/"
                onClick={() => setSideOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Home size={18} />
                Home
              </Link>

              <div className="rounded-2xl border border-border bg-card px-4 py-4">
                <button
                  onClick={() => setAboutOpen((prev) => !prev)}
                  className="flex w-full items-center justify-between font-semibold text-foreground"
                >
                  <span className="flex items-center gap-3">
                    <Info size={18} />
                    About Us
                  </span>
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${aboutOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {aboutOpen && (
                  <div className="mt-3 space-y-2 pl-8">
                    <Link
                      to="/about-us#vision"
                      onClick={() => setSideOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
                    >
                      Vision
                    </Link>
                    <Link
                      to="/about-us#mission"
                      onClick={() => setSideOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
                    >
                      Mission
                    </Link>
                    <Link
                      to="/about-us#help"
                      onClick={() => setSideOpen(false)}
                      className="block rounded-xl px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-primary/5"
                    >
                      Help
                    </Link>
                  </div>
                )}
              </div>

              <Link
                to="/contact-us"
                onClick={() => setSideOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Phone size={18} />
                Contact Us
              </Link>
              <Link
                to="/activity"
                onClick={() => setSideOpen(false)}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 font-semibold text-foreground transition-colors hover:border-primary hover:bg-primary/5"
              >
                <Puzzle size={18} />
                Activity
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
