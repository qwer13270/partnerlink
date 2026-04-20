'use client';
// @ts-nocheck

import React, { useEffect, useRef } from 'react';

// StatsBG — data-pulse background for the Stats section.
// Concept: stacked sparkline "heartbeats" scrolling sideways, with a vertical
// scan line passing across, occasional glowing data-packets flying through,
// and a faint perspective grid. Matches the hero/CTA cyan-white-on-black network DNA.

function StatsBG({ className = '', style = {} }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    // DPR=1 for this background canvas — it's ambient, not text-critical,
    // and halving pixel count is the single biggest perf win.
    const dpr = 1;

    let W = 0, H = 0;

    // -------- Offscreen caches (rebuilt on resize) --------
    const bgCanvas = document.createElement('canvas');   // ambient wash + perspective grid
    const bgCtx = bgCanvas.getContext('2d');
    const sparkSprite = document.createElement('canvas'); // cached spark/packet-head glow dot
    const sparkCtx = sparkSprite.getContext('2d');

    const buildSparkSprite = () => {
      const R = 10;
      sparkSprite.width = R * 2;
      sparkSprite.height = R * 2;
      const g = sparkCtx.createRadialGradient(R, R, 0, R, R, R);
      g.addColorStop(0, 'rgba(255,255,255,0.9)');
      g.addColorStop(0.4, 'rgba(180,220,255,0.35)');
      g.addColorStop(1, 'rgba(100,150,220,0)');
      sparkCtx.clearRect(0, 0, R * 2, R * 2);
      sparkCtx.fillStyle = g;
      sparkCtx.fillRect(0, 0, R * 2, R * 2);
    };

    const buildBg = () => {
      bgCanvas.width = Math.max(1, W);
      bgCanvas.height = Math.max(1, H);
      bgCtx.clearRect(0, 0, W, H);

      // Ambient radial wash
      const g = bgCtx.createRadialGradient(
        W * 0.5, H * 0.45, 0,
        W * 0.5, H * 0.5, Math.max(W, H) * 0.7
      );
      g.addColorStop(0, 'rgba(18,30,60,0.35)');
      g.addColorStop(0.5, 'rgba(6,12,28,0.75)');
      g.addColorStop(1, 'rgba(0,0,0,0.98)');
      bgCtx.fillStyle = g;
      bgCtx.fillRect(0, 0, W, H);

      // Perspective grid
      const horizon = H * 0.5;
      bgCtx.save();
      bgCtx.strokeStyle = 'rgba(120,160,220,0.035)';
      bgCtx.lineWidth = 1;
      const vCount = 18;
      bgCtx.beginPath();
      for (let i = 0; i <= vCount; i++) {
        const xb = (i / vCount) * W;
        bgCtx.moveTo(xb, H);
        bgCtx.lineTo(W * 0.5, horizon);
      }
      bgCtx.stroke();

      const rows = 10;
      for (let j = 1; j <= rows; j++) {
        const frac = Math.pow(j / rows, 2.5);
        const y = horizon + (H - horizon) * frac;
        bgCtx.strokeStyle = `rgba(120,160,220,${0.025 + 0.025 * (1 - frac)})`;
        bgCtx.beginPath();
        bgCtx.moveTo(0, y);
        bgCtx.lineTo(W, y);
        bgCtx.stroke();
      }
      bgCtx.restore();
    };

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width; H = rect.height;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildBg();
      buildSparkSprite();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Seeded rand
    let seed = 2719;
    const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };

    // --- Sparkline tracks ---
    const TRACKS = 8;
    const tracks = [];
    for (let i = 0; i < TRACKS; i++) {
      const N = 40;
      const amps = [];
      for (let k = 0; k < N; k++) amps.push(rand() * 2 - 1);
      // Pre-smooth the amplitudes once so we don't do it every frame
      const smoothed = [];
      for (let k = 0; k < N; k++) {
        const a1 = amps[k];
        const a2 = amps[(k + 1) % N];
        const a3 = amps[(k + 2) % N];
        smoothed.push((a1 + a2 * 1.5 + a3) / 3.5);
      }
      tracks.push({
        amps: smoothed,
        speed: 6 + rand() * 10,
        phase: rand() * 100,
        height: 18 + rand() * 22,
        opacity: 0.18 + rand() * 0.22,
        spark: Math.floor(rand() * N),
      });
    }

    // --- Floating data packets ---
    const PACKETS = 12;
    const packets = [];
    for (let i = 0; i < PACKETS; i++) {
      packets.push({
        y: rand(),
        speed: 0.05 + rand() * 0.12,
        off: rand(),
      });
    }

    // Mouse parallax — very subtle, low-passed
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      mouse.tx = (e.clientX - rect.left) / rect.width;
      mouse.ty = (e.clientY - rect.top) / rect.height;
    };
    wrap.addEventListener('mousemove', onMove);

    let raf = 0;
    let running = true;
    let inView = true;
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0 });
    io.observe(wrap);

    const start = performance.now();

    // Throttle to ~45fps max to avoid jank spikes, and skip frames if tab is bg
    let lastT = 0;
    const MIN_DT = 1000 / 60;

    const render = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(render);
      if (!inView) return;
      if (now - lastT < MIN_DT) return;
      lastT = now;

      const t = (now - start) / 1000;

      mouse.x += (mouse.tx - mouse.x) * 0.03;
      mouse.y += (mouse.ty - mouse.y) * 0.03;
      const parY = (mouse.y - 0.5) * 8;

      // Paint cached bg (ambient wash + perspective grid) in one blit
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bgCanvas, 0, 0, W, H);

      // --- Sparkline tracks ---
      const trackArea = H * 0.7;
      const trackStart = H * 0.15;
      const trackStep = trackArea / TRACKS;

      ctx.globalCompositeOperation = 'lighter';
      ctx.lineWidth = 1;

      for (let i = 0; i < TRACKS; i++) {
        const trk = tracks[i];
        const cy = trackStart + trackStep * (i + 0.5) + parY * 0.3;
        const N = trk.amps.length;
        const segW = W / (N - 4);
        const sx = -(t * trk.speed) % segW;

        ctx.strokeStyle = `rgba(130,180,230,${trk.opacity * 0.7})`;
        ctx.beginPath();
        for (let k = 0; k < N; k++) {
          const x = k * segW + sx - segW * 2;
          const y = cy + trk.amps[k] * trk.height;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Spark dot — blit cached sprite instead of building a gradient each frame
        const sparkX = ((trk.spark + (t * trk.speed * 0.3)) % N) * segW + sx - segW * 2;
        const sparkY = cy + trk.amps[Math.floor(trk.spark + t) % N] * trk.height;
        ctx.drawImage(sparkSprite, sparkX - 10, sparkY - 10);
      }

      // --- Floating data packets (comet trails) ---
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];
        const progress = (t * p.speed + p.off) % 1.2 - 0.1;
        if (progress < -0.05 || progress > 1.05) continue;
        const x = progress * W;
        const y = p.y * H + parY * 0.4;

        let alpha = 1;
        if (progress < 0.05) alpha = progress / 0.05;
        else if (progress > 0.95) alpha = (1.05 - progress) / 0.1;

        // Trail: use a simple faded stroke (no gradient per frame)
        ctx.strokeStyle = `rgba(180,210,240,${0.4 * alpha})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(x - 40, y);
        ctx.lineTo(x, y);
        ctx.stroke();

        // Head: cached sprite
        ctx.globalAlpha = alpha;
        ctx.drawImage(sparkSprite, x - 10, y - 10);
        ctx.globalAlpha = 1;
      }
      ctx.globalCompositeOperation = 'source-over';
    };

    raf = requestAnimationFrame(render);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      wrap.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{ background: '#000', ...style }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* faint horizontal scanlines — monitor texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, rgba(127,216,255,0.03) 0 1px, transparent 1px 4px)',
          mixBlendMode: 'screen',
          opacity: 0.5,
        }}
      />
    </div>
  );
}

export default StatsBG;
