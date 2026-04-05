import { useEffect, useRef } from "react";

const MonochromePlusBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;

    if (prefersReducedMotion || isCoarsePointer) {
      return;
    }

    const canvas = canvasRef.current;

    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return;
    }

    type PlusSign = {
      baseX: number;
      baseY: number;
      offsetX: number;
      offsetY: number;
      scale: number;
      size: number;
    };

    const signs: PlusSign[] = [];
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const spacing = 108;
    const plusSize = 7;
    const influenceRadius = 160;
    const targetFrameMs = 1000 / 30;
    let frameId = 0;
    let lastRenderTime = 0;

    const getStrokeStyle = () => {
      const foreground = getComputedStyle(document.documentElement)
        .getPropertyValue("--foreground")
        .trim();
      return `hsl(${foreground} / 0.18)`;
    };

    let strokeStyle = getStrokeStyle();

    const buildGrid = () => {
      const dpr = Math.max(1, Math.min(1.25, window.devicePixelRatio || 1));
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      signs.length = 0;

      for (let y = spacing / 2; y < height; y += spacing) {
        for (let x = spacing / 2; x < width; x += spacing) {
          signs.push({
            baseX: x,
            baseY: y,
            offsetX: 0,
            offsetY: 0,
            scale: 1,
            size: plusSize,
          });
        }
      }
    };

    const draw = (timestamp: number) => {
      if (document.hidden) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

      if (timestamp - lastRenderTime < targetFrameMs) {
        frameId = window.requestAnimationFrame(draw);
        return;
      }

      lastRenderTime = timestamp;
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1.1;

      for (const sign of signs) {
        const dx = mouse.x - sign.baseX;
        const dy = mouse.y - sign.baseY;
        const distance = Math.hypot(dx, dy) || 1;
        const influence = Math.max(0, 1 - distance / influenceRadius);
        const angle = Math.atan2(dy, dx);

        const targetOffset = influence * 12;
        const targetX = Math.cos(angle) * targetOffset;
        const targetY = Math.sin(angle) * targetOffset;
        const targetScale = 1 + influence * 0.55;

        sign.offsetX += (targetX - sign.offsetX) * 0.15;
        sign.offsetY += (targetY - sign.offsetY) * 0.15;
        sign.scale += (targetScale - sign.scale) * 0.14;

        const x = sign.baseX + sign.offsetX;
        const y = sign.baseY + sign.offsetY;
        const half = (sign.size * sign.scale) / 2;

        ctx.beginPath();
        ctx.moveTo(x, y - half);
        ctx.lineTo(x, y + half);
        ctx.moveTo(x - half, y);
        ctx.lineTo(x + half, y);
        ctx.stroke();
      }

      frameId = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: MouseEvent | TouchEvent) => {
      if ("touches" in event && event.touches[0]) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
        return;
      }

      if ("clientX" in event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
      }
    };

    const handleThemeMutation = () => {
      strokeStyle = getStrokeStyle();
    };

    const mutationObserver = new MutationObserver(handleThemeMutation);
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-bg"],
    });

    buildGrid();
    frameId = window.requestAnimationFrame(draw);

    window.addEventListener("resize", buildGrid);
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });

    return () => {
      mutationObserver.disconnect();
      window.removeEventListener("resize", buildGrid);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      window.cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />;
};

export default MonochromePlusBackground;
