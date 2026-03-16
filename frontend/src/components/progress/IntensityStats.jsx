import StatCard from './StatCard';

export default function IntensityStats({ s }) {
  if (s.last_avg_rir == null) return null;

  return (
    <>
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
    </>
  );
}