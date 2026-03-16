import { useEffect, useRef } from 'react';

function Sparkline({ data, width = 120, height = 32 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length < 2) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const values = data.map(d => d.weight);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;

    const xStep = width / (values.length - 1);

    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, 'rgba(232, 255, 0, 0.3)');
    gradient.addColorStop(1, 'rgba(232, 255, 0, 0)');

    ctx.beginPath();
    values.forEach((v, i) => {
      const x = i * xStep;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo((values.length - 1) * xStep, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.beginPath();
    values.forEach((v, i) => {
      const x = i * xStep;
      const y = height - ((v - min) / range) * (height - 4) - 2;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(232, 255, 0, 0.8)';
    ctx.lineWidth = 1.5;
    ctx.lineJoin = 'round';
    ctx.stroke();

    const lastX = (values.length - 1) * xStep;
    const lastY = height - ((values[values.length - 1] - min) / range) * (height - 4) - 2;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#e8ff00';
    ctx.fill();

  }, [data, width, height]);

  if (!data || data.length < 2) return null;

  return <canvas ref={canvasRef} style={{ width, height, display: 'block' }} />;
}

export default function PRCard({ pr, index = 0 }) {
  const { exercise, weight, reps, date, is_recent, sparkline } = pr;

  const trend = sparkline && sparkline.length >= 2
    ? sparkline[sparkline.length - 1].weight - sparkline[sparkline.length - 2].weight
    : null;

  return (
    <div
      className={`card-hover card-accent-top slide-up slide-up-${Math.min(index + 1, 5)}`}
      style={{
        padding: '14px',
        background: 'var(--surface)',
        border: `1px solid ${is_recent ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        position: 'relative',
        cursor: 'default',
      }}
    >
      {is_recent && (
        <span
          className="pr-badge"
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            fontSize: '0.6rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.08em',
            color: '#000',
            background: 'var(--accent)',
            padding: '2px 6px',
            borderRadius: 3,
          }}
        >
          PR
        </span>
      )}

      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        color: 'var(--muted)',
        paddingRight: is_recent ? 32 : 0,
      }}>
        {exercise.toUpperCase()}
      </p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--text)',
          lineHeight: 1,
        }}>
          {weight}
          <span style={{
            fontSize: '0.75rem',
            color: 'var(--muted)',
            fontWeight: 400,
            marginLeft: 4,
          }}>
            kg
          </span>
        </p>

        {trend !== null && trend !== 0 && (
          <span style={{
            fontSize: '0.7rem',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: trend > 0 ? 'var(--success)' : 'var(--accent2)',
          }}>
            {trend > 0 ? '▲' : '▼'} {Math.abs(trend).toFixed(1)}
          </span>
        )}
      </div>

      {sparkline && sparkline.length >= 2 && (
        <div style={{ margin: '4px 0' }}>
          <Sparkline data={sparkline} width={160} height={28} />
        </div>
      )}

      <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
        {weight}kg × {reps} — {date}
      </p>
    </div>
  );
}