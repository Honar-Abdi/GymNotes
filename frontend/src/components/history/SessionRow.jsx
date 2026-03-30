import { useState } from 'react';
import { getSessionDetail, deleteSession, updateSessionName, addSetsToSession } from '../../api';

const NAME_OPTIONS = ['Yläkroppa', 'Alakroppa', 'Kehonpaino'];

export default function SessionRow({ session, selected, onSelect, onSessionDeleted, onSessionsReload }) {
  const isOpen = selected?.id === session.id;
  const detail = selected?.detail;

  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState(session.name || '');
  const [addText, setAddText] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addResult, setAddResult] = useState(null);
  const [addError, setAddError] = useState(null);

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

  async function handleSaveName(e) {
    e.stopPropagation();
    await updateSessionName(session.id, editName);
    setEditMode(false);
    onSessionsReload();
  }

  async function handleAddSets(e) {
    e.stopPropagation();
    if (!addText.trim()) return;
    setAddLoading(true); setAddError(null); setAddResult(null);
    try {
      const lines = addText.trim().split('\n').filter(l => l.trim());
      const result = await addSetsToSession(session.id, lines, session.date, session.name);
      setAddResult(result.saved);
      setAddText('');
      const updated = await getSessionDetail(session.id);
      onSelect(session.id, updated);
      onSessionsReload();
    } catch {
      setAddError('Lisäys epäonnistui — tarkista rivien muoto.');
    } finally { setAddLoading(false); }
  }

  return (
    <div>
      {/* Session header */}
      <div
        onClick={() => { if (!editMode) onSelect(session.id); }}
        style={{
          padding: '14px 18px',
          background: isOpen ? 'var(--surface2)' : 'var(--surface)',
          border: `1px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}`,
          borderRadius: isOpen ? '4px 4px 0 0' : 4,
          cursor: editMode ? 'default' : 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'background 0.2s, border-color 0.2s',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
          {editMode ? (
            <div onClick={e => e.stopPropagation()} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {NAME_OPTIONS.map(n => (
                  <button
                    key={n}
                    onClick={() => setEditName(n)}
                    style={{
                      padding: '4px 10px',
                      background: editName === n ? 'var(--accent)' : 'var(--surface2)',
                      color: editName === n ? '#000' : 'var(--muted)',
                      border: `1px solid ${editName === n ? 'var(--accent)' : 'var(--border)'}`,
                      borderRadius: 3,
                      fontSize: '0.7rem',
                    }}
                  >
                    {n.toUpperCase()}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={editName}
                onChange={e => setEditName(e.target.value)}
                placeholder="tai kirjoita nimi..."
                style={{ fontSize: '0.9rem', padding: '6px 10px', width: '100%' }}
                autoFocus
              />
            </div>
          ) : (
            <>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
                {session.name || session.date}
              </span>
              {session.name && (
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{session.date}</span>
              )}
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 12 }}>
          <span style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>{session.set_count} settiä</span>

          {editMode ? (
            <>
              <button
                onClick={handleSaveName}
                style={{
                  padding: '4px 12px',
                  background: 'var(--success)',
                  color: '#000',
                  border: 'none',
                  borderRadius: 3,
                  fontSize: '0.75rem',
                }}
              >
                ✓
              </button>
              <button
                onClick={e => { e.stopPropagation(); setEditMode(false); setEditName(session.name || ''); }}
                style={{
                  padding: '4px 10px',
                  background: 'var(--surface2)',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  fontSize: '0.75rem',
                }}
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <button
                onClick={e => { e.stopPropagation(); setEditMode(true); }}
                style={{
                  padding: '4px 10px',
                  background: 'transparent',
                  color: 'var(--muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                  fontSize: '0.75rem',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--muted)'}
              >
                ✎
              </button>
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
            </>
          )}
        </div>
      </div>

      {/* Session detail */}
      {isOpen && grouped && (
        <div style={{
          padding: '16px 18px',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderTop: 'none',
          borderRadius: '0 0 4px 4px',
          animation: 'slideUp 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards',
        }}>
          {/* Setit */}
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
                  }}>
                    {set.weight > 0 ? `${set.weight}kg` : 'BW'} × {set.reps}
                    {set.extra_reps ? <span style={{ color: 'var(--accent2)' }}> +{set.extra_reps}</span> : ''}
                    {set.rir != null ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> R{set.rir}</span> : ''}
                    {set.side ? <span style={{ color: 'var(--muted)', fontWeight: 400 }}> {set.side === 'right' ? '→' : '←'}</span> : ''}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Lisää settejä */}
          <div style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>
              LISÄÄ SETTEJÄ
            </p>
            <textarea
              rows={4}
              value={addText}
              onChange={e => setAddText(e.target.value)}
              placeholder={'Wide Pull Up 100kg x 8\nTriceps 28kg x 12 +3'}
              style={{ width: '100%', resize: 'vertical', lineHeight: 1.8, fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: 8 }}
            />
            <button
              onClick={handleAddSets}
              disabled={addLoading || !addText.trim()}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--accent)',
                color: '#000',
                borderRadius: 3,
                fontSize: '0.8rem',
                opacity: addLoading || !addText.trim() ? 0.5 : 1,
              }}
            >
              {addLoading ? 'LISÄTÄÄN...' : 'LISÄÄ →'}
            </button>

            {addError && (
              <div style={{ marginTop: 8, padding: 10, background: '#1a0800', border: '1px solid var(--accent2)', borderRadius: 3, color: 'var(--accent2)', fontSize: '0.8rem' }}>
                {addError}
              </div>
            )}
            {addResult && (
              <div style={{ marginTop: 8, padding: 10, background: '#001a0d', border: '1px solid var(--success)', borderRadius: 3, color: 'var(--success)', fontSize: '0.8rem' }}>
                ✓ Lisätty {addResult} settiä
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}