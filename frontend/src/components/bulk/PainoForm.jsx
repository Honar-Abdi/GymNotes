import { useState } from 'react';
import { logWeight } from '../../api';

const DATE_BUTTONS = [
  { label: 'TÄNÄÄN', days: 0 },
  { label: 'EILEN', days: 1 },
  { label: '2 PV', days: 2 },
  { label: '3 PV', days: 3 },
];

function quickDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

export default function PainoForm() {
  const [date, setDate] = useState(quickDate(0));
  const [weight, setWeight] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (!weight) return;
    setLoading(true); setError(null); setResult(null);
    try {
      await logWeight(date, parseFloat(weight));
      setResult({ weight, date });
      setWeight('');
    } catch {
      setError('Tallennus epäonnistui.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
        KIRJAA AAMUPAINO
      </label>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
          PÄIVÄMÄÄRÄ
        </label>
        <div style={{ display: 'flex', gap: 4 }}>
          {DATE_BUTTONS.map(({ label, days }) => {
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
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          onClick={e => e.target.showPicker()}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
          PAINO (kg)
        </label>
        <input
          type="number"
          min="30"
          max="300"
          step="0.1"
          value={weight}
          onChange={e => setWeight(e.target.value)}
          placeholder="82.5"
          style={{ width: '100%', fontSize: '1.5rem', padding: '16px', textAlign: 'center', fontFamily: 'var(--font-display)', fontWeight: 700 }}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={loading || !weight}
        style={{
          width: '100%',
          padding: '14px',
          background: 'var(--accent)',
          color: '#000',
          fontSize: '0.9rem',
          borderRadius: 4,
          opacity: loading || !weight ? 0.5 : 1,
          transition: 'opacity 0.2s, transform 0.1s',
        }}
        onMouseEnter={e => { if (!loading && weight) e.target.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
      >
        {loading ? 'TALLENNETAAN...' : 'TALLENNA'}
      </button>

      {error && (
        <div style={{ padding: 16, background: '#1a0800', border: '1px solid var(--accent2)', borderRadius: 4, color: 'var(--accent2)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ padding: 16, background: '#001a0d', border: '1px solid var(--success)', borderRadius: 4, color: 'var(--success)', fontSize: '0.9rem' }}>
          ✓ Tallennettu — {result.weight} kg — {result.date}
        </div>
      )}

    </div>
  );
}