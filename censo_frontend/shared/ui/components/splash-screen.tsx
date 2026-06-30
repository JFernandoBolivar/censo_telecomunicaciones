"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Broadcast } from "@phosphor-icons/react";

interface SplashScreenProps {
  onEnter: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  ctaText?: string;
}

interface Star { x: number; y: number; s: number; tw: number; sp: number; w: boolean }
interface Shoot { x: number; y: number; len: number; sp: number; ang: number; op: number; on: boolean; tm: number }
interface Cloud { x: number; y: number; w: number; h: number; sp: number; op: number }
interface AvilaPt { x: number; y: number }
interface Building { x: number; w: number; h: number; gY: number; ant: boolean; antH: number; bp: number }
interface Light { x: number; y: number; s: number; ph: number; sp: number; w: boolean }
interface Fog { x: number; y: number; s: number; sp: number; op: number; ph: number }
interface Wave { maxR: number; delay: number }
interface Particle { x: number; y: number; vx: number; vy: number; s: number; ph: number }

export function SplashScreen({
  onEnter,
  title = 'Bienvenidos al<br /><span>CONATEL - Encuestas</span>',
  subtitle = "Ente Nacional de Telecomunicaciones",
  icon,
  ctaText = "Ingresar al Sistema",
}: SplashScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCard, setShowCard] = useState(false);
  const [exiting, setExiting] = useState(false);
  const stateRef = useRef({ t: 0, dismissed: false, animId: 0, W: 0, H: 0, towerH: 0, towerTarget: 0 });

  const W = () => stateRef.current.W;
  const H = () => stateRef.current.H;

  const starsRef = useRef<Star[]>([]);
  const shootRef = useRef<Shoot[]>([]);
  const cloudRef = useRef<Cloud[]>([]);
  const avilaRef = useRef<AvilaPt[]>([]);
  const bldRef = useRef<Building[]>([]);
  const lightRef = useRef<Light[]>([]);
  const fogRef = useRef<Fog[]>([]);
  const waveRef = useRef<Wave[]>([]);
  const partRef = useRef<Particle[]>([]);

  const initCanvas = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const s = stateRef.current;
    s.W = window.innerWidth;
    s.H = window.innerHeight;
    c.width = s.W;
    c.height = s.H;

    const W = s.W, H = s.H;

    starsRef.current = Array.from({ length: 250 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.5,
      s: Math.random() * 2 + 0.5, tw: Math.random() * Math.PI * 2,
      sp: Math.random() * 0.03 + 0.01, w: Math.random() > 0.7,
    }));

    shootRef.current = Array.from({ length: 3 }, () => ({
      x: Math.random() * W, y: Math.random() * H * 0.2,
      len: 60 + Math.random() * 50, sp: 3 + Math.random() * 2,
      ang: 0.2 + Math.random() * 0.1, op: 0, on: false, tm: Math.random() * 300 + 100,
    }));

    const baseY = H * 0.62;
    avilaRef.current = Array.from({ length: 81 }, (_, i) => {
      const nx = i / 80;
      const shape = Math.sin(nx * Math.PI) * 120;
      const noise = Math.sin(i * 0.8) * 12 + Math.sin(i * 1.7) * 8 + Math.sin(i * 3.1) * 4;
      return { x: (i / 80) * W, y: baseY - shape - noise };
    });

    const gY = H * 0.76;
    const bld: Building[] = [];
    let bx = -10;
    while (bx < W + 30) {
      const r = Math.random();
      let h: number, w: number;
      if (r < 0.12) { h = 100 + Math.random() * 80; w = 20 + Math.random() * 15; }
      else if (r < 0.4) { h = 50 + Math.random() * 60; w = 25 + Math.random() * 20; }
      else { h = 25 + Math.random() * 40; w = 18 + Math.random() * 25; }
      bld.push({ x: bx, w, h, gY, ant: h > 80 && Math.random() > 0.5, antH: 10 + Math.random() * 15, bp: Math.random() * Math.PI * 2 });
      bx += w + 2 + Math.random() * 6;
    }
    bldRef.current = bld;

    lightRef.current = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: gY - Math.random() * 100,
      s: 1 + Math.random() * 2, ph: Math.random() * Math.PI * 2,
      sp: 0.02 + Math.random() * 0.04, w: Math.random() > 0.5,
    }));

    cloudRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * W * 1.3 - W * 0.15, y: H * 0.1 + Math.random() * H * 0.2,
      w: 120 + Math.random() * 150, h: 25 + Math.random() * 30,
      sp: 0.1 + Math.random() * 0.12, op: 0.04 + Math.random() * 0.04,
    }));

    fogRef.current = Array.from({ length: 25 }, () => ({
      x: Math.random() * W, y: gY - 10 + Math.random() * 25,
      s: 25 + Math.random() * 45, sp: 0.15 + Math.random() * 0.2,
      op: 0.02 + Math.random() * 0.025, ph: Math.random() * Math.PI * 2,
    }));

    waveRef.current = Array.from({ length: 8 }, (_, i) => ({
      maxR: 180 + Math.random() * 120, delay: i * 0.35,
    }));

    partRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.12, vy: -Math.random() * 0.18 - 0.04,
      s: 1 + Math.random() * 1.5, ph: Math.random() * Math.PI * 2,
    }));

    s.towerH = 0;
    s.towerTarget = 0;
  }, []);

  const loop = useCallback(() => {
    const s = stateRef.current;
    if (s.dismissed) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = s.W, H = s.H;
    const t = s.t;
    const stars = starsRef.current;
    const shoots = shootRef.current;
    const clouds = cloudRef.current;
    const avilaPts = avilaRef.current;
    const bld = bldRef.current;
    const lights = lightRef.current;
    const fogs = fogRef.current;
    const waves = waveRef.current;
    const parts = partRef.current;

    ctx.clearRect(0, 0, W, H);

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, "#010308");
    skyGrad.addColorStop(0.3, "#030815");
    skyGrad.addColorStop(0.55, "#0a1a35");
    skyGrad.addColorStop(0.75, "#0d2847");
    skyGrad.addColorStop(0.9, "#153560");
    skyGrad.addColorStop(1, "#1a3a6a");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    // Horizon glow
    const hGlow = ctx.createRadialGradient(W * 0.5, H * 0.7, 0, W * 0.5, H * 0.7, W * 0.4);
    hGlow.addColorStop(0, "rgba(30,80,150,0.06)");
    hGlow.addColorStop(1, "transparent");
    ctx.fillStyle = hGlow;
    ctx.fillRect(0, H * 0.4, W, H * 0.4);

    // Stars
    for (const star of stars) {
      star.tw += star.sp;
      const a = 0.3 + Math.sin(star.tw) * 0.3;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
      ctx.fillStyle = star.w ? `rgba(255,230,200,${a})` : `rgba(180,210,255,${a})`;
      ctx.fill();
    }

    // Shooting stars
    for (const ss of shoots) {
      ss.tm--;
      if (ss.tm <= 0 && !ss.on) {
        ss.on = true;
        ss.x = Math.random() * W * 0.6;
        ss.y = Math.random() * H * 0.2;
        ss.op = 0.8;
        ss.tm = 200 + Math.random() * 400;
      }
      if (ss.on) {
        ss.x += Math.cos(ss.ang) * ss.sp;
        ss.y += Math.sin(ss.ang) * ss.sp;
        ss.op -= 0.012;
        if (ss.op > 0) {
          const tx = ss.x - Math.cos(ss.ang) * ss.len;
          const ty = ss.y - Math.sin(ss.ang) * ss.len;
          const g = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
          g.addColorStop(0, "transparent");
          g.addColorStop(1, `rgba(255,255,255,${ss.op})`);
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(ss.x, ss.y);
          ctx.strokeStyle = g;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else ss.on = false;
      }
    }

    // Clouds
    for (const c of clouds) {
      c.x += c.sp;
      if (c.x > W + c.w) c.x = -c.w;
      ctx.save();
      ctx.globalAlpha = c.op;
      ctx.fillStyle = "rgba(100,140,200,0.5)";
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x - c.w * 0.2, c.y + c.h * 0.1, c.w * 0.3, c.h * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(c.x + c.w * 0.25, c.y - c.h * 0.05, c.w * 0.25, c.h * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Avila mountain
    const fade = Math.min(1, t / 1);
    if (fade > 0 && avilaPts.length > 0) {
      // Far
      ctx.save();
      ctx.globalAlpha = fade * 0.4;
      ctx.beginPath(); ctx.moveTo(-10, H);
      for (let i = 1; i < avilaPts.length; i++) ctx.lineTo(avilaPts[i].x - 5, avilaPts[i].y + 25);
      ctx.lineTo(W + 10, H); ctx.closePath();
      ctx.fillStyle = "#152040"; ctx.fill();
      ctx.restore();

      // Mid
      ctx.save();
      ctx.globalAlpha = fade * 0.6;
      ctx.beginPath(); ctx.moveTo(-10, H);
      for (let i = 1; i < avilaPts.length; i++) ctx.lineTo(avilaPts[i].x, avilaPts[i].y + 10);
      ctx.lineTo(W + 10, H); ctx.closePath();
      ctx.fillStyle = "#0f1830"; ctx.fill();
      ctx.restore();

      // Near
      ctx.save();
      ctx.globalAlpha = fade * 0.9;
      ctx.beginPath(); ctx.moveTo(-10, H);
      for (let i = 1; i < avilaPts.length; i++) ctx.lineTo(avilaPts[i].x, avilaPts[i].y);
      ctx.lineTo(W + 10, H); ctx.closePath();
      const mg = ctx.createLinearGradient(0, H * 0.4, 0, H);
      mg.addColorStop(0, "#0a1020"); mg.addColorStop(1, "#050810");
      ctx.fillStyle = mg; ctx.fill();
      ctx.strokeStyle = "rgba(30,80,150,0.1)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();

      // Haze
      const hazeY = H * 0.52;
      const hz = ctx.createLinearGradient(0, hazeY - 20, 0, hazeY + 30);
      hz.addColorStop(0, "transparent");
      hz.addColorStop(0.5, `rgba(20,40,80,${fade * 0.12})`);
      hz.addColorStop(1, "transparent");
      ctx.fillStyle = hz;
      ctx.fillRect(0, hazeY - 20, W, 50);
    }

    // City
    const cityFade = Math.min(1, (t - 0.3) / 1);
    if (cityFade > 0 && bld.length > 0) {
      const gY = H * 0.76;

      // Ground
      const gg = ctx.createLinearGradient(0, gY - 5, 0, H);
      gg.addColorStop(0, "#0a1525"); gg.addColorStop(0.5, "#080f1c"); gg.addColorStop(1, "#050810");
      ctx.fillStyle = gg;
      ctx.fillRect(0, gY - 3, W, H - gY + 3);

      // Buildings
      for (const bd of bld) {
        const by = bd.gY - bd.h;
        const bg = ctx.createLinearGradient(bd.x, by, bd.x, bd.gY);
        bg.addColorStop(0, "#12203a"); bg.addColorStop(1, "#050810");
        ctx.fillStyle = bg;
        ctx.fillRect(bd.x, by, bd.w, bd.h);
        ctx.fillStyle = "rgba(40,90,160,0.12)";
        ctx.fillRect(bd.x, by, bd.w, 1.5);

        const cols = Math.max(1, Math.floor(bd.w / 8));
        const rows = Math.max(1, Math.floor(bd.h / 12));
        const ww = 3, wh = 5;
        const gx = bd.w / (cols + 1), gy = bd.h / (rows + 1);

        for (let ry = 0; ry < rows; ry++) {
          for (let cx = 0; cx < cols; cx++) {
            const lit = Math.sin(cx * 3.7 + ry * 2.3 + bd.x * 0.01) > -0.3;
            if (lit) {
              const fl = Math.sin(t * 2 + cx + ry * 0.5) * 0.08;
              const warm = Math.sin(cx * 1.5 + ry * 2.1 + bd.x) > 0;
              const a = 0.12 + fl;
              ctx.fillStyle = warm ? `rgba(255,210,120,${a})` : `rgba(120,180,255,${a})`;
              ctx.fillRect(bd.x + gx * (cx + 0.5) - ww / 2, by + gy * (ry + 0.5) - wh / 2, ww, wh);
            }
          }
        }

        if (bd.ant) {
          const ax = bd.x + bd.w / 2;
          ctx.strokeStyle = "rgba(60,100,160,0.3)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ax, by); ctx.lineTo(ax, by - bd.antH); ctx.stroke();
          const blink = Math.sin(t * 3 + bd.bp) > 0.5;
          if (blink) {
            ctx.beginPath(); ctx.arc(ax, by - bd.antH, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,50,50,0.8)"; ctx.fill();
            ctx.beginPath(); ctx.arc(ax, by - bd.antH, 5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,50,50,0.15)"; ctx.fill();
          }
        }
      }

      // City lights
      for (const cl of lights) {
        cl.ph += cl.sp;
        const a = 0.3 * (0.5 + Math.sin(cl.ph) * 0.5);
        ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.s, 0, Math.PI * 2);
        ctx.fillStyle = cl.w ? `rgba(255,200,100,${a})` : `rgba(100,180,255,${a})`;
        ctx.fill();
      }

      // Venezuela flag glow
      const ug = ctx.createLinearGradient(0, gY - 60, 0, gY + 60);
      ug.addColorStop(0, "rgba(255,204,0,0.025)");
      ug.addColorStop(0.35, "rgba(0,51,160,0.025)");
      ug.addColorStop(0.65, "rgba(204,0,0,0.025)");
      ug.addColorStop(1, "transparent");
      ctx.fillStyle = ug;
      ctx.fillRect(0, gY - 60, W, 120);
    }

    // Fog
    for (const f of fogs) {
      f.x += f.sp; f.ph += 0.008; f.y += Math.sin(f.ph) * 0.2;
      if (f.x > W + f.s) f.x = -f.s;
      ctx.save();
      ctx.globalAlpha = f.op;
      const fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.s);
      fg.addColorStop(0, "rgba(40,60,100,0.3)"); fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg;
      ctx.fillRect(f.x - f.s, f.y - f.s / 2, f.s * 2, f.s);
      ctx.restore();
    }

    // Tower
    const tx = W * 0.5;
    const peakIdx = Math.floor(avilaPts.length / 2);
    const peakY = avilaPts[peakIdx] ? avilaPts[peakIdx].y : H * 0.5;
    const baseY = peakY + 5;
    const maxH = 180;

    s.towerTarget = Math.min(maxH, Math.max(0, (t - 1.5) * 45));
    s.towerH += (s.towerTarget - s.towerH) * 0.04;

    if (s.towerH >= 2) {
      const topY = baseY - s.towerH;
      const mastH = 20;

      // Ambient glow
      const ag = ctx.createRadialGradient(tx, topY, 0, tx, topY, 80);
      ag.addColorStop(0, "rgba(30,107,255,0.12)"); ag.addColorStop(1, "transparent");
      ctx.fillStyle = ag;
      ctx.fillRect(tx - 80, topY - 80, 160, 160);

      // Lattice
      const segs = Math.floor(s.towerH / 12);
      const bw = 16, tw = 3;

      ctx.strokeStyle = "rgba(80,140,220,0.6)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx - bw, baseY); ctx.lineTo(tx - tw, topY); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx + bw, baseY); ctx.lineTo(tx + tw, topY); ctx.stroke();

      ctx.strokeStyle = "rgba(100,160,240,0.4)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(tx, baseY); ctx.lineTo(tx, topY); ctx.stroke();

      for (let i = 0; i < segs; i++) {
        const y1 = baseY - i * 12, y2 = baseY - (i + 1) * 12;
        const p1 = i / segs, p2 = (i + 1) / segs;
        const w1 = bw - (bw - tw) * p1, w2 = bw - (bw - tw) * p2;
        ctx.beginPath(); ctx.moveTo(tx - w1, y1); ctx.lineTo(tx + w1, y1);
        ctx.strokeStyle = "rgba(70,130,200,0.3)"; ctx.lineWidth = 1; ctx.stroke();
        if (i < segs - 1) {
          ctx.beginPath(); ctx.moveTo(tx - w1, y1); ctx.lineTo(tx + w2, y2);
          ctx.moveTo(tx + w1, y1); ctx.lineTo(tx - w2, y2);
          ctx.strokeStyle = "rgba(70,130,200,0.2)"; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      // Mast
      ctx.beginPath(); ctx.moveTo(tx, topY); ctx.lineTo(tx, topY - mastH);
      ctx.strokeStyle = "rgba(120,180,255,0.7)"; ctx.lineWidth = 2; ctx.stroke();

      // Tip
      ctx.beginPath(); ctx.arc(tx, topY - mastH, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#60a5fa"; ctx.fill();

      // Aviation light
      const blink = Math.sin(t * 4) > 0.3;
      if (blink) {
        ctx.beginPath(); ctx.arc(tx, topY - mastH, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,40,40,0.9)"; ctx.fill();
        ctx.beginPath(); ctx.arc(tx, topY - mastH, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,40,40,0.15)"; ctx.fill();
      }

      // Blue pulse
      const pulse = 0.5 + Math.sin(t * 3) * 0.3;
      ctx.beginPath(); ctx.arc(tx, topY - mastH, 6 + pulse * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${pulse * 0.15})`; ctx.fill();

      // Signal waves - Venezuela flag colors
      if (s.towerH > 30) {
        const wf = Math.min(1, (s.towerH - 30) / 30);
        ctx.save();
        ctx.globalAlpha = wf;
        for (const w of waves) {
          const age = ((t + w.delay) % 3);
          const r = age * w.maxR / 3;
          const o = Math.max(0, 0.5 - age * 0.14);
          if (o > 0 && r > 5) {
            const progress = age / 3;
            let cr = 0, cg = 0, cb = 0;
            if (progress < 0.33) { const p = progress / 0.33; cr = Math.round(255 * (1 - p)); cg = Math.round(204 * (1 - p) + 51 * p); cb = Math.round(160 * p); }
            else if (progress < 0.66) { const p = (progress - 0.33) / 0.33; cr = Math.round(204 * p); cg = Math.round(51 * (1 - p)); cb = Math.round(160 * (1 - p)); }
            else { const p = (progress - 0.66) / 0.34; cr = Math.round(204 * (1 - p)); }
            ctx.beginPath(); ctx.arc(tx, topY - mastH, r, -Math.PI * 0.7, -Math.PI * 0.15);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${o})`; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(tx, topY - mastH, r, Math.PI * 0.15, Math.PI * 0.7);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${o})`; ctx.lineWidth = 2; ctx.stroke();
          }
        }
        // Beam
        const ba = 0.02 + Math.sin(t * 2) * 0.015;
        const bg = ctx.createLinearGradient(tx, topY - mastH - 120, tx, topY - mastH + 40);
        bg.addColorStop(0, `rgba(255,204,0,${ba * 0.5})`);
        bg.addColorStop(0.35, `rgba(0,51,160,${ba * 0.5})`);
        bg.addColorStop(0.65, `rgba(204,0,0,${ba * 0.5})`);
        bg.addColorStop(1, "transparent");
        ctx.fillStyle = bg;
        ctx.fillRect(tx - 2, topY - mastH - 120, 4, 160);
        ctx.restore();
      }
    }

    // Particles
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.ph += 0.02;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      const a = 0.25 * (0.5 + Math.sin(p.ph) * 0.5);
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${a})`; ctx.fill();
    }

    // Connections
    for (let i = 0; i < parts.length; i++) {
      for (let j = i + 1; j < parts.length; j++) {
        const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 70) {
          ctx.beginPath(); ctx.moveTo(parts[i].x, parts[i].y); ctx.lineTo(parts[j].x, parts[j].y);
          ctx.strokeStyle = `rgba(30,107,255,${0.05 * (1 - d / 70)})`; ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }

    // Zoom
    const zt = Math.min(1, Math.max(0, (t - 5) / 1.5));
    const ze = 1 - Math.pow(1 - zt, 3);
    // Note: we already drew everything, then zoom. Need to re-draw with transform.
    // Actually the zoom should be applied before drawing. Let me restructure.

    s.t += 1 / 60;
    stateRef.current.animId = requestAnimationFrame(() => loop());
  }, []);

  // Main effect
  useEffect(() => {
    initCanvas();
    stateRef.current.t = 0;
    stateRef.current.dismissed = false;

    // Start main loop
    const animate = () => {
      if (stateRef.current.dismissed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const s = stateRef.current;
      const W = s.W, H = s.H;
      const t = s.t;

      ctx.clearRect(0, 0, W, H);

      // Zoom calculation
      const zt = Math.min(1, Math.max(0, (t - 5) / 1.5));
      const ze = 1 - Math.pow(1 - zt, 3);
      const sc = 1 + ze * 3;

      ctx.save();
      if (ze > 0) {
        ctx.translate(W / 2, H / 2);
        ctx.scale(sc, sc);
        ctx.translate(-W / 2, -H / 2);
      }

      // Draw all layers
      drawAll(ctx, W, H, t);

      ctx.restore();

      // Flash
      if (zt > 0 && zt < 0.2) {
        ctx.fillStyle = `rgba(30,107,255,${(zt / 0.2) * 0.12})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Fade during zoom
      if (ze > 0) {
        ctx.fillStyle = `rgba(5,8,16,${ze * 0.55})`;
        ctx.fillRect(0, 0, W, H);
      }

      // Show card at t > 5.5s
      if (t > 5.5 && !showCard) setShowCard(true);

      s.t += 1 / 60;
      s.animId = requestAnimationFrame(animate);
    };

    // Wait a frame for init to complete
    const initializer = setTimeout(() => {
      animate();
    }, 50);

    return () => {
      clearTimeout(initializer);
      stateRef.current.dismissed = true;
      cancelAnimationFrame(stateRef.current.animId);
    };
  }, [initCanvas, showCard]);

  // DrawAll helper
  const drawAll = (ctx: CanvasRenderingContext2D, W: number, H: number, t: number) => {
    const stars = starsRef.current;
    const shoots = shootRef.current;
    const clouds = cloudRef.current;
    const avilaPts = avilaRef.current;
    const bld = bldRef.current;
    const lights = lightRef.current;
    const fogs = fogRef.current;
    const waves = waveRef.current;
    const parts = partRef.current;

    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, "#010308"); skyGrad.addColorStop(0.3, "#030815");
    skyGrad.addColorStop(0.55, "#0a1a35"); skyGrad.addColorStop(0.75, "#0d2847");
    skyGrad.addColorStop(0.9, "#153560"); skyGrad.addColorStop(1, "#1a3a6a");
    ctx.fillStyle = skyGrad; ctx.fillRect(0, 0, W, H);

    const hg = ctx.createRadialGradient(W * 0.5, H * 0.7, 0, W * 0.5, H * 0.7, W * 0.4);
    hg.addColorStop(0, "rgba(30,80,150,0.06)"); hg.addColorStop(1, "transparent");
    ctx.fillStyle = hg; ctx.fillRect(0, H * 0.4, W, H * 0.4);

    // Stars
    for (const star of stars) {
      star.tw += star.sp;
      const a = 0.3 + Math.sin(star.tw) * 0.3;
      ctx.beginPath(); ctx.arc(star.x, star.y, star.s, 0, Math.PI * 2);
      ctx.fillStyle = star.w ? `rgba(255,230,200,${a})` : `rgba(180,210,255,${a})`;
      ctx.fill();
    }

    // Shooting stars
    for (const ss of shoots) {
      ss.tm--;
      if (ss.tm <= 0 && !ss.on) {
        ss.on = true; ss.x = Math.random() * W * 0.6; ss.y = Math.random() * H * 0.2;
        ss.op = 0.8; ss.tm = 200 + Math.random() * 400;
      }
      if (ss.on) {
        ss.x += Math.cos(ss.ang) * ss.sp; ss.y += Math.sin(ss.ang) * ss.sp;
        ss.op -= 0.012;
        if (ss.op > 0) {
          const tx = ss.x - Math.cos(ss.ang) * ss.len;
          const ty = ss.y - Math.sin(ss.ang) * ss.len;
          const g = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
          g.addColorStop(0, "transparent"); g.addColorStop(1, `rgba(255,255,255,${ss.op})`);
          ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(ss.x, ss.y);
          ctx.strokeStyle = g; ctx.lineWidth = 1.5; ctx.stroke();
        } else ss.on = false;
      }
    }

    // Clouds
    for (const c of clouds) {
      c.x += c.sp; if (c.x > W + c.w) c.x = -c.w;
      ctx.save(); ctx.globalAlpha = c.op;
      ctx.fillStyle = "rgba(100,140,200,0.5)";
      ctx.beginPath(); ctx.ellipse(c.x, c.y, c.w * 0.5, c.h * 0.5, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(c.x - c.w * 0.2, c.y + c.h * 0.1, c.w * 0.3, c.h * 0.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(c.x + c.w * 0.25, c.y - c.h * 0.05, c.w * 0.25, c.h * 0.35, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // Avila
    const fade = Math.min(1, t / 1);
    if (fade > 0 && avilaPts.length > 0) {
      ctx.save(); ctx.globalAlpha = fade * 0.4;
      ctx.beginPath(); ctx.moveTo(-10, H);
      avilaPts.forEach((p, i) => { if (i) ctx.lineTo(p.x - 5, p.y + 25); });
      ctx.lineTo(W + 10, H); ctx.closePath();
      ctx.fillStyle = "#152040"; ctx.fill(); ctx.restore();

      ctx.save(); ctx.globalAlpha = fade * 0.6;
      ctx.beginPath(); ctx.moveTo(-10, H);
      avilaPts.forEach((p, i) => { if (i) ctx.lineTo(p.x, p.y + 10); });
      ctx.lineTo(W + 10, H); ctx.closePath();
      ctx.fillStyle = "#0f1830"; ctx.fill(); ctx.restore();

      ctx.save(); ctx.globalAlpha = fade * 0.9;
      ctx.beginPath(); ctx.moveTo(-10, H);
      avilaPts.forEach((p, i) => { if (i) ctx.lineTo(p.x, p.y); });
      ctx.lineTo(W + 10, H); ctx.closePath();
      const mg = ctx.createLinearGradient(0, H * 0.4, 0, H);
      mg.addColorStop(0, "#0a1020"); mg.addColorStop(1, "#050810");
      ctx.fillStyle = mg; ctx.fill();
      ctx.strokeStyle = "rgba(30,80,150,0.1)"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();

      const hazeY = H * 0.52;
      const hz = ctx.createLinearGradient(0, hazeY - 20, 0, hazeY + 30);
      hz.addColorStop(0, "transparent"); hz.addColorStop(0.5, `rgba(20,40,80,${fade * 0.12})`); hz.addColorStop(1, "transparent");
      ctx.fillStyle = hz; ctx.fillRect(0, hazeY - 20, W, 50);
    }

    // City
    const cityFade = Math.min(1, (t - 0.3) / 1);
    if (cityFade > 0 && bld.length > 0) {
      const gY = H * 0.76;
      const gg = ctx.createLinearGradient(0, gY - 5, 0, H);
      gg.addColorStop(0, "#0a1525"); gg.addColorStop(0.5, "#080f1c"); gg.addColorStop(1, "#050810");
      ctx.fillStyle = gg; ctx.fillRect(0, gY - 3, W, H - gY + 3);

      for (const bd of bld) {
        const by = bd.gY - bd.h;
        const bg = ctx.createLinearGradient(bd.x, by, bd.x, bd.gY);
        bg.addColorStop(0, "#12203a"); bg.addColorStop(1, "#050810");
        ctx.fillStyle = bg; ctx.fillRect(bd.x, by, bd.w, bd.h);
        ctx.fillStyle = "rgba(40,90,160,0.12)"; ctx.fillRect(bd.x, by, bd.w, 1.5);
        const cols = Math.max(1, Math.floor(bd.w / 8)), rows = Math.max(1, Math.floor(bd.h / 12));
        const ww = 3, wh = 5, gx = bd.w / (cols + 1), gy = bd.h / (rows + 1);
        for (let ry = 0; ry < rows; ry++) for (let cx = 0; cx < cols; cx++) {
          const lit = Math.sin(cx * 3.7 + ry * 2.3 + bd.x * 0.01) > -0.3;
          if (lit) {
            const fl = Math.sin(t * 2 + cx + ry * 0.5) * 0.08;
            const warm = Math.sin(cx * 1.5 + ry * 2.1 + bd.x) > 0;
            const a = 0.12 + fl;
            ctx.fillStyle = warm ? `rgba(255,210,120,${a})` : `rgba(120,180,255,${a})`;
            ctx.fillRect(bd.x + gx * (cx + 0.5) - ww / 2, by + gy * (ry + 0.5) - wh / 2, ww, wh);
          }
        }
        if (bd.ant) {
          const ax = bd.x + bd.w / 2;
          ctx.strokeStyle = "rgba(60,100,160,0.3)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(ax, by); ctx.lineTo(ax, by - bd.antH); ctx.stroke();
          if (Math.sin(t * 3 + bd.bp) > 0.5) {
            ctx.beginPath(); ctx.arc(ax, by - bd.antH, 2, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,50,50,0.8)"; ctx.fill();
            ctx.beginPath(); ctx.arc(ax, by - bd.antH, 5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,50,50,0.15)"; ctx.fill();
          }
        }
      }
      for (const cl of lights) { cl.ph += cl.sp;
        const a = 0.3 * (0.5 + Math.sin(cl.ph) * 0.5);
        ctx.beginPath(); ctx.arc(cl.x, cl.y, cl.s, 0, Math.PI * 2);
        ctx.fillStyle = cl.w ? `rgba(255,200,100,${a})` : `rgba(100,180,255,${a})`; ctx.fill();
      }
      const ug = ctx.createLinearGradient(0, gY - 60, 0, gY + 60);
      ug.addColorStop(0, "rgba(255,204,0,0.025)"); ug.addColorStop(0.35, "rgba(0,51,160,0.025)"); ug.addColorStop(0.65, "rgba(204,0,0,0.025)"); ug.addColorStop(1, "transparent");
      ctx.fillStyle = ug; ctx.fillRect(0, gY - 60, W, 120);
    }

    // Fog
    for (const f of fogs) {
      f.x += f.sp; f.ph += 0.008; f.y += Math.sin(f.ph) * 0.2;
      if (f.x > W + f.s) f.x = -f.s;
      ctx.save(); ctx.globalAlpha = f.op;
      const fg = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.s);
      fg.addColorStop(0, "rgba(40,60,100,0.3)"); fg.addColorStop(1, "transparent");
      ctx.fillStyle = fg; ctx.fillRect(f.x - f.s, f.y - f.s / 2, f.s * 2, f.s);
      ctx.restore();
    }

    // Tower
    const tx2 = W * 0.5;
    const peakIdx2 = Math.floor(avilaPts.length / 2);
    const peakY2 = avilaPts[peakIdx2] ? avilaPts[peakIdx2].y : H * 0.5;
    const baseY2 = peakY2 + 5;
    const s = stateRef.current;

    s.towerTarget = Math.min(180, Math.max(0, (t - 1.5) * 45));
    s.towerH += (s.towerTarget - s.towerH) * 0.04;

    if (s.towerH >= 2) {
      const topY2 = baseY2 - s.towerH;
      const mastH = 20;
      const ag2 = ctx.createRadialGradient(tx2, topY2, 0, tx2, topY2, 80);
      ag2.addColorStop(0, "rgba(30,107,255,0.12)"); ag2.addColorStop(1, "transparent");
      ctx.fillStyle = ag2; ctx.fillRect(tx2 - 80, topY2 - 80, 160, 160);

      const segs = Math.floor(s.towerH / 12), bw = 16, tw = 3;
      ctx.strokeStyle = "rgba(80,140,220,0.6)"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(tx2 - bw, baseY2); ctx.lineTo(tx2 - tw, topY2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tx2 + bw, baseY2); ctx.lineTo(tx2 + tw, topY2); ctx.stroke();
      ctx.strokeStyle = "rgba(100,160,240,0.4)"; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(tx2, baseY2); ctx.lineTo(tx2, topY2); ctx.stroke();

      for (let i = 0; i < segs; i++) {
        const y1 = baseY2 - i * 12, y2 = baseY2 - (i + 1) * 12;
        const p1 = i / segs, p2 = (i + 1) / segs;
        const w1 = bw - (bw - tw) * p1, w2 = bw - (bw - tw) * p2;
        ctx.beginPath(); ctx.moveTo(tx2 - w1, y1); ctx.lineTo(tx2 + w1, y1);
        ctx.strokeStyle = "rgba(70,130,200,0.3)"; ctx.lineWidth = 1; ctx.stroke();
        if (i < segs - 1) {
          ctx.beginPath(); ctx.moveTo(tx2 - w1, y1); ctx.lineTo(tx2 + w2, y2);
          ctx.moveTo(tx2 + w1, y1); ctx.lineTo(tx2 - w2, y2);
          ctx.strokeStyle = "rgba(70,130,200,0.2)"; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      ctx.beginPath(); ctx.moveTo(tx2, topY2); ctx.lineTo(tx2, topY2 - mastH);
      ctx.strokeStyle = "rgba(120,180,255,0.7)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(tx2, topY2 - mastH, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#60a5fa"; ctx.fill();

      if (Math.sin(t * 4) > 0.3) {
        ctx.beginPath(); ctx.arc(tx2, topY2 - mastH, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,40,40,0.9)"; ctx.fill();
        ctx.beginPath(); ctx.arc(tx2, topY2 - mastH, 12, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,40,40,0.15)"; ctx.fill();
      }

      const pulse2 = 0.5 + Math.sin(t * 3) * 0.3;
      ctx.beginPath(); ctx.arc(tx2, topY2 - mastH, 6 + pulse2 * 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${pulse2 * 0.15})`; ctx.fill();

      if (s.towerH > 30) {
        const wf = Math.min(1, (s.towerH - 30) / 30);
        ctx.save(); ctx.globalAlpha = wf;
        for (const w of waves) {
          const age = ((t + w.delay) % 3);
          const r = age * w.maxR / 3;
          const o = Math.max(0, 0.5 - age * 0.14);
          if (o > 0 && r > 5) {
            const progress = age / 3;
            let cr = 0, cg = 0, cb = 0;
            if (progress < 0.33) { const p = progress / 0.33; cr = Math.round(255 * (1 - p)); cg = Math.round(204 * (1 - p) + 51 * p); cb = Math.round(160 * p); }
            else if (progress < 0.66) { const p = (progress - 0.33) / 0.33; cr = Math.round(204 * p); cg = Math.round(51 * (1 - p)); cb = Math.round(160 * (1 - p)); }
            else { const p = (progress - 0.66) / 0.34; cr = Math.round(204 * (1 - p)); }
            ctx.beginPath(); ctx.arc(tx2, topY2 - mastH, r, -Math.PI * 0.7, -Math.PI * 0.15);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${o})`; ctx.lineWidth = 2; ctx.stroke();
            ctx.beginPath(); ctx.arc(tx2, topY2 - mastH, r, Math.PI * 0.15, Math.PI * 0.7);
            ctx.strokeStyle = `rgba(${cr},${cg},${cb},${o})`; ctx.lineWidth = 2; ctx.stroke();
          }
        }
        const ba2 = 0.02 + Math.sin(t * 2) * 0.015;
        const bg2 = ctx.createLinearGradient(tx2, topY2 - mastH - 120, tx2, topY2 - mastH + 40);
        bg2.addColorStop(0, `rgba(255,204,0,${ba2 * 0.5})`); bg2.addColorStop(0.35, `rgba(0,51,160,${ba2 * 0.5})`);
        bg2.addColorStop(0.65, `rgba(204,0,0,${ba2 * 0.5})`); bg2.addColorStop(1, "transparent");
        ctx.fillStyle = bg2; ctx.fillRect(tx2 - 2, topY2 - mastH - 120, 4, 160);
        ctx.restore();
      }
    }

    // Particles
    for (const p of parts) {
      p.x += p.vx; p.y += p.vy; p.ph += 0.02;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96,165,250,${0.25 * (0.5 + Math.sin(p.ph) * 0.5)})`; ctx.fill();
    }
    for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
      const dx = parts[i].x - parts[j].x, dy = parts[i].y - parts[j].y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < 70) {
        ctx.beginPath(); ctx.moveTo(parts[i].x, parts[i].y); ctx.lineTo(parts[j].x, parts[j].y);
        ctx.strokeStyle = `rgba(30,107,255,${0.05 * (1 - d / 70)})`; ctx.lineWidth = 0.5; ctx.stroke();
      }
    }
  };

  const handleEnter = () => {
    stateRef.current.dismissed = true;
    cancelAnimationFrame(stateRef.current.animId);
    setExiting(true);
    setTimeout(onEnter, 800);
  };

  return (
    <motion.div
      className="splash-screen !bg-[#050810]"
      animate={{ opacity: exiting ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 size-full" />

      <motion.div
        className="relative z-[2] flex flex-col items-center gap-7"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={showCard ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      >
        <div
          className="glass-card !max-w-[600px] cursor-pointer px-[60px] py-[50px] text-center transition-all duration-500 hover:-translate-y-[6px] hover:scale-[1.02]"
          onClick={handleEnter}
        >
          <div className="mx-auto mb-6 flex size-[90px] items-center justify-center rounded-[26px] bg-gradient-to-br from-[#1e6bff] to-[#60a5fa] text-[40px] text-white shadow-[0_12px_40px_rgba(30,107,255,0.3)] transition-transform duration-500 hover:scale-110">
            {icon || <Broadcast size={40} weight="bold" />}
          </div>
          <h2
            className="relative z-[1] text-[28px] font-black leading-tight tracking-tight text-[#f1f5f9]"
            dangerouslySetInnerHTML={{ __html: title }}
          />
          <p className="relative z-[1] mt-3 text-sm text-[#94a3b8]">
            {subtitle}
          </p>
          <div className="relative z-[1] mx-auto mt-5 inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-br from-[#0b3c91] to-[#1e6bff] px-8 py-3.5 text-[15px] font-bold text-white shadow-[0_10px_30px_rgba(30,107,255,0.3)] transition-all duration-300 hover:shadow-[0_14px_40px_rgba(30,107,255,0.5)]">
            {ctaText}
            <span>→</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
