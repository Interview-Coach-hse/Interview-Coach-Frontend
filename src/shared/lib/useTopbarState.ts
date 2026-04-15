import { useEffect, useState } from "react";

export function useTopbarState(threshold = 24) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let frame = 0;

    const syncScrollState = () => {
      frame = 0;
      setIsScrolled(window.scrollY > threshold);
    };

    const handleScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(syncScrollState);
    };

    syncScrollState();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, [threshold]);

  return isScrolled;
}
