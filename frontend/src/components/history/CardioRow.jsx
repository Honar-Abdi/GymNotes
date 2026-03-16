import { deleteCardio } from '../../api';

export default function CardioRow({ session, onDeleted }) {
  const speed = (session.distance_km / (session.duration_min / 60)).toFixed(1);
  const hours = Math.floor(session.duration_min / 60);
  const mins = session.duration_min % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;

  async function handleDelete(e) {
    e.stopPropagation();
    if (!confirm('Poistetaanko tämä aerobinen kirjaus?')) return;
    await deleteCardio(session.cardio_id);
    onDeleted(session.cardio_id);
  }

  return (
    <div style={{
      padding: '14px 18px',
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 4,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600 }}>
            Aerobinen
          </span>
          <span style={{
            padding: '2px 8px',
            background: 'var(--surface2)',
            border: '1px solid var(--border)',
            borderRadius: 3,
            fontSize: '0.7rem',
            fontFamily: 'var(--font-display)',
            color: 'var(--success)',
            letterSpacing: '0.05em',
          }}>
            CARDIO
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{session.date}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 600 }}>
            {session.distance_km} km
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
            {durationStr} · {speed} km/h
          </div>
        </div>
        <button
          onClick={handleDelete}
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
  );
}