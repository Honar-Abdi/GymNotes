import { useEffect, useState } from 'react';
import { getHistory, getSessionDetail } from '../api';
import SessionRow from '../components/history/SessionRow';
import CardioRow from '../components/history/CardioRow';

const FILTERS = ['Kaikki', 'Yläkroppa', 'Alakroppa', 'Kehonpaino', 'Aerobinen'];

export default function History() {
  const [sessions, setSessions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Kaikki');

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    setLoading(true);
    getHistory().then(setSessions).finally(() => setLoading(false));
  }

  async function handleSelect(id, preloadedDetail = null) {
    if (selected?.id === id) { setSelected(null); return; }
    if (preloadedDetail) { setSelected({ id, detail: preloadedDetail }); return; }
    const detail = await getSessionDetail(id);
    setSelected({ id, detail });
  }

  function handleSessionDeleted(id) {
    setSessions(s => s.filter(x => x.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function handleCardioDeleted(cardioId) {
    setSessions(s => s.filter(x => x.cardio_id !== cardioId));
  }

  function matchesFilter(s) {
    if (filter === 'Kaikki') return true;
    if (filter === 'Aerobinen') return s.type === 'cardio';
    return s.type === 'treeni' && s.name === filter;
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Ladataan...</p>;

  const filtered = sessions.filter(matchesFilter);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingBottom: 40 }}>

      <div className="slide-up slide-up-1" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <label style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.8rem',
          letterSpacing: '0.1em',
          color: 'var(--muted)',
          display: 'block',
        }}>
          TREENIHISTORIA
        </label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '6px 14px',
                background: filter === f ? 'var(--accent)' : 'var(--surface)',
                color: filter === f ? '#000' : 'var(--muted)',
                border: `1px solid ${filter === f ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: 3,
                fontSize: '0.75rem',
                fontFamily: 'var(--font-display)',
                letterSpacing: '0.08em',
                transition: 'background 0.15s',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="slide-up slide-up-2" style={{ color: 'var(--muted)', marginTop: 8 }}>
          Ei sessioita valitulla filterillä.
        </p>
      )}

      {filtered.map((s, idx) => (
        <div key={s.type === 'cardio' ? `cardio-${s.cardio_id}` : s.id} className={`slide-up slide-up-${Math.min(idx + 1, 5)}`}>
          {s.type === 'cardio' ? (
            <CardioRow session={s} onDeleted={handleCardioDeleted} />
          ) : (
            <SessionRow
              session={s}
              selected={selected}
              onSelect={handleSelect}
              onSessionDeleted={handleSessionDeleted}
              onSessionsReload={loadSessions}
            />
          )}
        </div>
      ))}

    </div>
  );
}