import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
}

export default function TiltCard({ children, className }: TiltCardProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-7deg", "7deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mX = e.clientX - rect.left;
    const mY = e.clientY - rect.top;

    const xPct = mX / width - 0.5;
    const yPct = mY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
    mouseX.set(mX);
    mouseY.set(mY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const background = useTransform(
    [mouseX, mouseY],
    ([x, y]) => `radial-gradient(250px circle at ${x}px ${y}px, var(--primary), transparent 80%)`
  );

  return (
    <div className="relative p-[1px] group rounded-[2rem] overflow-hidden">
      <motion.div
        className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background }}
      />
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02 }}
        className={cn("glass rounded-[calc(2rem-1px)] border border-border overflow-hidden group transition-all relative z-10", className)}
      >
        <div style={{ transform: "translateZ(30px)" }} className="relative z-10">
          {children}
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
      </motion.div>
    </div>
  );
}
