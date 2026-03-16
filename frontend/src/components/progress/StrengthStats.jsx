import StatCard from './StatCard';

export default function StrengthStats({ s }) {
  return (
    <>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 8 }}>VOIMA</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatCard label="VIIMEISIN e1RM" value={`${s.last_best_e1rm?.toFixed(1)} kg`} sub="arvioitu 1RM" />
        <StatCard label="PARAS e1RM KOSKAAN" value={`${s.all_time_best_e1rm?.toFixed(1)} kg`} />
        <StatCard label="PARAS PAINO" value={`${s.all_time_best_weight} kg`} sub="korkein nostettu" />
      </div>
      {s.all_time_best_set && (
        <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.8rem', color: 'var(--muted)', marginTop: 10 }}>
          Paras setti: <span style={{ color: 'var(--text)' }}>{s.all_time_best_set.weight}kg × {s.all_time_best_set.reps} toistoa</span>
          {' '}— tehty <span style={{ color: 'var(--text)' }}>{s.all_time_best_set.date}</span>
        </div>
      )}
    </>
  );
}