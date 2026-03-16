const DAYS = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

export default function WeekStrip({ sessionDates, weekStart }) {
  // Rakennetaan 7 päivän array maanantaista alkaen
  const days = DAYS.map((label, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const trained = sessionDates.includes(iso);
    const isToday = iso === new Date().toISOString().slice(0, 10);

    return { label, iso, trained, isToday };
  });

  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '0.7rem',
        letterSpacing: '0.1em',
        color: 'var(--muted)',
        marginBottom: 10,
      }}>
        TÄMÄ VIIKKO
      </p>
      <div style={{ display: 'flex', gap: 8 }}>
        {days.map(({ label, trained, isToday }) => (
          <div key={label} style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 6,
          }}>
            <div style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: 4,
              background: trained
                ? 'var(--accent)'
                : isToday
                ? 'var(--surface2)'
                : 'var(--surface)',
              border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
            }} />
            <span style={{
              fontSize: '0.65rem',
              fontFamily: 'var(--font-display)',
              color: isToday ? 'var(--accent)' : 'var(--muted)',
            }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}