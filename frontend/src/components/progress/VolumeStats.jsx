import StatCard from './StatCard';

export default function VolumeStats({ s }) {
  return (
    <>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>VOLYYMI & FREKVENSSI</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatCard
          label="KOKONAISVOLYYMI"
          value={`${s.last_volume?.toFixed(0)} ${s.is_bodyweight ? 'toistoa' : 'kg'}`}
          sub="paino × toistot yhteensä (kaikki setit)"
        />
        <StatCard label="SESSIOITA YHTEENSÄ" value={s.total_sessions} />
        <StatCard
          label="TREENIVÄLI KA"
          value={s.avg_days_between_sessions ? `${s.avg_days_between_sessions} pv` : '—'}
          sub="päivää sessioiden välillä"
        />
      </div>
    </>
  );
}