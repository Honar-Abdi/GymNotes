export default function SessionHistory({ timeline, isBodyweight }) {
  if (!timeline || timeline.length === 0) return null;

  return (
    <>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 10 }}>SESSIOHISTORIA</p>
      {timeline.map((t, i) => {
        const prevT = timeline[i - 1];
        const volChange = (prevT && prevT.total_volume > 0)
          ? ((t.total_volume - prevT.total_volume) / prevT.total_volume * 100).toFixed(0)
          : null;
        return (
          <div key={t.date} style={{
            padding: '12px 14px',
            marginBottom: 4,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 3,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{t.date}</span>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{t.set_count} settiä</span>
                {!isBodyweight && t.best_e1rm != null && (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>
                    {t.best_e1rm.toFixed(1)} <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 400 }}>e1RM</span>
                  </span>
                )}
                {isBodyweight && (
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--accent)' }}>
                    {t.best_reps ?? '—'}<span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 400 }}>toistoa</span>
                  </span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--muted)' }}>
              <span>Vol: <span style={{ color: 'var(--text)' }}>{t.total_volume?.toFixed(0) ?? '0'} {isBodyweight ? 'toistoa' : 'kg'}</span>
                {volChange != null && (
                  <span style={{ color: volChange > 0 ? 'var(--success)' : 'var(--accent2)', marginLeft: 6 }}>
                    {volChange > 0 ? '+' : ''}{volChange}%
                  </span>
                )}
              </span>
              {t.avg_rir != null && <span>RIR: <span style={{ color: 'var(--text)' }}>{t.avg_rir}</span></span>}
              {!isBodyweight && t.best_weight && <span>Paras: <span style={{ color: 'var(--text)' }}>{t.best_weight}kg</span></span>}
            </div>
          </div>
        );
      })}
    </>
  );
}