import { useEffect, useState } from 'react'
import { asset } from '../assets'

export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)
  useEffect(() => {
    // Timer-based, so a failed logo can never block the site.
    const a = setTimeout(() => setLeaving(true), 2600)
    const b = setTimeout(onDone, 3000)
    return () => { clearTimeout(a); clearTimeout(b) }
  }, [onDone])
  return (
    <div className={`splash${leaving ? ' out' : ''}`} role="status" aria-label="Loading Chemistry Explorer">
      <img src={asset('logo.png')} alt="" width={120} height={120} onError={(e) => (e.currentTarget.style.display = 'none')} />
      <h1>Chemistry Explorer</h1>
      <div className="bar"><span /></div>
    </div>
  )
}
