const DAY_LABELS = ['Ma', 'Ti', 'Ke', 'To', 'Pe', 'La', 'Su'];

const TYPE_COLORS = {
  'Yläkroppa': '#e8ff00',
  'Alakroppa': '#00ff88',
  'Kehonpaino': '#00cfff',
  'Aerobinen': '#e8512a',
};

function getDotColor(name) {
  return TYPE_COLORS[name] || '#888';
}

export default function MonthCalendar({ calendar }) {
  if (!calendar) return null;

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.7rem',
          letterSpacing: '0.1em',
          color: 'var(--muted)',
        }}>
          VIIMEISET 28 PÄIVÄÄ
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {Object.entries(TYPE_COLORS).map(([name, color]) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: color,
              }} />
              <span style={{
                fontSize: '0.65rem',
                color: 'var(--muted)',
                fontFamily: 'var(--font-display)',
              }}>
                {name.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
        marginBottom: 4,
      }}>
        {DAY_LABELS.map(d => (
          <div key={d} style={{
            textAlign: 'center',
            fontSize: '0.6rem',
            fontFamily: 'var(--font-display)',
            color: 'var(--muted)',
            paddingBottom: 4,
          }}>
            {d}
          </div>
        ))}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: 4,
      }}>
        {calendar.map(({ date, trained, name, type, is_today }) => {
          const color = trained ? getDotColor(name) : null;
          return (
            <div
              key={date}
              title={trained ? (name || date) : date}
              style={{
                height: 32,
                borderRadius: 6,
                background: trained
                  ? `${color}28`
                  : is_today
                  ? 'rgba(232,255,0,0.04)'
                  : 'var(--surface)',
                border: `1px solid ${
                  is_today && !trained
                    ? 'rgba(232,255,0,0.4)'
                    : trained
                    ? `${color}90`
                    : 'var(--border)'
                }`,
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.15s ease, border-color 0.15s ease',
                cursor: 'default',
              }}
            >
              {trained && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '40%',
                  background: `linear-gradient(to top, ${color}40, transparent)`,
                  borderRadius: '0 0 6px 6px',
                }} />
              )}

              {trained && (
                <div style={{
                  position: 'absolute',
                  top: 5,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 6px ${color}`,
                }} />
              )}

              {is_today && !trained && (
                <div style={{
                  position: 'absolute',
                  bottom: 4,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 4,
                  height: 4,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  opacity: 0.5,
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}