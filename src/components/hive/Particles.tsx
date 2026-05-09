import { useEffect, useRef } from "react";

export function Particles({ density = 60 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: -9999, y: -9999 });
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    let raf = 0; let w = 0, h = 0;
    const dots: { x: number; y: number; vx: number; vy: number }[] = [];
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      w = c.width = c.offsetWidth * dpr; h = c.height = c.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();
    for (let i = 0; i < density; i++) {
      dots.push({ x: Math.random() * c.offsetWidth, y: Math.random() * c.offsetHeight, vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3 });
    }
    const onMove = (e: MouseEvent) => { const r = c.getBoundingClientRect(); mouse.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);
    window.addEventListener("resize", resize);
    const tick = () => {
      ctx.clearRect(0, 0, c.offsetWidth, c.offsetHeight);
      for (const d of dots) {
        const dx = d.x - mouse.current.x, dy = d.y - mouse.current.y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          d.vx += (dx / dist) * 0.05; d.vy += (dy / dist) * 0.05;
        }
        d.x += d.vx; d.y += d.vy;
        d.vx *= 0.98; d.vy *= 0.98;
        if (d.x < 0 || d.x > c.offsetWidth) d.vx *= -1;
        if (d.y < 0 || d.y > c.offsetHeight) d.vy *= -1;
      }
      // lines
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          const d = Math.hypot(dx, dy);
          if (d < 110) {
            ctx.strokeStyle = `hsla(270, 95%, 65%, ${(1 - d / 110) * 0.25})`;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y); ctx.stroke();
          }
        }
      }
      for (const d of dots) {
        ctx.fillStyle = "hsla(180, 100%, 65%, 0.7)";
        ctx.beginPath(); ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseout", onLeave); window.removeEventListener("resize", resize); };
  }, [density]);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}
