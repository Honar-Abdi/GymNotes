import { useCallback, useEffect, useRef } from 'react';
import StatCard from './StatCard';

// Nopeuden kehitys — viivakaavio täyttöalueella
function SpeedTrendChart({ data }) {
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

    const speeds = data.map(d => d.speed);
    const minVal = Math.min(...speeds) * 0.95;
    const maxVal = Math.max(...speeds) * 1.05;
    const padLeft = 44, padRight = 16, padTop = 20, padBottom = 32;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;

    const toX = i => padLeft + (i / (data.length - 1)) * chartW;
    const toY = v => padTop + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;

    // Grid
    [0, 0.25, 0.5, 0.75, 1].forEach(pct => {
      const val = minVal + (maxVal - minVal) * pct;
      const y = padTop + chartH - chartH * pct;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(W - padRight, y);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.lineWidth = 1;
      ctx.stroke();
      if (pct === 0 || pct === 0.5 || pct === 1) {
        ctx.fillStyle = '#444';
        ctx.font = '10px Barlow, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${val.toFixed(1)}`, padLeft - 6, y);
      }
    });

    // Täyttöalue
    const gradient = ctx.createLinearGradient(0, padTop, 0, padTop + chartH);
    gradient.addColorStop(0, 'rgba(34,197,94,0.2)');
    gradient.addColorStop(1, 'rgba(34,197,94,0)');

    ctx.beginPath();
    ctx.moveTo(toX(0), padTop + chartH);
    data.forEach((d, i) => ctx.lineTo(toX(i), toY(d.speed)));
    ctx.lineTo(toX(data.length - 1), padTop + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Viiva
    ctx.beginPath();
    data.forEach((d, i) => {
      const x = toX(i);
      const y = toY(d.speed);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();

    // Pisteet ja labelit
    data.forEach((d, i) => {
      const x = toX(i);
      const y = toY(d.speed);
      const isLast = i === data.length - 1;
      const isFirst = i === 0;

      ctx.beginPath();
      ctx.arc(x, y, isLast ? 5 : 3, 0, Math.PI * 2);
      ctx.fillStyle = isLast ? '#22c55e' : 'rgba(34,197,94,0.5)';
      ctx.fill();

      if (isLast) {
        ctx.fillStyle = '#22c55e';
        ctx.font = 'bold 11px Barlow Condensed';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`${d.speed.toFixed(1)}`, x, y - 8);
      }

      if (isFirst || isLast || data.length <= 6) {
        ctx.fillStyle = isLast ? '#22c55e' : '#555';
        ctx.font = isLast ? 'bold 9px Barlow Condensed' : '9px Barlow Condensed';
        ctx.textAlign = i === 0 ? 'left' : i === data.length - 1 ? 'right' : 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(d.date.slice(5), x, padTop + chartH + 6);
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

  return <canvas ref={canvasRef} style={{ width: '100%', height: 160, display: 'block' }} />;
}

// Kuukausittainen kilometrimäärä — pylväskaavio
function MonthlyKmChart({ data }) {
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

    const values = data.map(d => d.km);
    const max = Math.max(...values);
    const padLeft = 44, padRight = 16, padTop = 24, padBottom = 32;
    const chartW = W - padLeft - padRight;
    const chartH = H - padTop - padBottom;
    const barWidth = (chartW / values.length) * 0.5;
    const gap = chartW / values.length;

    [0.5, 1].forEach(pct => {
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
      ctx.fillText(`${(max * pct).toFixed(0)}`, padLeft - 6, y);
    });

    values.forEach((v, i) => {
      const x = padLeft + i * gap + gap / 2 - barWidth / 2;
      const barH = Math.max((v / max) * chartH, 2);
      const y = padTop + chartH - barH;
      const isLast = i === values.length - 1;

      const gradient = ctx.createLinearGradient(0, y, 0, y + barH);
      gradient.addColorStop(0, isLast ? 'rgba(34,197,94,1)' : 'rgba(34,197,94,0.5)');
      gradient.addColorStop(1, isLast ? 'rgba(34,197,94,0.3)' : 'rgba(34,197,94,0.1)');

      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 3);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.fillStyle = isLast ? '#22c55e' : '#666';
      ctx.font = isLast ? 'bold 11px Barlow Condensed' : '10px Barlow Condensed';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${v.toFixed(0)}km`, x + barWidth / 2, y - 2);

      const parts = data[i].month.split('-');
      const label = `${parts[1]}/${parts[0].slice(2)}`;
      ctx.fillStyle = isLast ? '#22c55e' : '#555';
      ctx.font = isLast ? 'bold 10px Barlow Condensed' : '10px Barlow Condensed';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(label, x + barWidth / 2, padTop + chartH + 8);
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

  return <canvas ref={canvasRef} style={{ width: '100%', height: 150, display: 'block' }} />;
}

// Laske kuukausittainen data
function buildMonthlyData(data) {
  const map = {};
  data.forEach(d => {
    const month = d.date.slice(0, 7);
    if (!map[month]) map[month] = { month, km: 0, sessions: 0, totalMin: 0 };
    map[month].km += d.distance_km;
    map[month].sessions += 1;
    map[month].totalMin += d.duration_min;
  });
  return Object.values(map).sort((a, b) => a.month.localeCompare(b.month));
}

export default function CardioStats({ data }) {
  if (!data || data.length === 0) return null;

  const speeds = data.map(d => d.distance_km / (d.duration_min / 60));
  const distances = data.map(d => d.distance_km);
  const durations = data.map(d => d.duration_min);

  const bestSpeed = Math.max(...speeds).toFixed(1);
  const avgSpeed = (speeds.reduce((a, b) => a + b, 0) / speeds.length).toFixed(1);
  const longestRun = Math.max(...distances).toFixed(1);
  const totalKm = distances.reduce((a, b) => a + b, 0).toFixed(1);
  const totalSessions = data.length;
  const avgDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);

  // Trendi — viimeisin vs edellinen nopeus
  const speedTrend = speeds.length >= 2
    ? (((speeds[speeds.length - 1] - speeds[speeds.length - 2]) / speeds[speeds.length - 2]) * 100).toFixed(1)
    : null;

  const chartData = [...data]
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      date: d.date,
      speed: parseFloat((d.distance_km / (d.duration_min / 60)).toFixed(2)),
      distance: d.distance_km,
    }));

  const monthlyData = buildMonthlyData(data);
  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const monthKmChange = prevMonth
    ? (((currentMonth.km - prevMonth.km) / prevMonth.km) * 100).toFixed(1)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Päästatistiikat */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatCard label="PARAS NOPEUS" value={`${bestSpeed} km/h`} />
        <StatCard label="KA NOPEUS" value={`${avgSpeed} km/h`} />
        <StatCard label="KM YHTEENSÄ" value={`${totalKm} km`} sub={`${totalSessions} sessiota`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatCard label="PISIN LENKKI" value={`${longestRun} km`} />
        <StatCard label="KA KESTO" value={`${avgDuration} min`} />
        {speedTrend != null && (
          <div style={{
            padding: '16px',
            background: 'var(--surface)',
            border: `1px solid ${parseFloat(speedTrend) >= 0 ? 'var(--success)' : 'var(--accent2)'}`,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
          }}>
            <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--muted)' }}>NOPEUSTRENDI</div>
            <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: parseFloat(speedTrend) >= 0 ? 'var(--success)' : 'var(--accent2)' }}>
              {parseFloat(speedTrend) >= 0 ? '▲' : '▼'} {Math.abs(speedTrend)}%
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>viimeisin vs edellinen</div>
          </div>
        )}
      </div>

      {/* Nopeuden kehitys */}
      {chartData.length >= 2 && (
        <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>
            NOPEUDEN KEHITYS (km/h)
          </p>
          <SpeedTrendChart data={chartData} />
        </div>
      )}

      {/* Kuukausittainen volyymi */}
      {monthlyData.length >= 1 && (
        <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
              KUUKAUSITTAINEN VOLYYMI (km)
            </p>
            {monthKmChange != null && (
              <span style={{
                fontSize: '0.7rem',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: parseFloat(monthKmChange) >= 0 ? 'var(--success)' : 'var(--accent2)',
                background: parseFloat(monthKmChange) >= 0 ? '#001a0d' : '#1a0800',
                border: `1px solid ${parseFloat(monthKmChange) >= 0 ? 'var(--success)' : 'var(--accent2)'}`,
                padding: '2px 8px',
                borderRadius: 3,
              }}>
                {parseFloat(monthKmChange) >= 0 ? '▲' : '▼'} {Math.abs(monthKmChange)}% vs edellinen kk
              </span>
            )}
          </div>
          <MonthlyKmChart data={monthlyData} />

          {/* Kuukausikortti */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {[...monthlyData].reverse().map((m, i) => {
              const isLatest = i === 0;
              const avgSpeedMonth = (m.km / (m.totalMin / 60)).toFixed(1);
              return (
                <div key={m.month} style={{
                  padding: '10px 14px',
                  background: isLatest ? 'rgba(34,197,94,0.04)' : 'var(--surface2)',
                  border: `1px solid ${isLatest ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                  borderRadius: 4,
                  display: 'grid',
                  gridTemplateColumns: '80px 1fr 1fr 1fr',
                  gap: 8,
                  alignItems: 'center',
                }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: isLatest ? 700 : 400, color: isLatest ? 'var(--success)' : 'var(--text)' }}>
                    {m.month}
                  </span>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>KM</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{m.km.toFixed(1)}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>SESSIOITA</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{m.sessions}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>KA NOPEUS</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{avgSpeedMonth} km/h</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sessiohistoria */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 6 }}>
          SESSIOHISTORIA
        </p>
        {[...data].sort((a, b) => b.date.localeCompare(a.date)).map((d, i) => {
          const speed = (d.distance_km / (d.duration_min / 60)).toFixed(1);
          const hours = Math.floor(d.duration_min / 60);
          const mins = d.duration_min % 60;
          const durationStr = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
          const prevSession = [...data].sort((a, b) => a.date.localeCompare(b.date));
          const idx = prevSession.findIndex(x => x.date === d.date && x.distance_km === d.distance_km);
          const prev = prevSession[idx - 1];
          const prevSpeed = prev ? (prev.distance_km / (prev.duration_min / 60)) : null;
          const speedDiff = prevSpeed ? (parseFloat(speed) - prevSpeed).toFixed(1) : null;

          return (
            <div key={i} style={{
              padding: '12px 14px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{d.date}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{durationStr}</span>
              </div>
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>MATKA</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{d.distance_km} km</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>NOPEUS</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--success)' }}>
                    {speed} km/h
                    {speedDiff != null && (
                      <span style={{ fontSize: '0.7rem', marginLeft: 4, color: parseFloat(speedDiff) >= 0 ? 'var(--success)' : 'var(--accent2)' }}>
                        {parseFloat(speedDiff) >= 0 ? '+' : ''}{speedDiff}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}