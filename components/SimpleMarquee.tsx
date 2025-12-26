
import React, { useRef, useEffect, useMemo } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SimpleMarqueeProps {
  children: React.ReactNode;
  baseVelocity?: number;
  direction?: 'left' | 'right';
  repeat?: number;
  className?: string;
  slowdownOnHover?: boolean;
  slowDownFactor?: number;
}

const SimpleMarquee: React.FC<SimpleMarqueeProps> = ({
  children,
  baseVelocity = 5,
  direction = 'left',
  repeat = 4,
  className = '',
  slowdownOnHover = true,
  slowDownFactor = 0.2
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const proxyRef = useRef({ skew: 0 });

  const items = useMemo(() => {
    return Array(repeat).fill(children);
  }, [children, repeat]);

  useEffect(() => {
    if (!trackRef.current) return;

    const track = trackRef.current;
    // Calculate width of one full set
    const singleSetWidth = track.scrollWidth / repeat;
    
    // Initial position
    gsap.set(track, { x: direction === 'left' ? 0 : -singleSetWidth });

    const timeline = gsap.timeline({
      repeat: -1,
      defaults: { ease: 'none' }
    });

    const duration = 100 / (Math.abs(baseVelocity) || 1);

    timeline.to(track, {
      x: direction === 'left' ? `-=${singleSetWidth}` : `+=${singleSetWidth}`,
      duration: duration,
      onReverseComplete: () => {
        gsap.set(track, { x: direction === 'left' ? 0 : -singleSetWidth });
      }
    });

    animationRef.current = timeline;

    // "Autoplay while scroll" - Enhance speed based on scroll velocity
    const scrollTrigger = ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = self.getVelocity();
        const velocityFactor = Math.abs(velocity) / 1000;
        const targetTimeScale = 1 + velocityFactor * 2;
        
        gsap.to(timeline, {
          timeScale: targetTimeScale,
          duration: 0.5,
          overwrite: true
        });
      }
    });

    return () => {
      timeline.kill();
      scrollTrigger.kill();
    };
  }, [baseVelocity, direction, repeat, children]);

  const handleMouseEnter = () => {
    if (slowdownOnHover && animationRef.current) {
      gsap.to(animationRef.current, { timeScale: slowDownFactor, duration: 0.5 });
    }
  };

  const handleMouseLeave = () => {
    if (slowdownOnHover && animationRef.current) {
      gsap.to(animationRef.current, { timeScale: 1, duration: 0.5 });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap select-none ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div 
        ref={trackRef}
        className="inline-flex"
      >
        {items.map((item, i) => (
          <React.Fragment key={i}>{item}</React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default SimpleMarquee;
