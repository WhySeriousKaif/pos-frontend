"use client";
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}) => {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
  }, []);

  const addAnimation = () => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        scrollerRef.current?.appendChild(duplicatedItem);
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  };

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty(
        "--animation-direction",
        direction === "left" ? "forwards" : "reverse"
      );
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      const durations = { fast: "20s", normal: "40s", slow: "80s" };
      containerRef.current.style.setProperty(
        "--animation-duration",
        durations[speed] ?? "40s"
      );
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_10%,white_90%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-6 py-4",
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.map((item, idx) => (
          <li
            key={item.name + idx}
            className="relative w-[420px] max-w-full shrink-0 rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/80 dark:to-slate-900/80 px-9 py-8 shadow-sm md:w-[540px]"
          >
            <blockquote>
              <span className="relative z-20 text-base md:text-lg leading-relaxed font-normal text-slate-700 dark:text-slate-200">
                "{item.quote}"
              </span>
              <div className="relative z-20 mt-8 flex flex-row items-center">
                <span className="flex flex-col gap-1">
                  <span className="text-base leading-relaxed font-semibold text-slate-900 dark:text-white">
                    {item.name}
                  </span>
                  <span className="text-sm leading-relaxed font-normal text-blue-600 dark:text-blue-300/80">
                    {item.title}
                  </span>
                </span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  );
};
