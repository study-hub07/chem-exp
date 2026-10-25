import { useEffect, useState } from 'react'
import { asset } from '../assets'

function Shot({ n, total }: { n: number; total: number }) {
  const [bad, setBad] = useState(false)
  if (bad) return <div className="ph">screenshot{n}.jpg not found</div>
  return <img src={asset(`screenshot${n}.jpg`)} alt={`Chemistry Explorer app screen ${n} of ${total}`} width={800} height={1224}
    loading={n <= 3 ? 'eager' : 'lazy'} decoding="async" onError={() => setBad(true)} />
}

export default function Gallery({ count }: { count: number }) {
  const SHOTS = Math.max(count, 1)
  const trio = Math.min(3, SHOTS)
  const [phase, setPhase] = useState<'trio' | 'show'>('trio')
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)

  useEffect(() => {
    const f = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [])

  // One timeout at a time; effect cleanup guarantees no overlapping timers.
  useEffect(() => {
    if (paused || hidden) return
    const t = setTimeout(() => {
      if (phase === 'trio') { setPhase('show'); setIdx(0) } else setIdx((i) => (i + 1) % SHOTS)
    }, phase === 'trio' ? 5000 : 5000)
    return () => clearTimeout(t)
  }, [phase, idx, paused, hidden, SHOTS, trio])

  const go = (d: number) => { setPhase('show'); setIdx((i) => (phase === 'trio' ? (d > 0 ? 0 : SHOTS - 1) : (i + d + SHOTS) % SHOTS)) }

  return (
    <div className="gallery" aria-roledescription="carousel" aria-label="App screenshots">
      <div className="stage">
        {phase === 'trio' ? (
          <div className="trio" key="trio">{Array.from({ length: trio }, (_, k) => k + 1).map((n) => <div className="frame" key={n}><Shot n={n} total={SHOTS} /></div>)}</div>
        ) : (
          <div className="frame single" key={idx}><Shot n={idx + 1} total={SHOTS} /></div>
        )}
      </div>
      <div className="gctl">
        <button onClick={() => go(-1)} aria-label="Previous screenshot">‹</button>
        <span aria-live="off">{phase === 'trio' ? `01–${String(trio).padStart(2, '0')}` : String(idx + 1).padStart(2, '0')} / {SHOTS}</span>
        <button onClick={() => go(1)} aria-label="Next screenshot">›</button>
        <button onClick={() => setPaused((p) => !p)} aria-pressed={paused}>{paused ? 'Play' : 'Pause'}</button>
      </div>
    </div>
  )
}
