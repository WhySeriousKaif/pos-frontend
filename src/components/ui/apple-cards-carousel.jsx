"use client";
import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/utils";

export const CarouselContext = createContext({
  onCardClose: () => {},
  scrollRight: () => {},
  scrollLeft: () => {},
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }) => {
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -380, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 380, behavior: "smooth" });
    }
  };

  // FIX: On close, do NOT scroll the carousel. Just track current index.
  const handleCardClose = (index) => {
    setCurrentIndex(index);
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, scrollRight, scrollLeft, currentIndex }}>
      <div className="relative w-full">
        {/* Top Navigation Arrow Buttons */}
        <div className="flex justify-end gap-3 mb-8 px-4 md:px-12">
          <button
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className="h-12 w-12 rounded-full bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-300 flex items-center justify-center text-slate-800 transition-all shadow-md active:scale-95 cursor-pointer z-10"
            aria-label="Scroll left"
          >
            <ArrowLeft className="h-6 w-6 text-slate-700" />
          </button>
          <button
            onClick={scrollRight}
            disabled={!canScrollRight}
            className="h-12 w-12 rounded-full bg-white hover:bg-slate-100 disabled:opacity-30 border border-slate-300 flex items-center justify-center text-slate-800 transition-all shadow-md active:scale-95 cursor-pointer z-10"
            aria-label="Scroll right"
          >
            <ArrowRight className="h-6 w-6 text-slate-700" />
          </button>
        </div>

        {/* Scrollable Cards Container */}
        <div
          ref={carouselRef}
          onScroll={checkScrollability}
          className="flex w-full overflow-x-scroll overscroll-x-contain py-4 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-4 md:px-12 gap-6"
        >
          {items.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.08 * index } }}
              key={"card" + index}
              className="last:pr-[5%] md:last:pr-[25%] flex-shrink-0"
            >
              {item}
            </motion.div>
          ))}
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({ card, index, layout = false }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        handleClose();
      }
    };

    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => {
    setOpen(true);
  };

  // FIX: Close modal cleanly — no carousel scroll triggered
  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 h-screen z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-black/70 backdrop-blur-md h-full w-full fixed inset-0"
            />

            {/* Modal Card Content Popup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              ref={containerRef}
              className="max-w-3xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 z-[60] my-8 p-6 md:p-10 rounded-[2.5rem] font-sans relative shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100"
            >
              <button
                className="absolute top-6 right-6 h-10 w-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors border border-slate-300 dark:border-slate-600 z-20 cursor-pointer"
                onClick={handleClose}
              >
                <X className="h-5 w-5" />
              </button>

              <span
                className="inline-block text-xs font-extrabold uppercase tracking-widest text-blue-800 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 px-3.5 py-1 rounded-full mb-3"
                style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace" }}
              >
                {card.category}
              </span>

              <h3
                className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-6 leading-tight"
                style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace" }}
              >
                {card.title}
              </h3>

              <div className="rounded-2xl overflow-hidden mb-6 h-64 md:h-80 w-full relative bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                <img
                  src={card.src}
                  alt={card.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="text-slate-700 text-base md:text-lg leading-relaxed">
                {card.content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Outer Card Container - Full Cover Image — NO Arrow Button */}
      <motion.div
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="rounded-[2.2rem] h-[480px] w-[310px] sm:w-[330px] md:w-[350px] overflow-hidden flex flex-col justify-between relative z-10 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 shadow-lg cursor-pointer text-left group bg-slate-950 border border-slate-200/20"
      >
        {/* Full-Cover Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={card.src}
            alt={card.title}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
          {/* Natural readability gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 group-hover:from-black/95 transition-colors duration-300" />
        </div>

        {/* Top: Category Label */}
        <div className="p-7 md:p-8 z-10 flex flex-col justify-start">
          <p
            className="text-[10px] font-semibold uppercase tracking-[0.22em] text-blue-300 mb-3 opacity-90"
            style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace", letterSpacing: "0.22em" }}
          >
            {card.category}
          </p>

          {/* Card Title — monospace font family: JetBrains Mono */}
          <h4
            className="text-[22px] md:text-[24px] text-white leading-[1.28] group-hover:text-blue-100 transition-colors drop-shadow-sm"
            style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace", fontWeight: 700 }}
          >
            {card.title}
          </h4>
        </div>

        {/* Bottom: View Details only — no arrow button */}
        <div className="p-7 md:p-8 z-10 w-full mt-auto">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleOpen();
            }}
            className="group/btn flex items-center gap-2 text-[11px] font-bold tracking-[0.15em] uppercase text-blue-300 hover:text-white transition-all cursor-pointer"
            style={{ fontFamily: "'JetBrains Mono', 'Monaco', monospace" }}
          >
            <span className="border-b border-blue-400/60 group-hover/btn:border-white pb-0.5 transition-colors">
              View Details
            </span>
            <span className="opacity-60 group-hover/btn:opacity-100 transition-opacity text-base leading-none">→</span>
          </button>
        </div>
      </motion.div>
    </>
  );
};
