import { useCallback, useEffect, useRef } from 'react';

export default function MonthlyChart({ data, isBodyweight }) {
  const canvasRef = useRef(null);

  const drawChart = useCallback(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (W === 0 || H === 0) return;

    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    const values = data.map(d => isBodyweight ? d.total_sets : d.best_weight);
    const max = Math.max(...values);
    const padLeft = 40, padRight = 12, padTop = 24, padBottom = 32;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;
    const barWidth = (chartW / values.length) * 0.5;
    const gap = chartW / values.length;

    [0.5, 1].forEach(pct => {
      const y = padTop + chartH - chartH * pct;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#555';
      ctx.font = '10px Barlow, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(max * pct)}`, padLeft - 6, y);
    });

    values.forEach((v, i) => {
      const x = padLeft + i * gap + gap / 2 - barWidth / 2;
      const barH = Math.max((v / max) * chartH, 2);
      const y = padTop + chartH - barH;
      const isLast = i === values.length - 1;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
      gradient.addColorStop(0, isLast ? 'rgba(232,255,0,1)' : 'rgba(232,255,0,0.6)');
      gradient.addColorStop(1, isLast ? 'rgba(232,255,0,0.3)' : 'rgba(232,255,0,0.1)');

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 3);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.fillStyle = isLast ? '#e8ff00' : '#888';
      ctx.font = isLast ? 'bold 11px Barlow Condensed' : '10px Barlow Condensed';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${v}${isBodyweight ? '' : 'kg'}`, x + barWidth / 2, y - 2);

      const parts = data[i].month.split('-');
      const label = `${parts[1]}/${parts[0].slice(2)}`;
      ctx.fillStyle = isLast ? '#e8ff00' : '#555';
      ctx.font = isLast ? 'bold 10px Barlow Condensed' : '10px Barlow Condensed';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + barWidth / 2, padTop + chartH + 8);
    });
  }, [data, isBodyweight]);

  useEffect(() => {
    const timeout = setTimeout(drawChart, 50);
    return () => clearTimeout(timeout);
  }, [drawChart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => drawChart());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawChart]);

  if (!data || data.length < 2) return null;

  return <canvas ref={canvasRef} style={{ width: '100%', height: 140, display: 'block' }} />;
}