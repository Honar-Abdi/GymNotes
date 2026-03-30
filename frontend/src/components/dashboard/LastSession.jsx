export default function LastSession({ lastSession }) {
  if (!lastSession) return null;

  const { date, name, exercises, best_set, set_count, prev_same_volume } = lastSession;

  const daysAgo = Math.floor(
    (new Date() - new Date(date)) / (1000 * 60 * 60 * 24)
  );
  const daysLabel = daysAgo === 0 ? 'Tänään' : daysAgo === 1 ? 'Eilen' : `${daysAgo} pv sitten`;

  const volumeChange = prev_same_volume?.change_pct;
  const volumePositive = volumeChange > 0;
  const volumeNeutral = volumeChange === 0;

  return (
    <div
      className="card-accent-top"
      style={{
        padding: '16px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 4,
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 14,
      }}>
        <div>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
            marginBottom: 4,
          }}>
            VIIMEISIN TREENI
          </p>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text)',
          }}>
            {name || date}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.8rem',
            color: daysAgo === 0 ? 'var(--success)' : daysAgo === 1 ? 'var(--accent)' : 'var(--muted)',
            fontWeight: 700,
          }}>
            {daysLabel}
          </span>
          {name && (
            <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: 2 }}>
              {date}
            </p>
          )}
        </div>
      </div>

      {/* Stats rivi */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 14,
      }}>
        <div style={{
          padding: '10px 12px',
          background: 'var(--surface2)',
          borderRadius: 3,
          border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', color: 'var(--muted)', letterSpacing: '0.1em' }}>SETTIÄ</p>
          <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{set_count}</p>
        </div>
        <div style={{
          padding: '10px 12px',
          background: 'var(--surface2)',
          borderRadius: 3,
          border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', color: 'var(--muted)', letterSpacing: '0.1em' }}>LIIKETTÄ</p>
          <p style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700 }}>{exercises.length}</p>
        </div>
      </div>

      {/* Volyymi vs edellinen sama treeni */}
      {prev_same_volume && volumeChange != null && (
        <div style={{
          padding: '10px 14px',
          background: volumePositive ? '#001a0d' : volumeNeutral ? 'var(--surface2)' : '#1a0800',
          border: `1px solid ${volumePositive ? 'var(--success)' : volumeNeutral ? 'var(--border)' : 'var(--accent2)'}`,
          borderRadius: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 14,
        }}>
          <div>
            <p style={{ fontSize: '0.6rem', fontFamily: 'var(--font-display)', color: 'var(--muted)', letterSpacing: '0.1em', marginBottom: 2 }}>
              VOLYYMI VS EDELLINEN {name?.toUpperCase()}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
              {prev_same_volume.date}
            </p>
          </div>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.1rem',
            color: volumePositive ? 'var(--success)' : volumeNeutral ? 'var(--text)' : 'var(--accent2)',
          }}>
            {volumePositive ? '▲' : volumeNeutral ? '=' : '▼'} {volumePositive ? '+' : ''}{volumeChange}%
          </span>
        </div>
      )}

      {/* Liike-tagit */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
        {exercises.map(ex => (
          <span key={ex} style={{
            padding: '3px 10px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            fontSize: '0.72rem',
            fontFamily: 'var(--font-display)',
            color: 'var(--text)',
          }}>
            {ex}
          </span>
        ))}
      </div>

      {/* Paras setti */}
      {best_set && (
        <div style={{
          padding: '10px 14px',
          background: 'var(--surface2)',
          border: '1px solid var(--accent)',
          borderRadius: 3,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: '0.65rem',
            fontFamily: 'var(--font-display)',
            letterSpacing: '0.08em',
            color: 'var(--muted)',
          }}>
            PARAS SETTI
          </span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '0.95rem',
          }}>
            {best_set.exercise}{' '}
            <span style={{ color: 'var(--accent)' }}>
              {best_set.weight}kg × {best_set.reps}
            </span>
          </span>
        </div>
      )}
    </div>
  );
}