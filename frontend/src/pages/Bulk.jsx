import { useState } from 'react';
import { bulkPropose, bulkConfirm } from '../api';

const EXAMPLE = `Wide Pull Up 90kg x 10
Wide Pull Up 95kg x 6
Incline DB 32.5kg x 8 oikea
Incline DB 28kg x 7 vasen
Chest Supported Row 28.5kg x 12 oikea +12
Triceps 31.25kg x 11 +3
Preacher Bicep 14kg x 10 +3`;

export default function Bulk() {
  const [text, setText] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [name, setName] = useState('');
  const [proposals, setProposals] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePropose() {
    setLoading(true); setError(null); setProposals(null); setResults(null);
    const lines = text.trim().split('\n').filter(l => l.trim());
    try {
      const data = await bulkPropose(lines, date, name);
      setProposals(data.proposals);
    } catch (e) {
      setError('Parsinta epäonnistui. Tarkista rivien muoto.');
    } finally { setLoading(false); }
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const data = await bulkConfirm(proposals, name);
      setResults(data);
      setProposals(null);
      setText('');
      setName('');
    } catch (e) {
      setError('Tallennus epäonnistui.');
    } finally { setLoading(false); }
  }

  const grouped = proposals?.reduce((acc, p) => {
    (acc[p.exercise_saved_as] = acc[p.exercise_saved_as] || []).push(p);
    return acc;
  }, {});

  // Pikavalinnat
  function quickDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
        color: 'var(--muted)',
      }}>
        KIRJAA TREENI
      </label>

      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
        Yksi setti per rivi:{' '}
        <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-display)' }}>
          liike paino x toistot [+extra] [rir N] [oikea/vasen]
        </span>
      </p>

      {/* Päivämäärä + nimi rinnakkain */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>

        {/* Päivämäärä */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}>
            PÄIVÄMÄÄRÄ
          </label>
          {/* Pikavalinnat */}
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { label: 'TÄNÄÄN', days: 0 },
              { label: 'EILEN', days: 1 },
              { label: '2 PV', days: 2 },
              { label: '3 PV', days: 3 },
            ].map(({ label, days }) => {
              const iso = quickDate(days);
              return (
                <button
                  key={label}
                  onClick={() => setDate(iso)}
                  style={{
                    flex: 1,
                    padding: '8px 2px',
                    background: date === iso ? 'var(--accent)' : 'var(--surface2)',
                    color: date === iso ? '#000' : 'var(--muted)',
                    border: `1px solid ${date === iso ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 3,
                    fontSize: '0.6rem',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {/* Manuaalinen kenttä vanhemmille päiville */}
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            onClick={e => e.target.showPicker()}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        {/* Nimi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{
            fontFamily: 'var(--font-display)',
            fontSize: '0.7rem',
            letterSpacing: '0.1em',
            color: 'var(--muted)',
          }}>
            TREENIN NIMI (valinnainen)
          </label>
          {/* Nimipikavalinta */}
          <div style={{ display: 'flex', gap: 4 }}>
            {['Yläkroppa', 'Alakroppa',].map(n => (
              <button
                key={n}
                onClick={() => setName(n)}
                style={{
                  flex: 1,
                  padding: '8px 2px',
                  background: name === n ? 'var(--accent)' : 'var(--surface2)',
                  color: name === n ? '#000' : 'var(--muted)',
                  border: `1px solid ${name === n ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 3,
                  fontSize: '0.6rem',
                }}
              >
                {n.toUpperCase()}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="tai kirjoita nimi..."
            style={{ width: '100%' }}
          />
        </div>
      </div>

      <textarea
        rows={12}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={EXAMPLE}
        style={{
          resize: 'vertical',
          lineHeight: 1.8,
          fontFamily: 'monospace',
          fontSize: '0.85rem',
        }}
      />

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={handlePropose}
          disabled={loading || !text.trim()}
          style={{
            flex: 1,
            padding: '14px',
            background: 'var(--accent)',
            color: '#000',
            fontSize: '0.9rem',
            borderRadius: 4,
            opacity: loading || !text.trim() ? 0.5 : 1,
          }}
        >
          {loading ? 'PARSITAAN...' : 'ANALYSOI →'}
        </button>
        <button
          onClick={() => setText(EXAMPLE)}
          style={{
            padding: '14px 18px',
            background: 'var(--surface)',
            color: 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: '0.75rem',
          }}
        >
          ESIMERKKI
        </button>
      </div>

      {error && (
        <div style={{
          padding: 16,
          background: '#1a0800',
          border: '1px solid var(--accent2)',
          borderRadius: 4,
          color: 'var(--accent2)',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {grouped && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              color: 'var(--muted)',
            }}>
              EHDOTUS — {proposals.length} SETTIÄ / {Object.keys(grouped).length} LIIKETTÄ
            </p>
            <div style={{ textAlign: 'right' }}>
              <span style={{
                fontSize: '0.8rem',
                color: 'var(--text)',
                fontFamily: 'var(--font-display)',
              }}>
                {name || '—'}
              </span>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--muted)',
                marginLeft: 8,
              }}>
                {date}
              </span>
            </div>
          </div>

          {Object.entries(grouped).map(([ex, sets]) => (
            <div key={ex} style={{
              padding: '14px 16px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 4,
            }}>
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.75rem',
                letterSpacing: '0.1em',
                color: 'var(--accent)',
                marginBottom: 10,
              }}>
                {ex}
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {sets.map((s, i) => (
                  <div key={i} style={{
                    padding: '6px 12px',
                    background: 'var(--surface2)',
                    border: `1px solid ${s.exercise_match === 'fuzzy' ? 'var(--accent2)' : 'var(--border)'}`,
                    borderRadius: 3,
                    fontSize: '0.85rem',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 600,
                  }}>
                    {s.weight}kg × {s.reps}
                    {s.extra_reps > 0 && (
                      <span style={{ color: 'var(--accent2)' }}> +{s.extra_reps}</span>
                    )}
                    {s.rir != null && (
                      <span style={{ color: 'var(--muted)', fontWeight: 400 }}> R{s.rir}</span>
                    )}
                    {s.side && (
                      <span style={{ color: 'var(--muted)', fontWeight: 400 }}>
                        {s.side === 'right' ? ' →' : ' ←'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {sets.some(s => s.exercise_match === 'fuzzy') && (
                <p style={{ fontSize: '0.7rem', color: 'var(--accent2)', marginTop: 6 }}>
                  ⚠ Liike tulkittu fuzzy-matchilla
                </p>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{
                flex: 1,
                padding: '14px',
                background: 'var(--success)',
                color: '#000',
                borderRadius: 4,
                fontSize: '0.9rem',
              }}
            >
              ✓ TALLENNA {proposals.length} SETTIÄ
            </button>
            <button
              onClick={() => setProposals(null)}
              style={{
                padding: '14px 20px',
                background: 'var(--surface2)',
                color: 'var(--muted)',
                borderRadius: 4,
                fontSize: '0.85rem',
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {results && (
        <div style={{
          padding: 16,
          background: '#001a0d',
          border: '1px solid var(--success)',
          borderRadius: 4,
          color: 'var(--success)',
          fontSize: '0.9rem',
        }}>
          ✓ Tallennettu {results.saved} settiä
          {results.name && (
            <span style={{ color: 'var(--text)', marginLeft: 6 }}>— {results.name}</span>
          )}
        </div>
      )}
    </div>
  );
}