// @ts-nocheck
'use client';

import React, { useEffect, useRef } from 'react';

// CtaNetworkBG — companion to HeroNetworkBG but a different composition.
// Hero is a scattered node-field; this is a "convergence": concentric orbital
// rings of particles drifting around a glowing central nexus, with slow radiating
// light beams. Same cyan/white palette, same additive glow, different feeling.

function CtaNetworkBG({ className = '', style = {} }) {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(1.5, window.devicePixelRatio || 1);

    let W = 0, H = 0;
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

    // Seeded rand
    let seed = 9157;
    const rand = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Orbital rings — each has its own radius factor, tilt, particle count
    const RINGS = [
      { rFactor: 0.18, tilt: 0.15, count: 14, speed: 0.06, size: 1.2 },
      { rFactor: 0.30, tilt: -0.22, count: 22, speed: -0.04, size: 1.0 },
      { rFactor: 0.44, tilt: 0.08, count: 34, speed: 0.028, size: 0.9 },
      { rFactor: 0.60, tilt: -0.05, count: 48, speed: -0.018, size: 0.75 },
      { rFactor: 0.78, tilt: 0.02, count: 64, speed: 0.011, size: 0.6 },
    ];
    const rings = RINGS.map((r) => {
      const pts = [];
      for (let i = 0; i < r.count; i++) {
        pts.push({
          a: (i / r.count) * Math.PI * 2 + rand() * 0.3,
          pulseOff: rand() * Math.PI * 2,
          pulseSpd: 0.5 + rand() * 1.2,
        });
      }
      return { ...r, pts };
    });

    // Radiating beams — long thin light rays extending out from center
    const BEAM_COUNT = 5;
    const beams = [];
    for (let i = 0; i < BEAM_COUNT; i++) {
      beams.push({
        a: rand() * Math.PI * 2,
        speed: (rand() - 0.5) * 0.015,
        phase: rand() * Math.PI * 2,
        len: 0.55 + rand() * 0.3,
      });
    }

    // Slow-wandering bright particles ("packets") that travel along rings
    const PACKETS = 8;
    const packets = [];
    for (let i = 0; i < PACKETS; i++) {
      packets.push({
        ring: Math.floor(rand() * rings.length),
        a: rand() * Math.PI * 2,
        speed: 0.12 + rand() * 0.2,
        dir: rand() > 0.5 ? 1 : -1,
      });
    }

    // Mouse parallax — very subtle
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
    const io = new IntersectionObserver(
      ([entry]) => { inView = entry.isIntersecting; },
      { threshold: 0 }
    );
    io.observe(wrap);

    const start = performance.now();

    const render = (now) => {
      if (!running) return;
      raf = requestAnimationFrame(render);
      if (!inView) return;
      const t = (now - start) / 1000;

      // Ease mouse
      mouse.x += (mouse.tx - mouse.x) * 0.04;
      mouse.y += (mouse.ty - mouse.y) * 0.04;
      const parX = (mouse.x - 0.5) * 18;
      const parY = (mouse.y - 0.5) * 14;

      ctx.clearRect(0, 0, W, H);

      // Deep field wash
      const g = ctx.createRadialGradient(
        W * 0.5 + parX * 0.6, H * 0.5 + parY * 0.6, 0,
        W * 0.5, H * 0.5, Math.max(W, H) * 0.85
      );
      g.addColorStop(0, 'rgba(28, 60, 130, 0.22)');
      g.addColorStop(0.55, 'rgba(7, 18, 45, 0.6)');
      g.addColorStop(1, 'rgba(0, 0, 0, 0.96)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      const cx = W * 0.5 + parX;
      const cy = H * 0.5 + parY;
      const baseR = Math.min(W, H) * 0.55;

      // --- Radiating beams (additive) ---
      ctx.globalCompositeOperation = 'lighter';
      for (const b of beams) {
        const a = b.a + b.speed * t * 8;
        const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.8 + b.phase));
        const len = baseR * b.len * pulse;
        const x2 = cx + Math.cos(a) * len;
        const y2 = cy + Math.sin(a) * len;
        const grad = ctx.createLinearGradient(cx, cy, x2, y2);
        grad.addColorStop(0, `rgba(200, 225, 255, ${0.5 * pulse})`);
        grad.addColorStop(0.4, `rgba(140, 190, 255, ${0.18 * pulse})`);
        grad.addColorStop(1, 'rgba(60, 110, 200, 0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }
      ctx.globalCompositeOperation = 'source-over';

      // --- Orbital rings: faint path + particles ---
      for (const ring of rings) {
        const r = baseR * ring.rFactor;
        // Ellipse tilt — fake perspective
        const rx = r;
        const ry = r * (1 - Math.abs(ring.tilt) * 1.2);
        // Faint ring stroke
        ctx.strokeStyle = 'rgba(140, 190, 255, 0.07)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, ring.tilt, 0, Math.PI * 2);
        ctx.stroke();
      }

      // --- Particles on rings (additive glow) ---
      ctx.globalCompositeOperation = 'lighter';
      for (const ring of rings) {
        const r = baseR * ring.rFactor;
        const rx = r;
        const ry = r * (1 - Math.abs(ring.tilt) * 1.2);
        for (const p of ring.pts) {
          const a = p.a + ring.speed * t;
          // Apply tilt rotation
          const lx = Math.cos(a) * rx;
          const ly = Math.sin(a) * ry;
          const cos = Math.cos(ring.tilt);
          const sin = Math.sin(ring.tilt);
          const x = cx + lx * cos - ly * sin;
          const y = cy + lx * sin + ly * cos;
          // Pulse
          const pulse = 0.7 + 0.3 * Math.sin(t * p.pulseSpd + p.pulseOff);
          const size = ring.size * pulse;
          // Glow halo
          const rg = ctx.createRadialGradient(x, y, 0, x, y, size * 8);
          rg.addColorStop(0, `rgba(220, 235, 255, ${0.75 * pulse})`);
          rg.addColorStop(0.4, `rgba(140, 190, 255, ${0.22 * pulse})`);
          rg.addColorStop(1, 'rgba(30, 60, 130, 0)');
          ctx.fillStyle = rg;
          ctx.beginPath();
          ctx.arc(x, y, size * 8, 0, Math.PI * 2);
          ctx.fill();
          // Hot core
          ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * pulse})`;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // --- Fast packets — brighter dots racing around rings ---
      for (const pk of packets) {
        const ring = rings[pk.ring];
        const r = baseR * ring.rFactor;
        const rx = r;
        const ry = r * (1 - Math.abs(ring.tilt) * 1.2);
        const a = pk.a + pk.dir * (ring.speed + pk.speed) * t;
        const lx = Math.cos(a) * rx;
        const ly = Math.sin(a) * ry;
        const cos = Math.cos(ring.tilt);
        const sin = Math.sin(ring.tilt);
        const x = cx + lx * cos - ly * sin;
        const y = cy + lx * sin + ly * cos;
        // Trail
        const trailA = a - pk.dir * 0.22;
        const tlx = Math.cos(trailA) * rx;
        const tly = Math.sin(trailA) * ry;
        const tx = cx + tlx * cos - tly * sin;
        const ty = cy + tlx * sin + tly * cos;
        const tg = ctx.createLinearGradient(tx, ty, x, y);
        tg.addColorStop(0, 'rgba(180, 215, 255, 0)');
        tg.addColorStop(1, 'rgba(220, 240, 255, 0.9)');
        ctx.strokeStyle = tg;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(x, y);
        ctx.stroke();
        // Head
        const rg = ctx.createRadialGradient(x, y, 0, x, y, 10);
        rg.addColorStop(0, 'rgba(255, 255, 255, 1)');
        rg.addColorStop(0.4, 'rgba(180, 215, 255, 0.5)');
        rg.addColorStop(1, 'rgba(60, 110, 200, 0)');
        ctx.fillStyle = rg;
        ctx.beginPath();
        ctx.arc(x, y, 10, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- Central nexus: big soft glow + pulsing core ---
      {
        const pulse = 0.78 + 0.22 * Math.sin(t * 1.3);
        // Outer halo
        const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, baseR * 0.35);
        halo.addColorStop(0, `rgba(200, 225, 255, ${0.55 * pulse})`);
        halo.addColorStop(0.3, `rgba(120, 170, 255, ${0.22 * pulse})`);
        halo.addColorStop(1, 'rgba(10, 30, 80, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 0.35, 0, Math.PI * 2);
        ctx.fill();
        // Inner ring
        ctx.strokeStyle = `rgba(200, 225, 255, ${0.55 * pulse})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(cx, cy, baseR * 0.08, 0, Math.PI * 2);
        ctx.stroke();
        // Core
        ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * pulse})`;
        ctx.beginPath();
        ctx.arc(cx, cy, 2.6 * pulse, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      // --- Subtle grain ---
      ctx.globalAlpha = 0.04;
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
      }
      ctx.globalAlpha = 1;
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
      {/* faint horizontal grain stripes — texture */}
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

export default CtaNetworkBG;
