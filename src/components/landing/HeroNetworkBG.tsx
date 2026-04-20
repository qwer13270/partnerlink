'use client';
// @ts-nocheck

import React, { useEffect, useRef } from 'react';

// Animated low-poly network background (looping, interactive).
// - Smooth: capped DPR, modest node count, additive compositing for glow instead of per-frame radial gradients.
// - Interactive: nodes near the cursor light up & pull toward it; the whole field parallaxes slightly.

function HeroNetworkBG({ className = '', style = {} }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let raf = 0;
    // Cap DPR — a big perf win with no visible loss on the kind of soft glow we're drawing
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);

    let W = 0;
    let H = 0;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      canvas.width = Math.max(1, Math.floor(W * dpr));
      canvas.height = Math.max(1, Math.floor(H * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Seeded pseudo-random for deterministic layout
    let seed = 1337;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Nodes — clustered near center but scattered
    const NODE_COUNT = 55;
    const nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = rand() * Math.PI * 2;
      const r = Math.pow(rand(), 0.7);
      const baseX = 0.5 + Math.cos(angle) * 0.46 * r;
      const baseY = 0.5 + Math.sin(angle) * 0.44 * r;
      nodes.push({
        baseX,
        baseY,
        fx: 0.15 + rand() * 0.35,
        fy: 0.15 + rand() * 0.35,
        px: rand() * Math.PI * 2,
        py: rand() * Math.PI * 2,
        ax: 0.010 + rand() * 0.020,
        ay: 0.010 + rand() * 0.020,
        size: 0.9 + rand() * 1.4,
        pulseOff: rand() * Math.PI * 2,
        pulseSpd: 0.4 + rand() * 0.8,
      });
    }

    // Edges: K-nearest-neighbors (static topology)
    const K = 3;
    const edges = [];
    for (let i = 0; i < nodes.length; i++) {
      const dists = [];
      for (let j = 0; j < nodes.length; j++) {
        if (i === j) continue;
        const dx = nodes[i].baseX - nodes[j].baseX;
        const dy = nodes[i].baseY - nodes[j].baseY;
        dists.push({ j, d: dx * dx + dy * dy });
      }
      dists.sort((a, b) => a.d - b.d);
      for (let k = 0; k < K; k++) {
        const j = dists[k].j;
        if (j > i) edges.push([i, j]);
      }
    }

    // Pre-render a soft radial halo sprite — draw via drawImage for cheap glow
    const haloCanvas = document.createElement('canvas');
    const HALO_SIZE = 64;
    haloCanvas.width = HALO_SIZE;
    haloCanvas.height = HALO_SIZE;
    {
      const hctx = haloCanvas.getContext('2d');
      const g = hctx.createRadialGradient(
        HALO_SIZE / 2,
        HALO_SIZE / 2,
        0,
        HALO_SIZE / 2,
        HALO_SIZE / 2,
        HALO_SIZE / 2
      );
      g.addColorStop(0, 'rgba(180, 220, 255, 0.9)');
      g.addColorStop(0.25, 'rgba(90, 160, 255, 0.35)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0)');
      hctx.fillStyle = g;
      hctx.fillRect(0, 0, HALO_SIZE, HALO_SIZE);
    }

    // Mouse — track inside the wrapper; smooth-follow for parallax
    const target = { x: 0.5, y: 0.5, active: 0 };
    const smooth = { x: 0.5, y: 0.5, active: 0 };
    const onMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = (e.clientY - rect.top) / rect.height;
      target.active = 1;
    };
    const onLeave = () => {
      target.active = 0;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    wrap.addEventListener('pointerleave', onLeave);

    // Throttle to ~60fps but also respect reduced-motion
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Visibility pausing
    let running = true;
    const io = new IntersectionObserver(
      ([entry]) => { running = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(wrap);

    const t0 = performance.now();
    let last = t0;

    const draw = (now) => {
      if (!running) {
        raf = requestAnimationFrame(draw);
        last = now;
        return;
      }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = (now - t0) / 1000;

      // Ease mouse
      const ease = 1 - Math.pow(0.001, dt); // fast but smooth
      smooth.x += (target.x - smooth.x) * ease;
      smooth.y += (target.y - smooth.y) * ease;
      smooth.active += (target.active - smooth.active) * ease;

      const mouseX = smooth.x * W;
      const mouseY = smooth.y * H;
      const parallaxX = (smooth.x - 0.5) * 30; // px
      const parallaxY = (smooth.y - 0.5) * 20;

      ctx.clearRect(0, 0, W, H);

      // Backdrop glow (static gradient once per frame is fine, and smooth)
      const cx = W * 0.5 + parallaxX * 0.4;
      const cy = H * 0.55 + parallaxY * 0.4;
      const rad = Math.max(W, H) * 0.6;
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      bg.addColorStop(0, 'rgba(50, 110, 230, 0.28)');
      bg.addColorStop(0.45, 'rgba(20, 60, 160, 0.10)');
      bg.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);

      // Compute live positions
      const influenceRadius = Math.min(W, H) * 0.28;
      const pos = new Array(nodes.length);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        const timeOffset = reduce ? 0 : t;
        let x = (n.baseX + Math.sin(timeOffset * n.fx + n.px) * n.ax) * W + parallaxX;
        let y = (n.baseY + Math.cos(timeOffset * n.fy + n.py) * n.ay) * H + parallaxY;

        // Cursor attraction
        if (smooth.active > 0) {
          const dx = mouseX - x;
          const dy = mouseY - y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < influenceRadius) {
            const k = (1 - d / influenceRadius) * 14 * smooth.active;
            x += (dx / (d || 1)) * k;
            y += (dy / (d || 1)) * k;
          }
        }
        pos[i] = { x, y, boost: 0 };
      }

      // Recalc boost after positions settle
      for (let i = 0; i < pos.length; i++) {
        const dx = mouseX - pos[i].x;
        const dy = mouseY - pos[i].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        pos[i].boost = smooth.active > 0 && d < influenceRadius ? (1 - d / influenceRadius) : 0;
      }

      // Edges
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e++) {
        const [i, j] = edges[e];
        const a = pos[i];
        const b = pos[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const intensity = Math.max(0, 1 - dist / (Math.max(W, H) * 0.24));
        const boost = Math.max(a.boost, b.boost);
        const alpha = Math.min(0.7, intensity * 0.38 + boost * 0.45);
        if (alpha < 0.015) continue;
        ctx.strokeStyle = `rgba(120, 180, 255, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }

      // Halos via drawImage (cheap additive glow)
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < pos.length; i++) {
        const { x, y, boost } = pos[i];
        const n = nodes[i];
        const pulse = 0.7 + 0.3 * Math.sin(t * n.pulseSpd + n.pulseOff);
        const scale = (5 + boost * 10) * pulse * n.size;
        const s = HALO_SIZE * scale / 8; // tune
        ctx.globalAlpha = 0.55 + boost * 0.45;
        ctx.drawImage(haloCanvas, x - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      // Node cores
      for (let i = 0; i < pos.length; i++) {
        const { x, y, boost } = pos[i];
        const n = nodes[i];
        const pulse = 0.75 + 0.25 * Math.sin(t * n.pulseSpd + n.pulseOff);
        const r = n.size * (0.9 + 0.25 * pulse) * (1 + boost * 0.6);
        ctx.fillStyle = `rgba(235, 245, 255, ${0.85 + boost * 0.15})`;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // A few traveling packets (deterministic) — very cheap
      const PACKETS = 6;
      ctx.globalCompositeOperation = 'lighter';
      for (let k = 0; k < PACKETS; k++) {
        const edgeIdx = (k * 13) % edges.length;
        const [i, j] = edges[edgeIdx];
        const a = pos[i];
        const b = pos[j];
        const phase = (t * 0.35 + k * 0.17) % 1;
        const px = a.x + (b.x - a.x) * phase;
        const py = a.y + (b.y - a.y) * phase;
        const s = 18;
        ctx.globalAlpha = 0.9;
        ctx.drawImage(haloCanvas, px - s / 2, py - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      wrap.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`absolute inset-0 w-full h-full overflow-hidden ${className}`}
      style={{
        // Match the rest of the page so there's no hard color boundary.
        background: '#000',
        ...style,
      }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
    </div>
  );
}

export default HeroNetworkBG;
