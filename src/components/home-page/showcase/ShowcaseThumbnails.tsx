"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

import type { ShowcaseItem } from "./types";

type ShowcaseThumbnailsProps = {
  items: ShowcaseItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
};

export function ShowcaseThumbnails({
  items,
  activeIndex,
  onSelect,
}: ShowcaseThumbnailsProps) {
  const stripRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const strip = stripRef.current;
    const btn = buttonRefs.current[activeIndex];
    if (!strip || !btn) return;
    // Only scroll the thumbnail strip horizontally — never use scrollIntoView here,
    // or the window will jump vertically to bring the strip into view.
    if (strip.scrollWidth <= strip.clientWidth) return;

    const btnCenter = btn.offsetLeft + btn.offsetWidth / 2;
    const target = btnCenter - strip.clientWidth / 2;
    const maxScroll = strip.scrollWidth - strip.clientWidth;
    strip.scrollTo({
      left: Math.max(0, Math.min(target, maxScroll)),
      behavior: "smooth",
    });
  }, [activeIndex]);

  return (
    <div className="-mx-4 mt-6 border-t border-border/60 pt-6 md:mx-0">
      <div
        ref={stripRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 md:justify-center md:overflow-x-visible md:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Showcase-Bilder"
      >
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            role="tab"
            aria-selected={activeIndex === i}
            aria-label={`Bild ${i + 1} anzeigen: ${item.tag}, ${item.title}`}
            onClick={() => onSelect(i)}
            className={cn(
              "relative h-16 w-24 shrink-0 snap-center overflow-hidden rounded-xl transition-transform duration-200 hover:scale-[1.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:h-20 md:w-28",
              activeIndex === i
                ? "z-10 ring-[3px] ring-black ring-offset-2 ring-offset-background"
                : "ring-0",
            )}
          >
            <Image
              src={item.thumbnail}
              alt=""
              fill
              sizes="(max-width: 768px) 96px, 112px"
              loading="lazy"
              quality={65}
              fetchPriority="low"
              className="object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
