import { useCallback, useEffect, useRef } from 'react';
import StatCard from './StatCard';

function WeightChart({ data }) {
  const canvasRef = useRef(null);

  const drawChart = useCallback(() => {
    if (!canvasRef.current || !data || data.length < 2) return;
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

    const values = data.map(d => d.weight_kg);
    const minVal = Math.min(...values) * 0.995;
    const maxVal = Math.max(...values) * 1.005;
    const padLeft = 44, padRight = 16, padTop = 20, padBottom = 28;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;

    const toX = i => padLeft + (i / (data.length - 1)) * chartW;
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
      ctx.fillText(`${val.toFixed(1)}`, padLeft - 6, y);
    });

    // Täyttöalue
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, 'rgba(212,232,0,0.15)');
    gradient.addColorStop(1, 'rgba(212,232,0,0)');

    ctx.beginPath();
    ctx.moveTo(toX(0), padTop + chartH);
    data.forEach((d, i) => ctx.lineTo(toX(i), toY(d.weight_kg)));
    ctx.lineTo(toX(data.length - 1), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Viiva
    ctx.beginPath();
    data.forEach((d, i) => {
      i === 0 ? ctx.moveTo(toX(i), toY(d.weight_kg)) : ctx.lineTo(toX(i), toY(d.weight_kg));
    });
    ctx.strokeStyle = 'rgba(212,232,0,0.8)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Pisteet
    data.forEach((d, i) => {
      const x = toX(i);
      const y = toY(d.weight_kg);
      const isLast = i === data.length - 1;
      const isFirst = i === 0;

      ctx.beginPath();
      ctx.arc(x, y, isLast ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isLast ? '#e8ff00' : 'rgba(212,232,0,0.4)';
      ctx.fill();

      if (isFirst || isLast) {
        ctx.fillStyle = isLast ? '#e8ff00' : '#555';
        ctx.font = isLast ? 'bold 11px Barlow Condensed' : '10px Barlow Condensed';
        ctx.textAlign = i === 0 ? 'left' : 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${d.weight_kg}kg`, x, y - 8);

        ctx.fillStyle = isLast ? '#e8ff00' : '#555';
        ctx.font = isLast ? 'bold 9px Barlow Condensed' : '9px Barlow Condensed';
        ctx.textAlign = i === 0 ? 'left' : 'right';
        ctx.textBaseline = 'top';
        ctx.fillText(d.date.slice(5), x, padTop + chartH + 4);
      }
    });
  }, [data]);

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

  return <canvas ref={canvasRef} style={{ width: '100%', height: 180, display: 'block' }} />;
}

export default function WeightStats({ data }) {
  if (!data || data.length === 0) return (
    <p style={{ color: 'var(--muted)' }}>Ei painomerkintöjä vielä. Kirjaa aamupaino Kirjaa-sivulta.</p>
  );

  const latest = data[data.length - 1];
  const oldest = data[0];

  // Viikko sitten
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weekAgoStr = oneWeekAgo.toISOString().slice(0, 10);
  const weekAgoEntry = [...data].reverse().find(d => d.date <= weekAgoStr);
  const weekChange = weekAgoEntry
    ? parseFloat((latest.weight_kg - weekAgoEntry.weight_kg).toFixed(1))
    : null;

  // Kuukausi sitten
  const oneMonthAgo = new Date();
  oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
  const monthAgoStr = oneMonthAgo.toISOString().slice(0, 10);
  const monthAgoEntry = [...data].reverse().find(d => d.date <= monthAgoStr);
  const monthChange = monthAgoEntry
    ? parseFloat((latest.weight_kg - monthAgoEntry.weight_kg).toFixed(1))
    : null;

  const totalChange = parseFloat((latest.weight_kg - oldest.weight_kg).toFixed(1));

  function changeColor(val) {
    if (val === null) return 'var(--text)';
    if (val > 0) return 'var(--accent2)';
    if (val < 0) return 'var(--success)';
    return 'var(--muted)';
  }

  function changeLabel(val) {
    if (val === null) return '—';
    return `${val > 0 ? '+' : ''}${val} kg`;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Pääkortit */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatCard
          label="NYKYINEN PAINO"
          value={`${latest.weight_kg} kg`}
          sub={latest.date}
        />
        <StatCard
          label="MUUTOS 7 PV"
          value={changeLabel(weekChange)}
          color={changeColor(weekChange)}
          sub={weekAgoEntry ? `vs ${weekAgoEntry.date}` : 'ei dataa'}
        />
        <StatCard
          label="MUUTOS 30 PV"
          value={changeLabel(monthChange)}
          color={changeColor(monthChange)}
          sub={monthAgoEntry ? `vs ${monthAgoEntry.date}` : 'ei dataa'}
        />
      </div>

      {/* Kaavio */}
      {data.length >= 2 && (
        <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>
            PAINOKÄYRÄ (kg)
          </p>
          <WeightChart data={data} />
        </div>
      )}

      {/* Kokonaismuutos */}
      {data.length >= 2 && (
        <div style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          border: `1px solid ${totalChange < 0 ? 'var(--success)' : totalChange > 0 ? 'var(--accent2)' : 'var(--border)'}`,
          borderRadius: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
              KOKONAISMUUTOS
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {oldest.date} → {latest.date}
            </div>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.2rem',
            color: changeColor(totalChange),
          }}>
            {changeLabel(totalChange)}
          </span>
        </div>
      )}

      {/* Historia */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>
          HISTORIA
        </p>
        {[...data].reverse().map((d, i) => {
          const prev = [...data].reverse()[i + 1];
          const diff = prev ? parseFloat((d.weight_kg - prev.weight_kg).toFixed(1)) : null;
          return (
            <div key={d.id} style={{
              padding: '10px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{d.date}</span>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {diff !== null && (
                  <span style={{ fontSize: '0.75rem', color: changeColor(diff) }}>
                    {diff > 0 ? '+' : ''}{diff} kg
                  </span>
                )}
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>
                  {d.weight_kg} kg
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}