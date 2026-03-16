export default function StreakBar({ streak }) {
  if (!streak) return null;

  const { sessions_this_month, total_sessions, avg_days_between } = streak;
  const monthName = new Date().toLocaleString('fi-FI', { month: 'long' });

  // Viikkotavoite
  const WEEKLY_GOAL = 4;
  const sessionsThisWeek = streak.sessions_this_week ?? 0;
  const weekPct = Math.min(100, Math.round((sessionsThisWeek / WEEKLY_GOAL) * 100));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

      {/* Viikkotavoite */}
      <div style={{
        padding: '16px',
        background: 'var(--surface)',
        border: `1px solid ${weekPct >= 100 ? 'var(--success)' : 'var(--border)'}`,
        borderRadius: 4,
      }}
      className="card-accent-top"
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}>
            VIIKKOTAVOITE
          </p>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.85rem',
            fontWeight: 700,
            color: weekPct >= 100 ? 'var(--success)' : 'var(--text)',
          }}>
            {sessionsThisWeek} / {WEEKLY_GOAL}
            {weekPct >= 100 && ' ✓'}
          </span>
        </div>

        {/* Progressiopalkki */}
        <div style={{
          height: 8,
          background: 'var(--surface2)',
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 8,
        }}>
          <div style={{
            height: '100%',
            width: `${weekPct}%`,
            background: weekPct >= 100
              ? 'var(--success)'
              : weekPct >= 75
              ? 'var(--accent)'
              : weekPct >= 50
              ? 'rgba(232,255,0,0.6)'
              : 'rgba(232,255,0,0.3)',
            borderRadius: 4,
            transition: 'width 0.8s ease',
          }} />
        </div>

        {/* 4 pistettä */}
        <div style={{ display: 'flex', gap: 6 }}>
          {Array.from({ length: WEEKLY_GOAL }).map((_, i) => (
            <div key={i} style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              background: i < sessionsThisWeek
                ? weekPct >= 100 ? 'var(--success)' : 'var(--accent)'
                : 'var(--surface2)',
              border: `1px solid ${i < sessionsThisWeek ? 'transparent' : 'var(--border)'}`,
              transition: 'background 0.3s ease',
            }} />
          ))}
        </div>

        <p style={{
          fontSize: '0.68rem',
          color: weekPct >= 100 ? 'var(--success)' : 'var(--muted)',
          marginTop: 8,
          fontFamily: 'var(--font-display)',
        }}>
          {weekPct >= 100
            ? 'VIIKKOTAVOITE SAAVUTETTU!'
            : `${WEEKLY_GOAL - sessionsThisWeek} TREENIÄ JÄLJELLÄ TÄLLÄ VIIKOLLA`}
        </p>
      </div>

      {/* Statsit */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 10,
      }}>
        <div style={{
          padding: '14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 4,
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
            {monthName.toUpperCase()}
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>
            {sessions_this_month}
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
              sessiota
            </span>
          </p>
        </div>

        <div style={{
          padding: '14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 4,
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
            TREENIVÄLI KA
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>
            {avg_days_between ?? '—'}
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
              pv
            </span>
          </p>
        </div>

        <div style={{
          padding: '14px',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 4,
        }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.65rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
            YHTEENSÄ
          </p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, lineHeight: 1 }}>
            {total_sessions}
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)', fontWeight: 400, marginLeft: 4 }}>
              sessiota
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}