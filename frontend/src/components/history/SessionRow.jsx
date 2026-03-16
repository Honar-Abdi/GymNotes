import { getSessionDetail, deleteSession, deleteSet } from '../../api';

export default function SessionRow({ session, selected, onSelect, onSessionDeleted, onSessionsReload }) {
  const isOpen = selected?.id === session.id;
  const detail = selected?.detail;

  const grouped = detail?.sets?.reduce((acc, s) => {
    (acc[s.exercise] = acc[s.exercise] || []).push(s);
    return acc;
  }, {});

  async function handleDeleteSession(e) {
    e.stopPropagation();
    if (!confirm('Poistetaanko koko sessio ja kaikki sen setit?')) return;
    await deleteSession(session.id);
    onSessionDeleted(session.id);
  }

  async function handleDeleteSet(setId) {
    if (!confirm('Poistetaanko tämä setti?')) return;
    try {
      await deleteSet(setId);
      const updated = await getSessionDetail(session.id);
      if (updated.sets.length === 0) {
        await deleteSession(session.id);
        onSessionDeleted(session.id);
      } else {
        onSelect(session.id, updated);
        onSessionsReload();
      }
    } catch {
      alert('Poisto epäonnistui — yritä uudelleen.');
      onSessionsReload();
    }
  }

  return (
    <div>
      <div
        onClick={() => onSelect(session.id)}
        style={{
          padding: '14px 18px',
          background: isOpen ? 'var(--surface2)' : 'var(--surface)',
          border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: isOpen ? '4px 4px 0 0' : 4,
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
            {session.name || session.date}
          </span>
          {session.name && (
            <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{session.date}</span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{session.set_count} settiä</span>
          <button
            onClick={handleDeleteSession}
            style={{
              padding: '4px 10px',
              background: 'transparent',
              color: 'var(--muted)',
              border: '1px solid var(--border)',
              borderRadius: 3,
              fontSize: '0.75rem',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.target.style.color = 'var(--accent2)'}
            onMouseLeave={e => e.target.style.color = 'var(--muted)'}
          >
            ✕
          </button>
        </div>
      </div>

      {isOpen && grouped && (
        <div style={{
          padding: '16px 18px',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          animation: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}>
          {Object.entries(grouped).map(([ex, sets]) => (
            <div key={ex} style={{ marginBottom: 16 }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: 'var(--accent)',
                marginBottom: 8,
              }}>
                {ex}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sets.map((set, i) => (
                  <div key={i} style={{
                    padding: '6px 12px',
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 3,
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}>
                    <span>
                      {set.weight > 0 ? `${set.weight}kg` : 'BW'} × {set.reps}
                      {set.extra_reps ? <span style={{ color: 'var(--accent2)' }}> +{set.extra_reps}</span> : ''}
                      {set.rir != null ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> R{set.rir}</span> : ''}
                      {set.side ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> {set.side === 'right' ? '→' : '←'}</span> : ''}
                    </span>
                    <button
                      onClick={() => handleDeleteSet(set.id)}
                      style={{
                        background: 'transparent',
                        color: 'var(--muted)',
                        border: 'none',
                        fontSize: '0.7rem',
                        padding: '0 2px',
                        lineHeight: 1,
                        transition: 'color 0.15s',
                      }}
                      onMouseEnter={e => e.target.style.color = 'var(--accent2)'}
                      onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}