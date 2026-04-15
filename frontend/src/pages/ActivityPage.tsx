import { motion } from "framer-motion";
import { useMemo, useState } from "react";

type Tile = number | null;

const shuffle = <T,>(items: T[]) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const createPuzzleBoard = () => shuffle<Tile>([1, 2, 3, 4, 5, 6, 7, 8, null]);

const emojiPairs = ["🌟", "🦋", "🎨", "🚀"];

const ActivityPage = () => {
  const [puzzle, setPuzzle] = useState<Tile[]>(createPuzzleBoard());
  const [memoryCards, setMemoryCards] = useState(() =>
    shuffle(
      emojiPairs.flatMap((emoji, index) => [
        { id: `${index}-a`, emoji, matched: false },
        { id: `${index}-b`, emoji, matched: false },
      ])
    )
  );
  const [flipped, setFlipped] = useState<string[]>([]);
  const [memoryScore, setMemoryScore] = useState(0);
  const [focusTarget, setFocusTarget] = useState(() => Math.floor(Math.random() * 6));
  const [focusScore, setFocusScore] = useState(0);

  const puzzleSolved = useMemo(
    () => JSON.stringify(puzzle) === JSON.stringify([1, 2, 3, 4, 5, 6, 7, 8, null]),
    [puzzle]
  );

  const movePuzzleTile = (index: number) => {
    const emptyIndex = puzzle.indexOf(null);
    const allowed = [index - 1, index + 1, index - 3, index + 3];
    if (!allowed.includes(emptyIndex)) return;

    const next = [...puzzle];
    [next[index], next[emptyIndex]] = [next[emptyIndex], next[index]];
    setPuzzle(next);
  };

  const handleFlip = (id: string) => {
    if (flipped.length === 2 || flipped.includes(id)) return;
    const nextFlipped = [...flipped, id];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      const picked = memoryCards.filter((card) => nextFlipped.includes(card.id));
      if (picked[0]?.emoji === picked[1]?.emoji) {
        setMemoryCards((prev) =>
          prev.map((card) =>
            nextFlipped.includes(card.id) ? { ...card, matched: true } : card
          )
        );
        setMemoryScore((prev) => prev + 1);
        setTimeout(() => setFlipped([]), 500);
      } else {
        setTimeout(() => setFlipped([]), 800);
      }
    }
  };

  const hitFocusTarget = (index: number) => {
    if (index === focusTarget) {
      setFocusScore((prev) => prev + 1);
      setFocusTarget(Math.floor(Math.random() * 6));
    }
  };

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-display text-3xl font-bold text-foreground"
        >
          Activity Games
        </motion.h1>
        <p className="mb-8 text-muted-foreground">
          Try three simple and fun activities: image puzzle, memory match, and focus tap.
        </p>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card p-5">
            <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Image Puzzle</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Arrange the tiles into the correct order.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {puzzle.map((tile, index) => (
                <button
                  key={index}
                  onClick={() => tile && movePuzzleTile(index)}
                  className={`flex aspect-square items-center justify-center rounded-2xl text-2xl font-bold ${
                    tile
                      ? "bg-gradient-to-br from-primary to-secondary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  {tile ?? ""}
                </button>
              ))}
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">
              {puzzleSolved ? "Great job. Puzzle solved." : "Tap a tile next to the empty space."}
            </p>
          </div>

          <div className="glass-card p-5">
            <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Memory Match</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Find matching emoji pairs.
            </p>
            <div className="grid grid-cols-4 gap-2">
              {memoryCards.map((card) => {
                const visible = card.matched || flipped.includes(card.id);
                return (
                  <button
                    key={card.id}
                    onClick={() => handleFlip(card.id)}
                    className={`flex aspect-square items-center justify-center rounded-2xl text-2xl ${
                      visible ? "bg-primary/15" : "bg-muted"
                    }`}
                  >
                    {visible ? card.emoji : "?"}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">Pairs found: {memoryScore}</p>
          </div>

          <div className="glass-card p-5">
            <h2 className="mb-2 font-display text-2xl font-bold text-foreground">Focus Tap</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Tap the glowing circle as it moves.
            </p>
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, index) => {
                const active = focusTarget === index;
                return (
                  <button
                    key={index}
                    onClick={() => hitFocusTarget(index)}
                    className={`flex aspect-square items-center justify-center rounded-2xl transition-all ${
                      active
                        ? "scale-105 bg-gradient-to-br from-secondary to-primary text-white shadow-lg"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {active ? "Tap" : "•"}
                  </button>
                );
              })}
            </div>
            <p className="mt-4 text-sm font-semibold text-foreground">Score: {focusScore}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPage;
