import { useEffect, useState } from 'react'
import { asset } from '../assets'

export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    // Timer-based, so a failed logo can never block the site. Timings unchanged: fade at 2.6 s, done at 3 s.
    const a = setTimeout(() => setLeaving(true), 2600)
    const b = setTimeout(onDone, 3000)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [onDone])
  return (
    <div className={`splash${leaving ? ' out' : ''}`} role="status" aria-label="Loading Chemistry Explorer">
      <img src={asset('logo.png')} alt="" width={112} height={112} onError={(e) => (e.currentTarget.style.display = 'none')} />
      <p className="splash__name">Chemistry Explorer</p>
      <p className="splash__sub">Class 11 NCERT and JEE</p>
      <div className="bar"><span /></div>
    </div>
  )
}
