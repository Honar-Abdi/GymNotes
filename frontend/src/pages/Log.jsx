import { useState } from 'react';
import { chatPropose, confirmSet } from '../api';

export default function Log() {
  const [text, setText] = useState('');
  const [proposal, setProposal] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handlePropose() {
    if (!text.trim()) return;
    setLoading(true); setError(null); setProposal(null); setStatus(null);
    try {
      const data = await chatPropose(text);
      setProposal(data.proposal);
    } catch (e) {
      setError('Parsinta epäonnistui. Tarkista muoto esim: "bench press 80kg x 5"');
    } finally { setLoading(false); }
  }

  async function handleConfirm() {
    setLoading(true);
    try {
      const data = await confirmSet(proposal);
      setStatus(data.message);
      setProposal(null);
      setText('');
    } catch (e) {
      setError('Tallennus epäonnistui.');
    } finally { setLoading(false); }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', letterSpacing: '0.1em', color: 'var(--muted)' }}>
        KIRJAA SETTI
      </label>

      <textarea
        rows={3}
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'bench press 80kg x 5 rir 2\ntai: eilen squat 100 x 3'}
        onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handlePropose()}
        style={{ resize: 'vertical', lineHeight: 1.6 }}
      />

      <button
        onClick={handlePropose}
        disabled={loading || !text.trim()}
        style={{
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

      {error && (
        <div style={{ padding: 16, background: '#1a0800', border: '1px solid var(--accent2)', borderRadius: 4, color: 'var(--accent2)', fontSize: '0.9rem' }}>
          {error}
        </div>
      )}

      {proposal && (
        <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--muted)', marginBottom: 12 }}>
            EHDOTUS
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: 20 }}>
            {[
              ['Päivä', proposal.date],
              ['Liike', proposal.exercise_saved_as],
              ['Paino', `${proposal.weight} kg`],
              ['Toistot', proposal.reps + (proposal.extra_reps ? ` +${proposal.extra_reps}` : '')],
              ['RIR', proposal.rir ?? '—'],
              ['Setti #', proposal.set_index],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>{k}</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{v}</div>
              </div>
            ))}
          </div>

          {proposal.exercise_match === 'fuzzy' && (
            <p style={{ fontSize: '0.8rem', color: 'var(--accent2)', marginBottom: 12 }}>
              ⚠ Tulkittu liikkeeksi "{proposal.exercise_saved_as}"
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleConfirm}
              disabled={loading}
              style={{ flex: 1, padding: '12px', background: 'var(--success)', color: '#000', borderRadius: 4, fontSize: '0.85rem' }}
            >
              ✓ TALLENNA
            </button>
            <button
              onClick={() => setProposal(null)}
              style={{ padding: '12px 20px', background: 'var(--surface2)', color: 'var(--muted)', borderRadius: 4, fontSize: '0.85rem' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {status && (
        <div style={{ padding: 16, background: '#001a0d', border: '1px solid var(--success)', borderRadius: 4, color: 'var(--success)', fontSize: '0.9rem' }}>
          ✓ {status}
        </div>
      )}
    </div>
  );
}