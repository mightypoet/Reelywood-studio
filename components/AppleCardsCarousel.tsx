import React, { useEffect, useRef, useState, createContext, useContext } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { gsap } from 'gsap';

// Exported to allow type safety in parent components (like UVP.tsx)
export interface CardData {
  category: string;
  title: string;
  src: string;
  content: React.ReactNode;
}

interface CarouselContextProps {
  onCardClose: (index: number) => void;
  currentIndex: number;
}

const CarouselContext = createContext<CarouselContextProps>({
  onCardClose: () => {},
  currentIndex: -1,
});

// Fix: Use React.FC to allow implicit React props like 'key' in consumers like UVP.tsx
export const Card: React.FC<{ card: CardData; index: number; layout?: boolean }> = ({ card, index, layout = false }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        handleClose();
      }
    }

    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      {open && (
        <div className="fixed inset-0 h-screen z-[200] overflow-auto">
          <div 
            className="bg-black/80 backdrop-blur-lg fixed inset-0" 
            onClick={handleClose}
          />
          <div 
            className="max-w-5xl mx-auto bg-white dark:bg-neutral-900 h-fit z-[201] my-10 p-4 md:p-10 rounded-3xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="sticky top-4 h-10 w-10 right-0 ml-auto bg-black dark:bg-white rounded-full flex items-center justify-center z-50 transition-transform active:scale-90"
              onClick={handleClose}
            >
              <X className="h-6 w-6 text-white dark:text-black" />
            </button>
            <p className="text-base font-medium text-black dark:text-white uppercase tracking-widest mb-2">
              {card.category}
            </p>
            <h2 className="text-2xl md:text-5xl font-black text-neutral-700 dark:text-white mb-10">
              {card.title}
            </h2>
            <div className="py-10">{card.content}</div>
          </div>
        </div>
      )}
      <button
        onClick={handleOpen}
        className="rounded-3xl bg-gray-100 dark:bg-neutral-900 h-80 w-56 md:h-[40rem] md:w-96 overflow-hidden flex flex-col items-start justify-start relative z-10 transition-transform hover:scale-[0.98] duration-300 group shadow-xl"
      >
        <div className="absolute h-full w-full inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent z-30 pointer-events-none" />
        <div className="relative z-40 p-8">
          <p className="text-white text-sm md:text-base font-black uppercase tracking-widest text-left mb-2 opacity-80">
            {card.category}
          </p>
          <p className="text-white text-xl md:text-3xl font-black text-left [text-wrap:balance] tracking-tight">
            {card.title}
          </p>
        </div>
        <img
          src={card.src}
          alt={card.title}
          className="object-cover absolute z-10 inset-0 h-full w-full grayscale group-hover:grayscale-0 transition-all duration-700"
        />
      </button>
    </>
  );
};

// Fix: Use React.FC for Carousel component as well for consistency
export const Carousel: React.FC<{ items: React.ReactNode[]; initialScroll?: number }> = ({ items, initialScroll = 0 }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: () => {}, currentIndex: -1 }}>
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-contain py-10 md:py-20 scroll-smooth [scrollbar-width:none]"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className="flex flex-row justify-start gap-4 pl-4 max-w-7xl mx-auto">
            {items.map((item, index) => (
              <div
                key={"card" + index}
                className="last:pr-[5%] md:last:pr-[33%] rounded-3xl"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mr-10">
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-gray-200"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center disabled:opacity-50 transition-colors hover:bg-gray-200"
            onClick={scrollRight}
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};
