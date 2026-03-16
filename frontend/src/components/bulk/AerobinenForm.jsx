import { useState } from 'react';
import { logCardio } from '../../api';

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

export default function AerobinenForm() {
  const [cardioDate, setCardioDate] = useState(quickDate(0));
  const [durationHours, setDurationHours] = useState('');
  const [durationMins, setDurationMins] = useState('');
  const [distance, setDistance] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalMins = (parseInt(durationHours || 0) * 60) + parseInt(durationMins || 0);
  const hasTime = totalMins > 0;
  const hasDistance = parseFloat(distance) > 0;
  const speed = hasTime && hasDistance
    ? (parseFloat(distance) / (totalMins / 60)).toFixed(1)
    : null;

  async function handleSave() {
    if (!hasTime || !hasDistance) return;
    setLoading(true); setError(null); setResult(null);
    try {
      await logCardio(cardioDate, 'Aerobinen', totalMins, parseFloat(distance));
      setResult({ totalMins, distance, date: cardioDate });
      setDurationHours('');
      setDurationMins('');
      setDistance('');
    } catch {
      setError('Tallennus epäonnistui.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
        KIRJAA AEROBINEN
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
                onClick={() => setCardioDate(iso)}
                style={{
                  flex: 1,
                  padding: '8px 2px',
                  background: cardioDate === iso ? 'var(--accent)' : 'var(--surface2)',
                  color: cardioDate === iso ? '#000' : 'var(--muted)',
                  border: `1px solid ${cardioDate === iso ? 'var(--accent)' : 'var(--border)'}`,
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
          value={cardioDate}
          onChange={e => setCardioDate(e.target.value)}
          onClick={e => e.target.showPicker()}
          style={{ width: '100%', cursor: 'pointer' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
            TUNNIT
          </label>
          <input
            type="number"
            min="0"
            step="1"
            value={durationHours}
            onChange={e => setDurationHours(e.target.value)}
            placeholder="0"
            style={{ width: '100%', fontSize: '1.2rem', padding: '12px', textAlign: 'center' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
            MINUUTIT
          </label>
          <input
            type="number"
            min="0"
            max="59"
            step="1"
            value={durationMins}
            onChange={e => setDurationMins(e.target.value)}
            placeholder="45"
            style={{ width: '100%', fontSize: '1.2rem', padding: '12px', textAlign: 'center' }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
            MATKA (km)
          </label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={distance}
            onChange={e => setDistance(e.target.value)}
            placeholder="5.0"
            style={{ width: '100%', fontSize: '1.2rem', padding: '12px', textAlign: 'center' }}
          />
        </div>
      </div>

      {speed && (
        <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>NOPEUS</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{speed} km/h</div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={loading || !hasTime || !hasDistance}
        style={{
          width: '100%',
          padding: '14px',
          background: 'var(--accent)',
          color: '#000',
          fontSize: '0.9rem',
          borderRadius: 4,
          opacity: loading || !hasTime || !hasDistance ? 0.5 : 1,
          transition: 'opacity 0.2s, transform 0.1s',
        }}
        onMouseEnter={e => { if (!loading && hasTime && hasDistance) e.target.style.transform = 'translateY(-1px)'; }}
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
          ✓ Tallennettu — {result.distance} km / {result.totalMins} min — {result.date}
        </div>
      )}

    </div>
  );
}