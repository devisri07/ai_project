import { createContext, useContext, useState, ReactNode } from "react";

const ageGroups = ["1-10", "10-20", "20-40"] as const;
type AgeGroup = typeof ageGroups[number];

interface AgeContextType {
  age: AgeGroup;
  setAge: (age: AgeGroup) => void;
  ageGroups: readonly string[];
}

const AgeContext = createContext<AgeContextType | null>(null);

export const AgeProvider = ({ children }: { children: ReactNode }) => {
  const [age, setAge] = useState<AgeGroup>("1-10");

  return (
    <AgeContext.Provider value={{ age, setAge, ageGroups }}>
      {children}
    </AgeContext.Provider>
  );
};

export const useAge = () => {
  const ctx = useContext(AgeContext);
  if (!ctx) throw new Error("useAge must be used within AgeProvider");
  return ctx;
};
