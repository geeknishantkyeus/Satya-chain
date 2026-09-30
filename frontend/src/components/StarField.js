import { useEffect, useState } from "react";

export default function StarField() {
  const [dots, setDots] = useState([]);

  useEffect(() => {
    const count = 30;
    const newDots = Array.from({ length: count }).map((_, i) => ({
      id: i,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 3,
      size: Math.random() > 0.7 ? 4 : 2
    }));
    setDots(newDots);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="star-field absolute rounded-full"
          style={{
            top: `${dot.top}%`,
            left: `${dot.left}%`,
            width: `${dot.size}px`,
            height: `${dot.size}px`,
            background: dot.size > 2 ? "#818cf8" : "#67e8f9",
            "--twinkle-duration": `${dot.duration}s`,
            "--twinkle-delay": `${dot.delay}s`,
            opacity: 0.4
          }}
        />
      ))}
    </div>
  );
}