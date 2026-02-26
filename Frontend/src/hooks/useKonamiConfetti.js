import { useEffect, useRef } from "react";

const KONAMI_SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function useKonamiConfetti(confettiColors = []) {
  const sequenceRef = useRef([]);

  useEffect(() => {
    const createConfetti = () => {
      const colors = confettiColors.length > 0 ? confettiColors : ["#00988D"];
      const confettiCount = 60;

      for (let i = 0; i < confettiCount; i += 1) {
        const confetti = document.createElement("div");
        confetti.className = "confetti-piece";
        confetti.style.cssText = `
          position: fixed;
          width: ${Math.random() * 10 + 5}px;
          height: ${Math.random() * 10 + 5}px;
          background-color: ${colors[Math.floor(Math.random() * colors.length)]};
          left: ${Math.random() * 100}%;
          top: -20px;
          opacity: 1;
          transform: rotate(${Math.random() * 360}deg);
          animation: confetti-fall ${2 + Math.random() * 2}s linear forwards;
          z-index: 9999;
          pointer-events: none;
          border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
        `;
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4500);
      }
    };

    const handleKeyDown = (event) => {
      const sequence = [...sequenceRef.current, event.key].slice(-10);
      sequenceRef.current = sequence;

      if (sequence.join(",") === KONAMI_SEQUENCE.join(",")) {
        createConfetti();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [confettiColors]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes confetti-fall {
        to {
          transform: translateY(100vh) rotate(720deg);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
}
