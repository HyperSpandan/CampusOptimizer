import { useEffect, useRef } from "react";

interface DotGridProps {
  dotSize?: number;
  dotColor?: string;
  gap?: number;
  className?: string;
}

export default function DotGrid({
  dotSize = 1.5,
  dotColor = "rgba(var(--primary-rgb), 0.2)",
  gap = 30,
  className = "",
}: DotGridProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width: number;
    let height: number;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const isDark = document.documentElement.classList.contains('dark');
      const primaryRgb = getComputedStyle(document.documentElement).getPropertyValue('--primary-rgb').trim();
      
      // Use black for light mode, primary color for dark mode
      const baseColor = isDark 
        ? `rgba(${primaryRgb || '0, 255, 153'}, 0.3)` 
        : `rgba(0, 0, 0, 0.3)`;

      const rows = Math.ceil(height / gap);
      const cols = Math.ceil(width / gap);

      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * gap + gap / 2;
          const y = i * gap + gap / 2;

          const dx = mouseRef.current.x - x;
          const dy = mouseRef.current.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          const maxDist = 200;
          let size = dotSize;
          let opacity = 0.3;

          if (dist < maxDist) {
            const factor = 1 - dist / maxDist;
            size = dotSize + factor * 4;
            opacity = 0.3 + factor * 0.7;
          }

          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fillStyle = baseColor.replace('0.3', opacity.toString());
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    
    resize();
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [dotSize, dotColor, gap]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}
