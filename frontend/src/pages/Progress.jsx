import { useCallback, useEffect, useRef, useState } from 'react';
import { getExercises, getProgress } from '../api';

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      padding: '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
    }}>
      <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--muted)' }}>{label}</div>
      <div style={{ fontSize: '1.3rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: color || 'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{sub}</div>}
    </div>
  );
}

function TrendBadge({ pct, label }) {
  if (pct == null) return null;
  const positive = pct > 0;
  const neutral = pct === 0;
  return (
    <span style={{
      fontSize: '0.75rem',
      fontFamily: 'var(--font-display)',
      fontWeight: 700,
      color: neutral ? 'var(--muted)' : positive ? 'var(--success)' : 'var(--accent2)',
      background: neutral ? '#1a1a1a' : positive ? '#001a0d' : '#1a0800',
      border: `1px solid ${neutral ? 'var(--border)' : positive ? 'var(--success)' : 'var(--accent2)'}`,
      padding: '2px 8px',
      borderRadius: 3,
    }}>
      {positive ? '▲' : pct < 0 ? '▼' : '='} {positive ? '+' : ''}{pct}% {label}
    </span>
  );
}

function MonthlyChart({ data, isBodyweight }) {
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
    const padLeft = 40;
    const padRight = 12;
    const padTop = 24;
    const padBottom = 32;
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

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 140, display: 'block' }}
    />
  );
}

function MonthlyComparison({ data, isBodyweight }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{
      padding: '16px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 4,
    }}>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        color: 'var(--muted)',
        marginBottom: 16,
      }}>
        KUUKAUSIVERTAILU
      </p>

      <MonthlyChart data={data} isBodyweight={isBodyweight} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 16 }}>
        {[...data].reverse().map((m, i) => {
          const isLatest = i === 0;
          return (
            <div key={m.month} style={{
              padding: '10px 14px',
              background: isLatest ? 'rgba(232,255,0,0.04)' : 'var(--surface2)',
              border: `1px solid ${isLatest ? 'rgba(232,255,0,0.3)' : 'var(--border)'}`,
              borderRadius: 4,
              display: 'grid',
              gridTemplateColumns: '80px 1fr 1fr 1fr',
              gap: 8,
              alignItems: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.85rem',
                fontWeight: isLatest ? 700 : 400,
                color: isLatest ? 'var(--accent)' : 'var(--text)',
              }}>
                {m.month}
              </span>

              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>
                  {isBodyweight ? 'SETTIÄ' : 'PARAS PAINO'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {isBodyweight ? m.total_sets : `${m.best_weight}kg`}
                  {m.weight_change_pct != null && (
                    <span style={{
                      fontSize: '0.65rem',
                      marginLeft: 4,
                      color: m.weight_change_pct > 0 ? 'var(--success)' : m.weight_change_pct < 0 ? 'var(--accent2)' : 'var(--muted)',
                    }}>
                      {m.weight_change_pct > 0 ? '+' : ''}{m.weight_change_pct}%
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>SESSIOITA</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>{m.sessions}</div>
              </div>

              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>VOLYYMI</div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {m.total_volume >= 1000
                    ? `${(m.total_volume / 1000).toFixed(1)}t`
                    : `${m.total_volume}kg`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Progress() {
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  async function load(ex) {
    setSelected(ex); setData(null); setLoading(true);
    const d = await getProgress(ex);
    setData(d); setLoading(false);
  }

  const s = data?.summary;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>

      <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
        VALITSE LIIKE
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {exercises.map(ex => (
          <button key={ex} onClick={() => load(ex)} style={{
            padding: '8px 16px',
            background: selected === ex ? 'var(--accent)' : 'var(--surface)',
            color: selected === ex ? '#000' : 'var(--text)',
            border: `1px solid ${selected === ex ? 'var(--accent)' : 'var(--border)'}`,
            borderRadius: 3, fontSize: '0.8rem',
          }}>{ex}</button>
        ))}
      </div>

      {loading && <p style={{ color: 'var(--muted)' }}>Ladataan...</p>}

      {s && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <TrendBadge pct={s.change_vs_prev_pct} label="e1RM" />
            <TrendBadge pct={s.volume_trend_pct} label="volyymi" />
          </div>

          {s.is_bodyweight ? (
            <>
              <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.75rem', color: 'var(--muted)' }}>
                Kehonpainoliike — seurataan toistomäärää
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <StatCard label="VIIMEISIN PARAS" value={`${s.last_best_reps ?? '—'} toistoa`} />
                <StatCard label="ALL TIME PARAS" value={`${s.all_time_best_reps ?? '—'} toistoa`} />
                <StatCard label="SESSIOITA" value={s.total_sessions} />
              </div>
              {s.all_time_best_weight && (
                <StatCard label="PARAS LISÄPAINO" value={`${s.all_time_best_weight} kg`} sub="korkein nostettu lisäpaino" />
              )}
            </>
          ) : (
            <>
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>VOIMA</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <StatCard label="VIIMEISIN e1RM" value={`${s.last_best_e1rm?.toFixed(1)} kg`} sub="arvioitu 1RM" />
                  <StatCard label="PARAS e1RM KOSKAAN" value={`${s.all_time_best_e1rm?.toFixed(1)} kg`} />
                  <StatCard label="PARAS PAINO" value={`${s.all_time_best_weight} kg`} sub="korkein nostettu" />
                </div>
              </div>
              {s.all_time_best_set && (
                <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Paras setti: <span style={{ color: 'var(--text)' }}>
                    {s.all_time_best_set.weight}kg × {s.all_time_best_set.reps} toistoa
                  </span> — tehty <span style={{ color: 'var(--text)' }}>{s.all_time_best_set.date}</span>
                </div>
              )}
            </>
          )}

          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>VOLYYMI & FREKVENSSI</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <StatCard label="KOKONAISVOLYYMI" value={`${s.last_volume?.toFixed(0)} ${s.is_bodyweight ? 'toistoa' : 'kg'}`} sub="paino × toistot yhteensä (kaikki setit)" />
              <StatCard label="SESSIOITA YHTEENSÄ" value={s.total_sessions} />
              <StatCard label="TREENIVÄLI KA" value={s.avg_days_between_sessions ? `${s.avg_days_between_sessions} pv` : '—'} sub="päivää sessioiden välillä" />
            </div>
          </div>

          {s.last_avg_rir != null && (
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>INTENSITEETTI</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <StatCard
                  label="VIIMEISIN KA RIR"
                  value={s.last_avg_rir}
                  sub="reps in reserve — 0 = max"
                  color={s.last_avg_rir <= 1 ? 'var(--accent2)' : s.last_avg_rir <= 2 ? 'var(--accent)' : 'var(--text)'}
                />
                <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
                  <div style={{ fontSize: '0.65rem', fontFamily: 'var(--font-display)', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>INTENSITEETTI</div>
                  <div style={{ height: 6, background: 'var(--surface2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(0, Math.min(100, (1 - s.last_avg_rir / 5) * 100))}%`,
                      background: s.last_avg_rir <= 1 ? 'var(--accent2)' : 'var(--accent)',
                      borderRadius: 3,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted)', marginTop: 4 }}>
                    {s.last_avg_rir <= 1 ? 'Erittäin kova' : s.last_avg_rir <= 2 ? 'Kova' : s.last_avg_rir <= 3 ? 'Kohtalainen' : 'Helppo'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(s.side_best?.right || s.side_best?.left) && (
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>PARAS PER KÄSI</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {s.side_best.right && <StatCard label="OIKEA KÄSI →" value={`${s.side_best.right.weight} kg`} sub={`× ${s.side_best.right.reps} toistoa — ${s.side_best.right.date}`} />}
                {s.side_best.left && <StatCard label="VASEN KÄSI ←" value={`${s.side_best.left.weight} kg`} sub={`× ${s.side_best.left.reps} toistoa — ${s.side_best.left.date}`} />}
              </div>
            </div>
          )}

          {s.plateau?.plateau && (
            <div style={{ padding: 14, background: '#1a0800', border: '1px solid var(--accent2)', borderRadius: 4, color: 'var(--accent2)', fontSize: '0.85rem' }}>
              PLATEAU HAVAITTU — {s.plateau.window} viimeistä sessiota ilman progressia
            </div>
          )}

          {data.monthly_comparison && (
            <MonthlyComparison
              data={data.monthly_comparison}
              isBodyweight={s.is_bodyweight}
            />
          )}

          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>SESSIOHISTORIA</p>
            {data.timeline.map((t, i) => {
              const prevT = data.timeline[i - 1];
              const volChange = (prevT && prevT.total_volume > 0)
                ? ((t.total_volume - prevT.total_volume) / prevT.total_volume * 100).toFixed(0)
                : null;
              return (
                <div key={t.date} style={{
                  padding: '12px 14px', marginBottom: 4,
                  background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t.date}</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{t.set_count} settiä</span>
                      {!s.is_bodyweight && (
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>
                          {t.best_e1rm.toFixed(1)} <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 400 }}>e1RM</span>
                        </span>
                      )}
                      {s.is_bodyweight && (
                        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>
                          {t.best_reps ?? '—'}<span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 400 }}>toistoa</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
                    <span>Vol: <span style={{ color: 'var(--text)' }}>{t.total_volume.toFixed(0)} {s.is_bodyweight ? 'toistoa' : 'kg'}</span>
                      {volChange != null && (
                        <span style={{ color: volChange > 0 ? 'var(--success)' : 'var(--accent2)', marginLeft: 6 }}>
                          {volChange > 0 ? '+' : ''}{volChange}%
                        </span>
                      )}
                    </span>
                    {t.avg_rir != null && <span>RIR: <span style={{ color: 'var(--text)' }}>{t.avg_rir}</span></span>}
                    {!s.is_bodyweight && t.best_weight && <span>Paras: <span style={{ color: 'var(--text)' }}>{t.best_weight}kg</span></span>}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}