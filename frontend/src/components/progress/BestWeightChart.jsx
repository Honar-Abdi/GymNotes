import { useCallback, useEffect, useRef } from 'react';

function LineChart({ points, color, isBodyweight, showReps, canvasRef }) {
  const drawChart = useCallback(() => {
    if (!canvasRef.current || !points || points.length < 2) return;
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

    const minVal = Math.min(...points.map(p => p.value)) * 0.9;
    const maxVal = Math.max(...points.map(p => p.value)) * 1.05;
    const padLeft = 44, padRight = 16, padTop = 20, padBottom = 28;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;

    const toX = i => padLeft + (i / (points.length - 1)) * chartW;
    const toY = v => padTop + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

    // Grid
    [0, 0.5, 1].forEach(pct => {
      const val = minVal + (maxVal - minVal) * pct;
      const y = padTop + chartH - chartH * pct;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#444';
      ctx.font = '10px Barlow, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        showReps ? `${Math.round(val)}` : val >= 1000 ? `${(val/1000).toFixed(1)}t` : `${val.toFixed(0)}`,
        padLeft - 6, y
      );
    });

    // Täyttöalue
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, `${color}26`);
    gradient.addColorStop(1, `${color}00`);

    ctx.beginPath();
    ctx.moveTo(toX(0), padTop + chartH);
    points.forEach((p, i) => ctx.lineTo(toX(i), toY(p.value)));
    ctx.lineTo(toX(points.length - 1), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Viiva
    ctx.beginPath();
    points.forEach((p, i) => {
      i === 0 ? ctx.moveTo(toX(i), toY(p.value)) : ctx.lineTo(toX(i), toY(p.value));
    });
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    const maxVal2 = Math.max(...points.map(p => p.value));

    // Pisteet ja labelit
    points.forEach((p, i) => {
      const x = toX(i);
      const y = toY(p.value);
      const isLast = i === points.length - 1;
      const isFirst = i === 0;
      const isPR = p.value === maxVal2;

      ctx.beginPath();
      ctx.arc(x, y, isLast ? 5 : isPR ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isPR ? color : `${color}80`;
      ctx.fill();

      if (points.length < 10 || isPR || isLast) {
        ctx.fillStyle = color;
        ctx.font = 'bold 11px Barlow Condensed';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        const label = showReps
          ? `${Math.round(p.value)}`
          : p.value >= 1000
          ? `${(p.value / 1000).toFixed(1)}t`
          : `${p.value.toFixed(0)}kg`;
        ctx.fillText(label, x, y - 8);
      }

      if (isFirst || isLast || isPR) {
        ctx.fillStyle = isLast ? color : '#555';
        ctx.font = isLast ? 'bold 9px Barlow Condensed' : '9px Barlow Condensed';
        ctx.textAlign = i === 0 ? 'left' : i === points.length - 1 ? 'right' : 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(p.date.slice(5), x, padTop + chartH + 4);
      }
    });
  }, [points, color, showReps, canvasRef]);

  useEffect(() => {
    const t = setTimeout(drawChart, 50);
    return () => clearTimeout(t);
  }, [drawChart]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const observer = new ResizeObserver(() => drawChart());
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [drawChart]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: 140, display: 'block' }} />;
}

export default function BestWeightChart({ timeline, isBodyweight }) {
  const weightCanvasRef = useRef(null);
  const volumeCanvasRef = useRef(null);

  if (!timeline || timeline.length < 2) return null;

  const weightPoints = timeline
    .map(t => ({
      date: t.date,
      value: isBodyweight ? (t.best_reps ?? 0) : (t.best_weight ?? 0),
    }))
    .filter(p => p.value > 0);

  const volumePoints = timeline
    .map(t => ({
      date: t.date,
      value: t.total_volume ?? 0,
    }))
    .filter(p => p.value > 0);

  return (
    <div style={{
      padding: '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      marginTop: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Paras paino / toistot */}
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>
          {isBodyweight ? 'PARAS TOISTOMÄÄRÄ PER SESSIO' : 'PARAS PAINO PER SESSIO (kg)'}
        </p>
        <LineChart
          points={weightPoints}
          color="#e8ff00"
          isBodyweight={isBodyweight}
          showReps={isBodyweight}
          canvasRef={weightCanvasRef}
        />
      </div>

      {/* Erottaja */}
      <div style={{ height: 1, background: 'var(--border)' }} />

      {/* Volyymi */}
      <div>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>
          {isBodyweight ? 'KOKONAISTOISTOT PER SESSIO' : 'KOKONAISVOLYYMI PER SESSIO (kg)'}
        </p>
        <LineChart
          points={volumePoints}
          color="#00cfff"
          isBodyweight={isBodyweight}
          showReps={isBodyweight}
          canvasRef={volumeCanvasRef}
        />
      </div>
    </div>
  );
}