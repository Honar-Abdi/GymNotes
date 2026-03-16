import { useEffect, useRef, useCallback } from 'react';

export default function WeeklyVolume({ data }) {
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

    const values = data.map(d => d.sets);
    const max = Math.max(...values);
    const padLeft = 36;
    const padRight = 12;
    const padTop = 12;
    const padBottom = 32;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;
    const barWidth = (chartW / values.length) * 0.5;
    const gap = chartW / values.length;

    // Y-akselilinjat — näytä kokonaisluvut
    const yTicks = max <= 4 ? [1, 2, 3, 4] : [
      Math.round(max * 0.25),
      Math.round(max * 0.5),
      Math.round(max * 0.75),
      max
    ];

    yTicks.forEach(tick => {
      const y = padTop + chartH - (tick / max) * chartH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#666';
      ctx.font = '10px Barlow, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${tick}`, padLeft - 6, y);
    });

    // Pylväät
    values.forEach((v, i) => {
      const x = padLeft + i * gap + gap / 2 - barWidth / 2;
      const barH = Math.max((v / max) * chartH, 2);
      const y = padTop + chartH - barH;
      const isLast = i === values.length - 1;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
      gradient.addColorStop(0, isLast ? 'rgba(232,255,0,1)' : 'rgba(232,255,0,0.6)');
      gradient.addColorStop(1, isLast ? 'rgba(232,255,0,0.4)' : 'rgba(232,255,0,0.15)');

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 3);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Arvo pylvään päällä
      ctx.fillStyle = isLast ? '#e8ff00' : '#888';
      ctx.font = isLast
        ? 'bold 11px Barlow Condensed, sans-serif'
        : '10px Barlow Condensed, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${v}`, x + barWidth / 2, y - 2);

      // Viikon label
      const weekDate = new Date(data[i].week);
      const label = `${weekDate.getDate()}.${weekDate.getMonth() + 1}`;
      ctx.fillStyle = isLast ? '#e8ff00' : '#555';
      ctx.font = isLast
        ? 'bold 10px Barlow Condensed, sans-serif'
        : '10px Barlow Condensed, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + barWidth / 2, padTop + chartH + 8);
    });

  }, [data]);

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

  if (!data || data.length === 0) return null;

  const thisWeekSets = data[data.length - 1]?.sets ?? 0;

  return (
    <div style={{
      padding: '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 4,
    }}
    className="card-accent-top"
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: 'var(--muted)',
        }}>
          SETTIÄ / VIIKKO — 6 VKO
        </p>
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          fontWeight: 700,
          color: 'var(--accent)',
        }}>
          {thisWeekSets} settiä
        </span>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: 140,
          display: 'block',
        }}
      />
    </div>
  );
}