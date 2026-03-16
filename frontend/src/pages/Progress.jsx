import { useEffect, useState } from 'react';
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

      {/* Liikkeen valinta */}
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

          {/* Trendit */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <TrendBadge pct={s.change_vs_prev_pct} label="e1RM" />
            <TrendBadge pct={s.volume_trend_pct} label="volyymi" />
          </div>

          {/* Kehonpainoliike vs normaali */}
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
              {/* e1RM + paino + volyymi */}
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>VOIMA</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                  <StatCard label="VIIMEISIN e1RM" value={`${s.last_best_e1rm?.toFixed(1)} kg`} sub="arvioitu 1RM" />
                  <StatCard label="PARAS e1RM KOSKAAN" value={`${s.all_time_best_e1rm?.toFixed(1)} kg`} />
                  <StatCard label="PARAS PAINO" value={`${s.all_time_best_weight} kg`} sub="korkein nostettu" />
                </div>
              </div>

              {/* Paras setti */}
              {s.all_time_best_set && (
                <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.8rem', color: 'var(--muted)' }}>
                  Paras setti: <span style={{ color: 'var(--text)' }}>
                    {s.all_time_best_set.weight}kg × {s.all_time_best_set.reps} toistoa
                  </span> — tehty <span style={{ color: 'var(--text)' }}>{s.all_time_best_set.date}</span>
                </div>
              )}
            </>
          )}

          {/* Volyymi */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>VOLYYMI & FREKVENSSI</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              <StatCard label="KOKONAISVOLYYMI" value={`${s.last_volume?.toFixed(0)} ${s.is_bodyweight ? 'toistoa' : 'kg'}`} sub="paino × toistot yhteensä (kaikki setit)" />
              <StatCard label="SESSIOITA YHTEENSÄ" value={s.total_sessions} />
              <StatCard
                label="TREENIVÄLI KA"
                value={s.avg_days_between_sessions ? `${s.avg_days_between_sessions} pv` : '—'}
                sub="päivää sessioiden välillä"
              />
            </div>
          </div>

          {/* RIR */}
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

          {/* Oikea/vasen */}
          {(s.side_best?.right || s.side_best?.left) && (
            <div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>PARAS PER KÄSI</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {s.side_best.right && (
                  <StatCard
                    label="OIKEA KÄSI →"
                    value={`${s.side_best.right.weight} kg`}
                    sub={`× ${s.side_best.right.reps} toistoa — ${s.side_best.right.date}`}
                  />
                )}
                {s.side_best.left && (
                  <StatCard
                    label="VASEN KÄSI ←"
                    value={`${s.side_best.left.weight} kg`}
                    sub={`× ${s.side_best.left.reps} toistoa — ${s.side_best.left.date}`}
                  />
                )}
              </div>
            </div>
          )}

          {/* Plateau */}
          {s.plateau?.plateau && (
            <div style={{ padding: 14, background: '#1a0800', border: '1px solid var(--accent2)', borderRadius: 4, color: 'var(--accent2)', fontSize: '0.85rem' }}>
              ⚠ PLATEAU HAVAITTU — {s.plateau.window} viimeistä sessiota ilman progressia
            </div>
          )}

          {/* Sessiohistoria */}
          <div>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>SESSIOHISTORIA</p>
            {data.timeline.map((t, i) => {
              const prevT = data.timeline[i - 1];
              const volChange = (prevT && prevT.total_volume > 0)? ((t.total_volume - prevT.total_volume) / prevT.total_volume * 100).toFixed(0): null;
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