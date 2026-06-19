"use client";
import { useEffect, useRef } from "react";

// [top%, left%, size(1=1px,2=2px,3=3px), delayMultiplier]
const BG_STARS: [number, number, number, number][] = [
  [4, 8, 1, 0], [12, 22, 2, 1], [7, 45, 1, 2], [18, 67, 1, 3], [3, 82, 2, 4],
  [22, 91, 1, 5], [9, 12, 1, 6], [28, 38, 2, 7], [35, 5, 1, 8], [41, 29, 1, 9],
  [38, 58, 2, 10], [45, 76, 1, 11], [33, 95, 1, 12], [52, 15, 2, 13], [58, 42, 1, 14],
  [61, 69, 1, 15], [55, 88, 2, 16], [68, 8, 1, 17], [72, 33, 1, 18], [78, 60, 2, 19],
  [83, 82, 1, 20], [91, 18, 2, 21], [88, 48, 1, 22], [95, 74, 1, 23], [13, 95, 2, 24],
  [80, 5, 1, 25], [63, 95, 1, 26], [2, 55, 2, 27], [97, 40, 1, 28], [48, 3, 1, 29],
  // extra stars for density
  [6, 30, 1, 2], [15, 50, 1, 5], [25, 15, 2, 8], [30, 75, 1, 11], [10, 85, 1, 14],
  [50, 60, 1, 17], [65, 25, 2, 20], [75, 50, 1, 23], [85, 10, 1, 26], [90, 65, 2, 29],
  [20, 35, 1, 3], [40, 10, 1, 6], [55, 80, 2, 9], [70, 45, 1, 12], [15, 70, 1, 15],
  [45, 90, 2, 18], [60, 5, 1, 21], [35, 55, 1, 24], [50, 30, 1, 27], [80, 85, 2, 0],
  [5, 65, 1, 4], [25, 95, 1, 7], [92, 30, 2, 10], [8, 18, 1, 13], [72, 75, 1, 16],
];

export default function StarField() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;

    // Static star dots — varied sizes with natural-looking distribution
    BG_STARS.forEach(([top, left, sz, delayMult]) => {
      const s = document.createElement("div");
      s.className = "star";
      s.style.top = top + "%";
      s.style.left = left + "%";
      s.style.animationDelay = delayMult * 0.35 + "s";
      // size 1→1px dim, 2→1.5px mid, 3→2.5px bright
      const px = sz === 3 ? "2.5px" : sz === 2 ? "1.5px" : "1px";
      const op = sz === 3 ? "0.7" : sz === 2 ? "0.5" : "0.35";
      s.style.width = px;
      s.style.height = px;
      s.style.opacity = op;
      s.style.animationDuration = (3.5 + delayMult * 0.15) % 3 + 3 + "s";
      container.appendChild(s);
    });

    // Shooting stars
    let timeoutId: ReturnType<typeof setTimeout>;

    function spawnShootingStar() {
      const el = document.createElement("div");
      el.className = "shooting-star";
      // Random position in top-right quadrant
      el.style.top = Math.random() * 45 + "%";
      el.style.left = (50 + Math.random() * 45) + "%";
      document.body.appendChild(el);

      el.addEventListener("animationend", () => el.remove(), { once: true });

      // Schedule next shooting star (3–5 seconds)
      const delay = 3000 + Math.random() * 2000;
      timeoutId = setTimeout(spawnShootingStar, delay);
    }

    // Start after a short initial delay
    timeoutId = setTimeout(spawnShootingStar, 2000 + Math.random() * 2000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  return <div ref={ref} className="fixed inset-0 pointer-events-none z-0" />;
}
