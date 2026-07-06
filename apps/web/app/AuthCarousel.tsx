"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/* eslint-disable @next/next/no-img-element */

type Slide = {
  src: string;
  titleAccent: string;
  titleRest: string;
  body: string;
};

const SLIDES: Slide[] = [
  {
    src: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=75",
    titleAccent: "Screen recorder",
    titleRest: " for everyone",
    body: "Easily record and share video messages with your teammates and customers to supercharge productivity.",
  },
  {
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1600&q=75",
    titleAccent: "Share with a link",
    titleRest: " in seconds",
    body: "Record, share, and react in real time — no exports, no attachments.",
  },
  {
    src: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=75",
    titleAccent: "Recordings and screenshots",
    titleRest: " — one toolbar",
    body: "Share a screen recording when it needs to go out now, Screenshot when a picture says it.",
  },
  {
    src: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=75",
    titleAccent: "Open source",
    titleRest: " and self-hostable",
    body: "Run CaptureFlow on your own Cloudflare account, or let us run it for you.",
  },
];

const ADVANCE_MS = 5000;

export function AuthCarousel() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setTimeout(
      () => setActive((i) => (i + 1) % SLIDES.length),
      ADVANCE_MS,
    );
    return () => clearTimeout(id);
  }, [active]);

  const step = (delta: number) =>
    setActive((i) => (i + delta + SLIDES.length) % SLIDES.length);

  return (
    <div className="group relative flex h-full w-full flex-col">
      <button
        type="button"
        aria-label="Previous slide"
        onClick={() => step(-1)}
        className="absolute top-1/2 left-4 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 p-0 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/60 focus-visible:opacity-100"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={() => step(1)}
        className="absolute top-1/2 right-4 z-10 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border-0 bg-black/40 p-0 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 hover:bg-black/60 focus-visible:opacity-100"
      >
        <ChevronRight size={22} />
      </button>
      <div className="relative min-h-0 flex-1">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.src}
            aria-hidden={i !== active}
            className="absolute inset-0 transition-opacity duration-700"
            style={{
              opacity: i === active ? 1 : 0,
              pointerEvents: i === active ? "auto" : "none",
            }}
          >
            <img
              src={slide.src}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(5,5,8,0) 30%, rgba(5,5,8,0.6) 55%, rgba(5,5,8,0.92) 70%, #050508 88%)",
              }}
            />
            <div className="absolute inset-x-0 bottom-0 flex h-64 flex-col px-12">
              <h1 className="m-0 max-w-xl text-4xl leading-tight font-bold tracking-tight text-white">
                <span style={{ color: "#93c5fd" }}>{slide.titleAccent}</span>
                {slide.titleRest}
              </h1>
              <p className="mt-4 mb-0 max-w-xl text-base leading-relaxed text-white/75">
                {slide.body}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-center gap-1.5 px-12 pt-0 pb-10">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
            onClick={() => setActive(i)}
            className={`h-[3px] cursor-pointer rounded-full border-0 p-0 transition-all duration-300 ${
              i === active
                ? "w-7 bg-white"
                : "w-3 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
