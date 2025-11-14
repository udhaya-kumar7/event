import React, { useRef, useEffect } from 'react';

const Starfield = ({ className = '', tint = '255,80,80', densityScale = 0.9 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let w = 0;
    let h = 0;
    let stars = [];
    let rafId = null;

    const setup = () => {
      const dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth || canvas.offsetWidth || window.innerWidth;
      h = canvas.clientHeight || canvas.offsetHeight || window.innerHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      stars = [];
      // reduce star density to make it less intrusive; scale by densityScale
      const density = Math.max(30, Math.floor((w * h) / 30000 * (densityScale || 1)));
      for (let i = 0; i < density; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.3,
          a: Math.random() * 0.6 + 0.05,
          tw: Math.random() * 0.015 + 0.001,
          phase: Math.random() * Math.PI * 2,
        });
      }
    };

    const draw = () => {
      if (!ctx) return;
      // soft gradient background (very subtle)
      ctx.clearRect(0, 0, w, h);
      const bg = ctx.createLinearGradient(0, 0, 0, h);
      bg.addColorStop(0, 'rgba(6,10,26,0.45)');
      bg.addColorStop(1, 'rgba(0,0,0,0.75)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // draw stars
      for (const s of stars) {
        s.phase += s.tw;
        const alpha = Math.max(0, Math.min(1, s.a * (0.6 + Math.sin(s.phase) * 0.4)));

        // core
        ctx.beginPath();
        ctx.fillStyle = `rgba(255,255,255,${alpha})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        // glow using tint to harmonize with theme
        const glowRadius = s.r * 6;
        const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, glowRadius);
        grd.addColorStop(0, `rgba(${tint},${Math.max(0.04, alpha * 0.08)})`);
        grd.addColorStop(1, `rgba(${tint},0)`);
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // subtle large glows
      // occasional big soft glows for depth
      if (Math.random() < 0.01) {
        const lx = Math.random() * w;
        const ly = Math.random() * h;
        const lr = Math.random() * 160 + 120;
        const lg = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
        lg.addColorStop(0, `rgba(${tint},0.06)`);
        lg.addColorStop(1, `rgba(${tint},0)`);
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, w, h);
      }

      rafId = requestAnimationFrame(draw);
    };

    const onResize = () => {
      setup();
    };

    setup();
    draw();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
    />
  );
};

export default Starfield;
