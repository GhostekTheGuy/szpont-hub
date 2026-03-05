"use client";

import { useEffect, useRef } from "react";

export function AnimatedFavicon() {
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let faviconLink = document.querySelector<HTMLLinkElement>(
      'link[rel="icon"]'
    );
    if (!faviconLink) {
      faviconLink = document.createElement("link");
      faviconLink.rel = "icon";
      faviconLink.type = "image/png";
      document.head.appendChild(faviconLink);
    }

    const DURATION = 3500;

    // Content bounding box in original 240-space
    const CX = 50, CY = 55, CW = 140, CH = 115;
    const PAD = 2;
    const AVAIL = 64 - PAD * 2;
    const SC = Math.min(AVAIL / CW, AVAIL / CH);
    const OX = PAD + (AVAIL - CW * SC) / 2;
    const OY = PAD + (AVAIL - CH * SC) / 2;
    const MAX_CLIP = 300;

    function easeOutCubic(x: number) {
      return 1 - Math.pow(1 - x, 3);
    }

    function drawFrame(timestamp: number) {
      rafRef.current = requestAnimationFrame(drawFrame);

      const progress = (timestamp % DURATION) / DURATION;

      ctx!.clearRect(0, 0, 64, 64);

      // Global transform: map original coords → maximized canvas
      ctx!.save();
      ctx!.translate(OX, OY);
      ctx!.scale(SC, SC);
      ctx!.translate(-CX, -CY);

      // White bars
      ctx!.fillStyle = "#FFFFFF";
      const baseLine = 170;
      const bars = [
        { x: 60, h: 40, startDelay: 0.0 },
        { x: 88, h: 70, startDelay: 0.05 },
        { x: 116, h: 60, startDelay: 0.1 },
        { x: 144, h: 100, startDelay: 0.15 },
      ];

      bars.forEach((bar) => {
        let m = 0;
        if (progress < 0.9) {
          let p = (progress - bar.startDelay) / 0.2;
          p = Math.max(0, Math.min(1, p));
          m = easeOutCubic(p);
        } else {
          let p = (progress - 0.9) / 0.1;
          m = 1 - Math.max(0, Math.min(1, p));
        }
        const currentH = bar.h * m;
        ctx!.fillRect(bar.x, baseLine - currentH, 18, currentH);
      });

      // Arrow clip width in original coords
      let clipWidth = 0;
      if (progress < 0.15) {
        clipWidth = 0;
      } else if (progress < 0.65) {
        const t = (progress - 0.15) / 0.5;
        clipWidth = easeOutCubic(t) * MAX_CLIP;
      } else if (progress < 0.9) {
        clipWidth = MAX_CLIP;
      } else {
        const t = (progress - 0.9) / 0.1;
        clipWidth = (1 - t) * MAX_CLIP;
      }

      ctx!.save();

      // Rotated clip mask
      ctx!.save();
      ctx!.translate(50, 135);
      ctx!.rotate(-45 * (Math.PI / 180));
      ctx!.translate(-50, -135);
      ctx!.beginPath();
      ctx!.rect(0, -150, clipWidth, 400);
      ctx!.restore();
      ctx!.clip();

      // Erase gap where arrow passes through bars
      ctx!.globalCompositeOperation = "destination-out";
      ctx!.strokeStyle = "rgba(0,0,0,1)";
      ctx!.lineWidth = 26;
      ctx!.lineCap = "butt";
      ctx!.lineJoin = "miter";
      ctx!.miterLimit = 4;

      ctx!.beginPath();
      ctx!.moveTo(50, 135);
      ctx!.lineTo(90, 95);
      ctx!.lineTo(120, 125);
      ctx!.lineTo(170, 75);
      ctx!.stroke();

      ctx!.lineWidth = 14;
      ctx!.beginPath();
      ctx!.moveTo(150, 55);
      ctx!.lineTo(190, 55);
      ctx!.lineTo(190, 95);
      ctx!.closePath();
      ctx!.fill();
      ctx!.stroke();

      // Draw purple arrow
      ctx!.globalCompositeOperation = "source-over";
      ctx!.strokeStyle = "#9353FF";
      ctx!.lineWidth = 12;
      ctx!.lineCap = "butt";
      ctx!.lineJoin = "miter";

      ctx!.beginPath();
      ctx!.moveTo(50, 135);
      ctx!.lineTo(90, 95);
      ctx!.lineTo(120, 125);
      ctx!.lineTo(170, 75);
      ctx!.stroke();

      ctx!.fillStyle = "#9353FF";
      ctx!.beginPath();
      ctx!.moveTo(150, 55);
      ctx!.lineTo(190, 55);
      ctx!.lineTo(190, 95);
      ctx!.closePath();
      ctx!.fill();

      ctx!.restore();
      ctx!.restore();

      faviconLink!.href = canvas.toDataURL("image/png");
    }

    rafRef.current = requestAnimationFrame(drawFrame);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return null;
}
