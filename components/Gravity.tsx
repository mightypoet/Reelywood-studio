
import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useRef, 
  useState, 
  useCallback 
} from 'react';
import Matter from 'matter-js';

interface GravityContextType {
  registerBody: (body: Matter.Body, element: HTMLElement) => () => void;
}

const GravityContext = createContext<GravityContextType | null>(null);

interface GravityProps {
  children: React.ReactNode;
  gravity?: { x: number; y: number };
  className?: string;
  debug?: boolean;
}

export const Gravity: React.FC<GravityProps> = ({ 
  children, 
  gravity = { x: 0, y: 1 }, 
  className = "",
  debug = false 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef(Matter.Engine.create());
  const bodiesMap = useRef(new Map<Matter.Body, HTMLElement>());

  const registerBody = useCallback((body: Matter.Body, element: HTMLElement) => {
    bodiesMap.current.set(body, element);
    Matter.World.add(engineRef.current.world, body);
    return () => {
      bodiesMap.current.delete(body);
      Matter.World.remove(engineRef.current.world, body);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const engine = engineRef.current;
    engine.world.gravity.x = gravity.x;
    engine.world.gravity.y = gravity.y;

    const width = containerRef.current.offsetWidth;
    const height = containerRef.current.offsetHeight;

    // Boundaries
    const ground = Matter.Bodies.rectangle(width / 2, height + 50, width, 100, { isStatic: true, friction: 0.1 });
    const wallLeft = Matter.Bodies.rectangle(-50, height / 2, 100, height, { isStatic: true, friction: 0.1 });
    const wallRight = Matter.Bodies.rectangle(width + 50, height / 2, 100, height, { isStatic: true, friction: 0.1 });
    const ceiling = Matter.Bodies.rectangle(width / 2, -50, width, 100, { isStatic: true, friction: 0.1 });

    Matter.World.add(engine.world, [ground, wallLeft, wallRight, ceiling]);

    // Mouse control with enhanced sensitivity
    const mouse = Matter.Mouse.create(containerRef.current);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.15, // Higher sensitivity to mouse movements
        damping: 0.1,    // More fluid connection
        render: { visible: false }
      }
    });
    Matter.World.add(engine.world, mouseConstraint);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);

    let animationId: number;
    const update = () => {
      bodiesMap.current.forEach((element, body) => {
        const { x, y } = body.position;
        element.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) rotate(${body.angle}rad)`;
      });
      animationId = requestAnimationFrame(update);
    };
    update();

    const handleResize = () => {
      if (!containerRef.current) return;
      const newWidth = containerRef.current.offsetWidth;
      const newHeight = containerRef.current.offsetHeight;
      
      Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 50 });
      Matter.Body.setPosition(wallRight, { x: newWidth + 50, y: newHeight / 2 });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      window.removeEventListener('resize', handleResize);
    };
  }, [gravity.x, gravity.y]);

  return (
    <GravityContext.Provider value={{ registerBody }}>
      <div ref={containerRef} className={`relative overflow-hidden touch-none ${className}`}>
        {children}
      </div>
    </GravityContext.Provider>
  );
};

interface MatterBodyProps {
  children: React.ReactElement;
  x?: string | number;
  y?: string | number;
  angle?: number;
  matterBodyOptions?: Matter.IBodyDefinition;
}

export const MatterBody: React.FC<MatterBodyProps> = ({ 
  children, 
  x = "50%", 
  y = "50%", 
  angle = 0,
  matterBodyOptions = {} 
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const context = useContext(GravityContext);

  useEffect(() => {
    if (!elementRef.current || !context) return;

    const parent = elementRef.current.parentElement;
    if (!parent) return;

    const rect = elementRef.current.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    const initialX = typeof x === 'string' ? (parseFloat(x) / 100) * parentRect.width : (x as number);
    const initialY = typeof y === 'string' ? (parseFloat(y) / 100) * parentRect.height : (y as number);

    const body = Matter.Bodies.rectangle(
      initialX,
      initialY,
      rect.width,
      rect.height,
      {
        restitution: 0.7, // Higher bounciness
        friction: 0.005,  // Smooth gliding
        angle: (angle * Math.PI) / 180,
        ...matterBodyOptions
      }
    );

    const unregister = context.registerBody(body, elementRef.current);
    return unregister;
  }, [context, angle, x, y, matterBodyOptions]);

  return (
    <div
      ref={elementRef}
      className="absolute top-0 left-0 will-change-transform"
      style={{ position: 'absolute' }}
    >
      {children}
    </div>
  );
};

export default Gravity;
