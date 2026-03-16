import { useEffect, useState } from 'react';
import { getHistory, getSessionDetail, deleteSession, deleteSet } from '../api';

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    getHistory().then(setSessions).finally(() => setLoading(false));
  }

  async function loadDetail(id) {
    if (selected === id) { setSelected(null); setDetail(null); return; }
    setSelected(id);
    const data = await getSessionDetail(id);
    setDetail(data);
  }

  async function handleDeleteSession(e, sessionId) {
    e.stopPropagation();
    if (!confirm('Poistetaanko koko sessio ja kaikki sen setit?')) return;
    await deleteSession(sessionId);
    setSessions(s => s.filter(x => x.id !== sessionId));
    if (selected === sessionId) { setSelected(null); setDetail(null); }
  }

  async function handleDeleteSet(setId) {
    if (!confirm('Poistetaanko tämä setti?')) return;
    try {
      await deleteSet(setId);
      const updated = await getSessionDetail(selected);
      if (updated.sets.length === 0) {
        await deleteSession(selected);
        setSessions(s => s.filter(x => x.id !== selected));
        setSelected(null); setDetail(null);
      } else {
        setDetail(updated);
        setSessions(s => s.map(x => x.id === selected ? { ...x, set_count: updated.sets.length } : x));
      }
    } catch (e) {
      alert('Poisto epäonnistui — yritä uudelleen.');
      await loadSessions();
    }
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Ladataan...</p>;

  const grouped = detail?.sets?.reduce((acc, s) => {
    (acc[s.exercise] = acc[s.exercise] || []).push(s);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 40 }}>

      <div className="slide-up slide-up-1">
        <label style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          color: 'var(--muted)',
          display: 'block',
          marginBottom: 16,
        }}>
          TREENIHISTORIA
        </label>
      </div>

      {sessions.length === 0 && (
        <p className="slide-up slide-up-2" style={{ color: 'var(--muted)' }}>
          Ei sessioita vielä.
        </p>
      )}

      {sessions.map((s, idx) => (
        <div
          key={s.id}
          className={`slide-up slide-up-${Math.min(idx + 1, 5)}`}
        >
          <div
            onClick={() => loadDetail(s.id)}
            style={{
              padding: '14px 18px',
              background: selected === s.id ? 'var(--surface2)' : 'var(--surface)',
              border: `1px solid ${selected === s.id ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: selected === s.id ? '4px 4px 0 0' : 4,
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              transition: 'background 0.2s, border-color 0.2s',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
                {s.name || s.date}
              </span>
              {s.name && (
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                  {s.date}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{s.set_count} settiä</span>
              <button
                onClick={(e) => handleDeleteSession(e, s.id)}
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

          {selected === s.id && grouped && (
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
                        transition: 'border-color 0.15s',
                      }}>
                        <span>
                          {set.weight}kg × {set.reps}
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
      ))}
    </div>
  );
}