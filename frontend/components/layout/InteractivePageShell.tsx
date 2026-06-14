"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  HALO_SPRING,
  PARALLAX_LAYER,
  type ParallaxLayerKey,
} from "@/constants/interactive-page-motion";

type InteractivePageMotionContextValue = {
  parallaxStyle: (layer: ParallaxLayerKey) => CSSProperties;
};

const InteractivePageMotionContext =
  createContext<InteractivePageMotionContextValue | null>(null);

export function useInteractivePageMotion(): InteractivePageMotionContextValue {
  const ctx = useContext(InteractivePageMotionContext);
  if (!ctx) {
    throw new Error(
      "ParallaxBand bu bileşenden yalnızca InteractivePageShell içinde kullanılabilir."
    );
  }
  return ctx;
}

export type InteractivePageShellProps = {
  children: ReactNode;
  /** <main> ile birleşir (arka plan, flex, tema vb.) */
  className?: string;
  /** Halo ve parallax efektinin üstündeki z-10 sarmalayıcı */
  contentClassName?: string;
};

function mergeClass(parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ").trim();
}

export function InteractivePageShell({
  children,
  className,
  contentClassName,
}: InteractivePageShellProps) {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

  const haloTargetX = useMotionValue(50);
  const haloTargetY = useMotionValue(50);
  const haloSmoothX = useSpring(haloTargetX, HALO_SPRING);
  const haloSmoothY = useSpring(haloTargetY, HALO_SPRING);
  const haloLeft = useTransform(haloSmoothX, (v) => `${v}%`);
  const haloTop = useTransform(haloSmoothY, (v) => `${v}%`);

  const pendingParallax = useRef({ x: 50, y: 50 });
  const parallaxRafId = useRef<number | undefined>(undefined);

  useEffect(
    () => () => {
      if (parallaxRafId.current !== undefined) {
        cancelAnimationFrame(parallaxRafId.current);
      }
    },
    [],
  );

  const parallax = useMemo(() => {
    const nx = mousePosition.x / 100 - 0.5;
    const ny = mousePosition.y / 100 - 0.5;
    return { nx, ny };
  }, [mousePosition]);

  const parallaxStyle = useCallback(
    (layerKey: ParallaxLayerKey): CSSProperties => {
      const layer = PARALLAX_LAYER[layerKey];
      const tx = parallax.nx * layer.kx;
      const ty = parallax.ny * layer.ky;
      // Hareket yokken transform uygulama: kalıcı GPU katmanı Windows ölçeklemede
      // metni bulanıklaştırıyor. Yalnızca fare hareket ederken katman oluşturulur.
      if (Math.abs(tx) < 0.01 && Math.abs(ty) < 0.01) {
        return { transform: "none" };
      }
      return {
        transform: `translate3d(${tx}px, ${ty}px, 0)`,
        willChange: "transform",
      };
    },
    [parallax.nx, parallax.ny],
  );

  function handleMouseMove(event: ReactMouseEvent<HTMLElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    haloTargetX.set(x);
    haloTargetY.set(y);

    pendingParallax.current = { x, y };
    if (parallaxRafId.current === undefined) {
      parallaxRafId.current = requestAnimationFrame(() => {
        parallaxRafId.current = undefined;
        const p = pendingParallax.current;
        setMousePosition((prev) => (prev.x === p.x && prev.y === p.y ? prev : p));
      });
    }
  }

  function handleMouseLeave() {
    haloTargetX.set(50);
    haloTargetY.set(50);
    if (parallaxRafId.current !== undefined) {
      cancelAnimationFrame(parallaxRafId.current);
      parallaxRafId.current = undefined;
    }
    setMousePosition({ x: 50, y: 50 });
  }

  const ctxValue = useMemo(() => ({ parallaxStyle }), [parallaxStyle]);

  return (
    <InteractivePageMotionContext.Provider value={ctxValue}>
      <main
        className={mergeClass([
          "relative min-h-screen overflow-hidden",
          className,
        ])}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <motion.div
          className="pointer-events-none absolute z-0"
          aria-hidden
          style={{
            left: haloLeft,
            top: haloTop,
            translateX: "-50%",
            translateY: "-50%",
          }}
        >
          <div className="absolute left-1/2 top-1/2 size-[7.5rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/25 blur-2xl will-change-transform dark:bg-sky-400/20" />
        </motion.div>

        <div className={mergeClass(["relative z-10", contentClassName])}>
          {children}
        </div>
      </main>
    </InteractivePageMotionContext.Provider>
  );
}

type ParallaxBandProps = {
  band: ParallaxLayerKey;
  className?: string;
  children: ReactNode;
};

export function ParallaxBand({ band, className, children }: ParallaxBandProps) {
  const { parallaxStyle } = useInteractivePageMotion();

  return (
    <div
      className={mergeClass([
        "transition-transform duration-300 ease-out",
        className,
      ])}
      style={parallaxStyle(band)}
    >
      {children}
    </div>
  );
}
