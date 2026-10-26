import { useEffect, useRef, useState } from 'react'
import { asset } from '../assets'
import { Icon } from './Icons'

// Anchors: every href must match an id in App.tsx.
const LINKS = [
  ['#features', 'Features'],
  ['#screenshots', 'Screenshots'],
  ['#video', 'Tutorial'],
  ['#support', 'Support'],
] as const

type Props = { apkHref: string; apkName: string; showDownload: boolean }

export default function Nav({ apkHref, apkName, showDownload }: Props) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLElement>(null)
  const toggle = useRef<HTMLButtonElement>(null)

  // Transparent over the hero, solid once the page has scrolled.
  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => setSolid(window.scrollY > 12))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll) }
  }, [])

  // Mobile menu: Escape, tap outside and growing past the mobile breakpoint all close it.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); toggle.current?.focus() } }
    const onDown = (e: PointerEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false) }
    const mq = window.matchMedia('(min-width: 861px)')
    const onMq = () => { if (mq.matches) setOpen(false) }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onDown)
    mq.addEventListener('change', onMq)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onDown)
      mq.removeEventListener('change', onMq)
    }
  }, [open])

  return (
    <header ref={root} className={`nav${solid || open ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <div className="wrap nav__bar">
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <img src={asset('logo.png')} alt="" width={32} height={32} />
          <span>Chemistry Explorer</span>
        </a>
        <nav id="site-menu" className="nav__links" aria-label="Main">
          {LINKS.map(([href, label]) => <a key={href} href={href} onClick={() => setOpen(false)}>{label}</a>)}
          {/* Very narrow phones: the Download button moves from the bar into the menu so the name never gets cut off. */}
          {showDownload && <a className="btn btn--lime nav__dl" href={apkHref} download={apkName} onClick={() => setOpen(false)}><Icon name="download" size={18} />Download App APK</a>}
        </nav>
        <div className="nav__actions">
          {showDownload && (
            <a className="btn btn--lime btn--sm nav__dl-bar" href={apkHref} download={apkName}>
              <Icon name="download" size={16} />Download
            </a>
          )}
          <button ref={toggle} type="button" className="nav__toggle" aria-expanded={open} aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'} onClick={() => setOpen((o) => !o)}>
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </div>
    </header>
  )
}
