import { motion } from "framer-motion";
import { ReactNode } from "react";

interface ThemeCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  variant: "autism" | "adhd" | "visual" | "hearing";
  onClick: () => void;
  selected?: boolean;
}

const ThemeCard = ({ title, description, icon, variant, onClick, selected }: ThemeCardProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`theme-card theme-card-${variant} w-full text-left relative overflow-hidden ${
        selected ? "ring-4 ring-foreground/20 shadow-2xl" : ""
      }`}
    >
      <div className="relative z-10">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="font-display text-xl font-bold mb-1">{title}</h3>
        <p className="text-sm opacity-90 font-body">{description}</p>
      </div>
      {/* Decorative circle */}
      <div className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-white/10" />
    </motion.button>
  );
};

export default ThemeCard;
