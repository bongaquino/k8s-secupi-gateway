import { useEffect, useRef } from "react";

const ConstellationCanvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const width = (canvas.width = window.innerWidth + 1000);
    const height = (canvas.height = window.innerHeight + 1000);

    const numStars = 35;
    const stars = Array.from({ length: numStars }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
    }));

    const findNearestNeighbors = (
      star: { x: number; y: number },
      allStars: { x: number; y: number }[],
      numNeighbors: number
    ) => {
      return allStars
        .map((otherStar, index) => ({
          index,
          distance: Math.sqrt(
            (star.x - otherStar.x) ** 2 + (star.y - otherStar.y) ** 2
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(1, numNeighbors + 2)
        .map((item) => item.index);
    };

    const getThemeColors = () => {
      const isDark = document.documentElement.classList.contains("dark");
      return {
        nodeColor: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.3)",
        lineColor: isDark ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.1)",
      };
    };

    function draw() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const { nodeColor, lineColor } = getThemeColors();

      ctx.fillStyle = nodeColor;
      stars.forEach(({ x, y }) => {
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 3);
        ctx.fill();
      });

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;

      const connectedPairs = new Set<string>();

      stars.forEach((star, i) => {
        const nearestIndices = findNearestNeighbors(star, stars, 2);

        nearestIndices.forEach((j) => {
          const pairKey = i < j ? `${i}-${j}` : `${j}-${i}`;
          if (!connectedPairs.has(pairKey)) {
            connectedPairs.add(pairKey);
            ctx.beginPath();
            ctx.moveTo(star.x, star.y);
            ctx.lineTo(stars[j].x, stars[j].y);
            ctx.stroke();
          }
        });
      });
    }

    draw();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          draw();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("resize", draw);

    return () => {
      window.removeEventListener("resize", draw);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute top-[-500px] left-[-500px]" />
    </div>
  );
};

export default ConstellationCanvas;
