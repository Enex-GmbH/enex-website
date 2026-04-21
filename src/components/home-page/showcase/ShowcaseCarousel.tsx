"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import type { ShowcaseItem } from "./types";

type ShowcaseCarouselProps = {
  items: ShowcaseItem[];
  activeIndex: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
};

export function ShowcaseCarousel({
  items,
  activeIndex,
  onPrev,
  onNext,
  className,
}: ShowcaseCarouselProps) {
  const active = items[activeIndex];
  const isFirst = activeIndex === 0;

  return (
    <div
      className={cn(
        "group relative aspect-video w-full overflow-hidden rounded-3xl bg-muted shadow-sm",
        className,
      )}
    >
      <Image
        key={active.id}
        src={active.image}
        alt={`${active.title} — ${active.tag}`}
        fill
        sizes="(max-width: 768px) 100vw, min(1100px, 100vw)"
        priority={isFirst}
        loading={isFirst ? "eager" : "lazy"}
        quality={82}
        className="pointer-events-none object-cover transition-opacity duration-500 ease-out"
      />

      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"
        aria-hidden
      />

      <div className="pointer-events-none absolute right-4 top-4 z-20 rounded-full bg-white/90 px-3 py-1 text-sm font-medium tabular-nums text-foreground shadow-sm backdrop-blur-sm">
        {activeIndex + 1} / {items.length}
      </div>

      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 p-5 md:p-8">
        <div className="flex max-w-xl flex-col gap-2">
          <span className="inline-flex w-fit rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
            {active.tag}
          </span>
          <p className="text-xl font-bold text-white md:text-2xl">
            {active.title}
          </p>
        </div>
      </div>

      <div className="absolute inset-y-0 left-0 z-20 flex items-center pl-3 md:pl-4">
        <button
          type="button"
          onClick={onPrev}
          aria-label="Vorheriges Bild"
          className="flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground opacity-40 shadow-md backdrop-blur-sm transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-hover:opacity-100 md:size-11"
        >
          <ChevronLeft className="size-5 md:size-6" aria-hidden />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 z-20 flex items-center pr-3 md:pr-4">
        <button
          type="button"
          onClick={onNext}
          aria-label="Nächstes Bild"
          className="flex size-10 items-center justify-center rounded-full bg-white/90 text-foreground opacity-40 shadow-md backdrop-blur-sm transition-opacity hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring group-hover:opacity-100 md:size-11"
        >
          <ChevronRight className="size-5 md:size-6" aria-hidden />
        </button>
      </div>
    </div>
  );
}
