"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ShowcaseCarousel } from "./ShowcaseCarousel";
import { ShowcaseHeader } from "./ShowcaseHeader";
import { ShowcaseThumbnails } from "./ShowcaseThumbnails";

import type { ShowcaseItem } from "./types";

export type { ShowcaseItem };

const SWIPE_MIN_PX = 50;
const AUTOPLAY_INTERVAL_MS = 6000;

type ShowcaseProps = {
  items: ShowcaseItem[];
};

export function Showcase({ items }: ShowcaseProps) {
  const [index, setIndex] = useState(0);
  const [pauseAutoplay, setPauseAutoplay] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const count = items.length;

  const goPrev = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const goNext = useCallback(() => {
    setIndex((i) => (i + 1) % count);
  }, [count]);

  useEffect(() => {
    if (pauseAutoplay || count <= 1) return;
    const id = window.setInterval(goNext, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [pauseAutoplay, count, goNext]);

  useEffect(() => {
    for (const item of items) {
      const img = new window.Image();
      img.src = item.image;
    }
  }, [items]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = touchStartX.current - endX;
    if (delta > SWIPE_MIN_PX) goNext();
    else if (delta < -SWIPE_MIN_PX) goPrev();
    touchStartX.current = null;
  };

  const active = items[index];

  return (
    <section
      className="container mx-auto px-4"
      aria-labelledby="showcase-heading"
      onMouseEnter={() => setPauseAutoplay(true)}
      onMouseLeave={() => setPauseAutoplay(false)}
    >
      <div className="flex flex-col gap-10 py-12 md:gap-12 md:py-20">
        <ShowcaseHeader />

        <div className="mx-auto w-full max-w-5xl">
          <p className="sr-only" aria-live="polite">
            {active ? `${active.tag}. ${active.title}` : ""}
          </p>

          <div onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            <ShowcaseCarousel
              items={items}
              activeIndex={index}
              onPrev={goPrev}
              onNext={goNext}
            />
          </div>

          <ShowcaseThumbnails
            items={items}
            activeIndex={index}
            onSelect={setIndex}
          />
        </div>
      </div>
    </section>
  );
}
