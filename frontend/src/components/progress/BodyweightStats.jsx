import StatCard from './StatCard';

export default function BodyweightStats({ s }) {
  return (
    <>
      <div style={{ padding: '10px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4, fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 10 }}>
        Kehonpainoliike — seurataan toistomäärää
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        <StatCard label="VIIMEISIN PARAS" value={`${s.last_best_reps ?? '—'} toistoa`} />
        <StatCard label="ALL TIME PARAS" value={`${s.all_time_best_reps ?? '—'} toistoa`} />
        <StatCard label="SESSIOITA" value={s.total_sessions} />
      </div>
      {s.all_time_best_weight && (
        <div style={{ marginTop: 10 }}>
          <StatCard label="PARAS LISÄPAINO" value={`${s.all_time_best_weight} kg`} sub="korkein nostettu lisäpaino" />
        </div>
      )}
    </>
  );
}