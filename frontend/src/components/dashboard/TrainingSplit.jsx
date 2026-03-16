import { useEffect, useRef } from 'react';

const TYPE_COLORS = {
  'Yläkroppa': '#e8ff00',
  'Alakroppa': '#00ff88',
  'Muu': '#444',
};

function getColor(name) {
  return TYPE_COLORS[name] || '#888';
}

function DonutChart({ data, size = 120 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);

    const total = data.reduce((sum, d) => sum + d.count, 0);
    const cx = size / 2;
    const cy = size / 2;
    const radius = size / 2 - 8;
    const innerRadius = radius * 0.6;

    let startAngle = -Math.PI / 2;

    data.forEach(({ name, count }) => {
      const slice = (count / total) * Math.PI * 2;
      const color = getColor(name);

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, startAngle + slice);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      startAngle += slice;
    });

    // Sisäympyrä — reikä donitsiiin
    ctx.beginPath();
    ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#050505';
    ctx.fill();

    // Keskellä total
    ctx.fillStyle = '#f0f0f0';
    ctx.font = `700 ${size * 0.18}px 'Barlow Condensed', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 6);

    ctx.fillStyle = '#555';
    ctx.font = `400 ${size * 0.1}px 'Barlow', sans-serif`;
    ctx.fillText('sessiota', cx, cy + 10);

  }, [data, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, display: 'block' }}
    />
  );
}

export default function TrainingSplit({ data }) {
  if (!data || data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div style={{
      padding: '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 4,
    }}
    className="card-accent-top"
    >
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        color: 'var(--muted)',
        marginBottom: 16,
      }}>
        TREENIJAKO — TÄMÄ KUUKAUSI
      </p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        {/* Donitsi */}
        <DonutChart data={data} size={110} />

        {/* Selite */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
          {data.map(({ name, count }) => (
            <div key={name}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 4,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: 2,
                    background: getColor(name),
                  }} />
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '0.75rem',
                    color: 'var(--text)',
                  }}>
                    {name}
                  </span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: getColor(name),
                }}>
                  {count} / {total}
                </span>
              </div>
              {/* Edistymispalkki */}
              <div style={{
                height: 4,
                background: 'var(--surface2)',
                borderRadius: 2,
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${(count / total) * 100}%`,
                  background: getColor(name),
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}