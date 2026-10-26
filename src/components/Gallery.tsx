import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react'
import { asset } from '../assets'
import { Icon } from './Icons'

const STEP_MS = 5000 // trio stays 5 s, then every single screenshot stays 5 s (same as the original timings)
const MAX_DOTS = 12 // above this the dots are hidden and only the counter is shown
const pad = (n: number) => String(n).padStart(2, '0')

/** One screenshot, never stretched or cropped: the screen box has the screenshot's own aspect ratio. */
function Shot({ n, total, eager, className = '', onReady }: {
  n: number; total: number; eager?: boolean; className?: string; onReady?: () => void
}) {
  const [bad, setBad] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const img = useRef<HTMLImageElement>(null)

  // Cached images can finish before React attaches onLoad.
  useEffect(() => {
    const el = img.current
    if (el && el.complete && el.naturalWidth > 0) { setLoaded(true); onReady?.() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (bad) return <div className={`ph ${className}`} role="img" aria-label={`Screenshot ${n} is unavailable`}>screenshot{n}.jpg not found</div>
  return (
    <img ref={img} className={`shot ${className}${loaded ? ' is-in' : ''}`} src={asset(`screenshot${n}.jpg`)}
      alt={`Chemistry Explorer app screen ${n} of ${total}`} width={800} height={1224}
      loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false}
      onLoad={() => { setLoaded(true); onReady?.() }}
      onError={() => { setBad(true); onReady?.() }} />
  )
}

/** Cross-fades inside a fixed phone frame, so changing slides never moves the layout. */
function Slide({ n, total }: { n: number; total: number }) {
  const [cur, setCur] = useState(n)
  const [prev, setPrev] = useState<number | null>(null)
  const [ready, setReady] = useState(true)
  if (cur !== n) { setPrev(cur); setCur(n); setReady(false) } // derived state: swap happens before paint
  useEffect(() => {
    if (prev === null || !ready) return
    const t = setTimeout(() => setPrev(null), 520)
    return () => clearTimeout(t)
  }, [prev, ready, cur])
  return (
    <>
      {prev !== null && <Shot key={prev} n={prev} total={total} eager className="is-prev" />}
      <Shot key={cur} n={cur} total={total} eager className="is-cur" onReady={() => setReady(true)} />
    </>
  )
}

function Phone({ className, children }: { className: string; children: ReactNode }) {
  return <div className={`phone ${className}`}><div className="screen">{children}</div></div>
}

export default function Gallery({ count, active = true }: { count: number; active?: boolean }) {
  const SHOTS = Math.max(count, 1)
  const trio = Math.min(3, SHOTS)
  const [phase, setPhase] = useState<'trio' | 'show'>('trio')
  const [idx, setIdx] = useState(0)
  const [paused, setPaused] = useState(false)
  const [hidden, setHidden] = useState(document.hidden)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const cur = Math.min(idx, SHOTS - 1)

  // Suspend the slideshow while the tab is hidden.
  useEffect(() => {
    const f = () => setHidden(document.hidden)
    document.addEventListener('visibilitychange', f)
    return () => document.removeEventListener('visibilitychange', f)
  }, [])

  // One timeout at a time; effect cleanup guarantees no overlapping timers.
  useEffect(() => {
    if (paused || hidden || !active) return // `active` is false while the splash screen is up, so the trio gets its full 5 s on screen
    const t = setTimeout(() => {
      if (phase === 'trio') { setPhase('show'); setIdx(0) } else setIdx((i) => (i + 1) % SHOTS)
    }, STEP_MS)
    return () => clearTimeout(t)
  }, [phase, idx, paused, hidden, active, SHOTS, trio])

  // Warm the cache for the next slide so the cross-fade never waits on the network.
  useEffect(() => {
    if (phase !== 'show' || SHOTS < 2) return
    const i = new Image()
    i.src = asset(`screenshot${((cur + 1) % SHOTS) + 1}.jpg`)
  }, [phase, cur, SHOTS])

  const go = (d: number) => { setPhase('show'); setIdx((i) => (phase === 'trio' ? (d > 0 ? 0 : SHOTS - 1) : (i + d + SHOTS) % SHOTS)) }
  const goTo = (n: number) => { setPhase('show'); setIdx(n) }

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    touch.current = { x: e.clientX, y: e.clientY }
  }
  const onUp = (e: PointerEvent<HTMLDivElement>) => {
    const s = touch.current; touch.current = null
    if (!s) return
    const dx = e.clientX - s.x, dy = e.clientY - s.y
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.4) go(dx < 0 ? 1 : -1)
  }
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1) }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1) }
  }

  const trioNums = Array.from({ length: trio }, (_, k) => k + 1)
  const role = (k: number) => (trio === 3 && k !== 1 ? 'is-side' : 'is-main')
  const counter = `${phase === 'trio' ? `${pad(1)}–${pad(trio)}` : pad(cur + 1)} / ${SHOTS}`

  return (
    <div id="screenshots" className="gallery" role="region" aria-roledescription="carousel" aria-label="App screenshots" onKeyDown={onKey}>
      <div className="stage" data-phase={phase} onPointerDown={onDown} onPointerUp={onUp} onPointerCancel={() => { touch.current = null }}>
        <div className="trio" aria-hidden={phase !== 'trio'}>
          {trioNums.map((n, k) => <Phone key={n} className={role(k)}><Shot n={n} total={SHOTS} eager /></Phone>)}
        </div>
        <div className="single" aria-hidden={phase === 'trio'}>
          <Phone className="is-single"><Slide n={cur + 1} total={SHOTS} /></Phone>
        </div>
      </div>

      <div className="gctl">
        <div className="gctl__group">
          <button type="button" className="gbtn" onClick={() => go(-1)} aria-label="Previous screenshot"><Icon name="prev" size={20} /></button>
          {SHOTS > 1 && SHOTS <= MAX_DOTS && (
            <div className="dots" role="group" aria-label="Choose a screenshot">
              {Array.from({ length: SHOTS }, (_, i) => (
                <button key={i} type="button" className={`dot${phase === 'trio' && i < trio ? ' in-view' : ''}`}
                  aria-label={`Show screenshot ${i + 1} of ${SHOTS}`} aria-current={phase === 'show' && i === cur ? 'true' : undefined}
                  onClick={() => goTo(i)} />
              ))}
            </div>
          )}
          <button type="button" className="gbtn" onClick={() => go(1)} aria-label="Next screenshot"><Icon name="next" size={20} /></button>
        </div>
        <div className="gctl__group">
          <button type="button" className="gbtn gbtn--text" onClick={() => setPaused((p) => !p)}>
            <Icon name={paused ? 'play' : 'pause'} size={16} />{paused ? 'Resume' : 'Pause'}
          </button>
          <span className="count" aria-live={paused ? 'polite' : 'off'}>{counter}</span>
        </div>
      </div>
    </div>
  )
}
