"use client";
import { useEffect } from "react";
export default function Intro({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(
      onComplete,
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 2300,
    );
    return () => clearTimeout(timer);
  }, [onComplete]);
  return (
    <div className="intro" aria-label="AETHER opening sequence" data-intro>
      <div className="intro-seed" />
      <div className="intro-ring" />
      <div className="intro-wordmark">
        AETHER<small>Reality is yours to rewrite.</small>
      </div>
      <button onClick={onComplete}>Skip intro</button>
    </div>
  );
}
