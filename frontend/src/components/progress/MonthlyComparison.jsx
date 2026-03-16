import MonthlyChart from './MonthlyChart';

export default function MonthlyComparison({ data, isBodyweight }) {
  if (!data || data.length === 0) return null;

  return (
    <div style={{ padding: '16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 16 }}>
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
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.85rem', fontWeight: isLatest ? 700 : 400, color: isLatest ? 'var(--accent)' : 'var(--text)' }}>
                {m.month}
              </span>
              <div>
                <div style={{ fontSize: '0.6rem', color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>
                  {isBodyweight ? 'SETTIÄ' : 'PARAS PAINO'}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {isBodyweight ? m.total_sets : `${m.best_weight}kg`}
                  {m.weight_change_pct != null && (
                    <span style={{ fontSize: '0.65rem', marginLeft: 4, color: m.weight_change_pct > 0 ? 'var(--success)' : m.weight_change_pct < 0 ? 'var(--accent2)' : 'var(--muted)' }}>
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
                  {m.total_volume >= 1000 ? `${(m.total_volume / 1000).toFixed(1)}t` : `${m.total_volume}kg`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}