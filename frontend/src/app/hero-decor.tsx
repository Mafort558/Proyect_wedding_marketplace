"use client";

import { useEffect, useRef } from "react";

export function HeroDecor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (node === null) {
      return;
    }
    function onMove(event: MouseEvent) {
      const rect = node!.getBoundingClientRect();
      const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
      const relativeY = (event.clientY - rect.top) / rect.height - 0.5;
      node!.style.setProperty("--px", `${relativeX * 26}px`);
      node!.style.setProperty("--py", `${relativeY * 26}px`);
    }
    node.addEventListener("mousemove", onMove);
    return () => node.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 [transform:translate3d(0,0,0)]"
      style={{ ["--px" as string]: "0px", ["--py" as string]: "0px" }}
    >
      <span className="absolute -left-16 top-4 h-72 w-72 animate-blob rounded-full bg-rose-300/40 [transform:translate(var(--px),var(--py))] dark:bg-accent/25" />
      <span className="absolute -right-12 bottom-0 h-80 w-80 animate-blob rounded-full bg-amber-200/50 [animation-delay:4s] [transform:translate(calc(var(--px)*-1),calc(var(--py)*-1))] dark:bg-gold/20" />
      <span className="absolute left-1/2 top-1/3 h-64 w-64 animate-blob rounded-full bg-accent/15 [animation-delay:8s] [transform:translate(calc(var(--px)*0.6),calc(var(--py)*-0.6))] dark:bg-accent/20" />
    </div>
  );
}
