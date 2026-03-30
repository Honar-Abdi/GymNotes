import { useEffect, useState } from 'react';
import { getExercises, getProgress, getAllCardio, getAllWeights } from '../api';
import TrendBadge from '../components/progress/TrendBadge';
import StrengthStats from '../components/progress/StrengthStats';
import BodyweightStats from '../components/progress/BodyweightStats';
import VolumeStats from '../components/progress/VolumeStats';
import IntensityStats from '../components/progress/IntensityStats';
import SideStats from '../components/progress/SideStats';
import SessionHistory from '../components/progress/SessionHistory';
import CardioStats from '../components/progress/CardioStats';
import WeightStats from '../components/progress/WeightStats';

const TABS = ['treeni', 'cardio', 'paino'];

export default function Progress() {
  const [tab, setTab] = useState('treeni');
  const [exercises, setExercises] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cardioData, setCardioData] = useState(null);
  const [cardioLoading, setCardioLoading] = useState(false);
  const [weightData, setWeightData] = useState(null);
  const [weightLoading, setWeightLoading] = useState(false);

  useEffect(() => {
    getExercises().then(setExercises);
  }, []);

  useEffect(() => {
    if (tab === 'cardio' && !cardioData) {
      setCardioLoading(true);
      getAllCardio().then(setCardioData).finally(() => setCardioLoading(false));
    }
    if (tab === 'paino' && !weightData) {
      setWeightLoading(true);
      getAllWeights().then(setWeightData).finally(() => setWeightLoading(false));
    }
  }, [tab, cardioData, weightData]);

  async function loadExercise(ex) {
    setSelected(ex); setData(null); setLoading(true);
    const d = await getProgress(ex);
    setData(d); setLoading(false);
  }

  const s = data?.summary;

  const tabStyle = (t) => ({
    flex: 1,
    padding: '12px',
    background: tab === t ? 'var(--accent)' : 'var(--surface2)',
    color: tab === t ? '#000' : 'var(--muted)',
    border: `1px solid ${tab === t ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: 4,
    fontSize: '0.8rem',
    fontFamily: 'var(--font-display)',
    letterSpacing: '0.1em',
    cursor: 'pointer',
    transition: 'background 0.15s',
  });

  const tabLabel = (t) => {
    if (t === 'treeni') return 'TREENI';
    if (t === 'cardio') return 'AEROBINEN';
    return 'PAINO';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 40 }}>

      <div className="slide-up slide-up-1" style={{ display: 'flex', gap: 8 }}>
        {TABS.map(t => (
          <button key={t} style={tabStyle(t)} onClick={() => setTab(t)}>
            {tabLabel(t)}
          </button>
        ))}
      </div>

      {/* TREENI */}
      {tab === 'treeni' && (
        <>
          <div className="slide-up slide-up-1">
            <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--muted)', display: 'block', marginBottom: 10 }}>
              VALITSE LIIKE
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {exercises.map(ex => (
                <button
                  key={ex}
                  onClick={() => loadExercise(ex)}
                  style={{
                    padding: '8px 16px',
                    background: selected === ex ? 'var(--accent)' : 'var(--surface)',
                    color: selected === ex ? '#000' : 'var(--text)',
                    border: `1px solid ${selected === ex ? 'var(--accent)' : 'var(--border)'}`,
                    borderRadius: 3,
                    fontSize: '0.8rem',
                    transition: 'background 0.15s, color 0.15s, transform 0.1s',
                  }}
                  onMouseEnter={e => { if (selected !== ex) e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {loading && <p className="slide-up slide-up-2" style={{ color: 'var(--muted)' }}>Ladataan...</p>}

          {s && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="slide-up slide-up-2" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <TrendBadge pct={s.change_vs_prev_pct} label="e1RM" />
                <TrendBadge pct={s.volume_trend_pct} label="volyymi" />
              </div>
              <div className="slide-up slide-up-3">
                {s.is_bodyweight
                  ? <BodyweightStats s={s} timeline={data.timeline} />
                  : <StrengthStats s={s} timeline={data.timeline} />
                }
              </div>
              <div className="slide-up slide-up-4"><VolumeStats s={s} /></div>
              <div className="slide-up slide-up-5"><IntensityStats s={s} /></div>
              <div className="slide-up slide-up-5"><SideStats s={s} /></div>
              {s.plateau?.plateau && (
                <div className="slide-up slide-up-5" style={{ padding: 14, background: '#1a0800', border: '1px solid var(--accent2)', borderRadius: 4, color: 'var(--accent2)', fontSize: '0.85rem' }}>
                  PLATEAU HAVAITTU — {s.plateau.window} viimeistä sessiota ilman progressia
                </div>
              )}
              <div className="slide-up slide-up-5">
                <SessionHistory timeline={data.timeline} isBodyweight={s.is_bodyweight} />
              </div>
            </div>
          )}
        </>
      )}

      {/* AEROBINEN */}
      {tab === 'cardio' && (
        <div className="slide-up slide-up-2">
          {cardioLoading && <p style={{ color: 'var(--muted)' }}>Ladataan...</p>}
          {cardioData && <CardioStats data={cardioData} />}
          {cardioData && cardioData.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>Ei aerobisia kirjauksia vielä.</p>
          )}
        </div>
      )}

      {/* PAINO */}
      {tab === 'paino' && (
        <div className="slide-up slide-up-2">
          {weightLoading && <p style={{ color: 'var(--muted)' }}>Ladataan...</p>}
          {weightData && <WeightStats data={weightData} />}
        </div>
      )}

    </div>
  );
}