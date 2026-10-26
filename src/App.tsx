import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import Splash from './components/Splash'
import Nav from './components/Nav'
import Gallery from './components/Gallery'
import Feedback, { type FeedbackHandle } from './components/Feedback'
import { Icon, type IconName } from './components/Icons'
import { asset, B, EMAIL, type Meta } from './assets'

// The single place the APK is linked from (hero, nav, tutorial, footer all use it).
const APK_HREF = `${B}assets/chem-exp.apk`
const APK_NAME = 'Chemistry-Explorer.apk'

// Feature wording is unchanged from the previous site; only the emoji became line icons.
const FEATURES: [IconName, string, string][] = [
  ['flame', 'Streak home screen', 'Daily streak, XP, and a "10 daily flashcards" progress bar on the home screen.'],
  ['cards', 'Touch-swipe flashcards', 'Hold and drag a card right for Got It (+10 XP) or left for Missed (-3 XP). Chapter-wise sets with Easy/Medium style tags.'],
  ['atom', '9 JEE concept games', 'Periodic Drag, Aufbau Orbital Filler, Electron Parking, Formula Forge, Reaction Balancer, Shape Shift, Trend Detective, Mole Factory and Carbon Chain Crafter, each with levels or modes and played/wins stats.'],
  ['flask', 'Interactive labs', 'Hands-on labs such as Mole Factory: pick moles of each reactant, find the limiting reagent and run the conveyor.'],
  ['chart', 'HD Graph & Lab', 'A graph section with a touch crosshair and 4 graphs, as listed on the app home screen.'],
  ['book', 'Chapter Formula Vault', 'A topic-wise NCERT listing of formulas, as listed on the app home screen.'],
  ['bookmark', 'Bookmarked questions', 'Bookmark questions from the games and revisit them later.'],
  ['globe', 'Hindi / English', 'Switch the app between Hindi and English from the top bar.'],
]

// Scroll-reveal: add `.rise` to anything that should fade in once. Falls back to "already visible".
const rise = (el: Element | null) => {
  if (!el) return
  const items = el.querySelectorAll('.rise')
  if (typeof IntersectionObserver === 'undefined') { items.forEach((n) => n.classList.add('in')); return }
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: 0.1 })
  items.forEach((n) => io.observe(n))
}

const delay = (n: number) => ({ '--d': n }) as CSSProperties

export default function App() {
  const [splash, setSplash] = useState(true)
  const [size, setSize] = useState<string | null>(null)
  const [apk, setApk] = useState<'loading' | 'ok' | 'missing'>('loading')
  const [meta, setMeta] = useState<Meta | null>(null)
  const [vErr, setVErr] = useState(false)
  const fb = useRef<FeedbackHandle>(null)
  const main = useRef<HTMLDivElement>(null)
  const done = useCallback(() => setSplash(false), [])
  const version = import.meta.env.VITE_APP_VERSION || 'To be confirmed'

  useEffect(() => {
    fetch(`${B}asset-meta.json`).then((r) => r.json() as Promise<Meta>).then((m) => {
      setMeta(m)
      if (!m.apkBytes) return setApk('missing')
      setApk('ok'); setSize(`${(m.apkBytes / 1e6).toFixed(1)} MB`)
    }).catch(() => setApk('ok')) // metadata unavailable: still link the file, just without a size
  }, [])
  useEffect(() => { if (!splash) rise(main.current) }, [splash])

  const dl = apk === 'missing'
    ? <p className="bad" role="alert">The APK file (chem-exp.apk) is currently unavailable. Please try again later or email {EMAIL}.</p>
    : <a className="btn btn--lime btn--lg" href={APK_HREF} download={APK_NAME}>
        <Icon name="download" size={20} />Download App APK{size && <span className="btn__meta">{size}</span>}
      </a>

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div ref={main} className={splash ? 'hold' : 'app'}>
        <a className="skip" href="#top">Skip to content</a>
        <Nav apkHref={APK_HREF} apkName={APK_NAME} showDownload={apk !== 'missing'} />

        <main id="top">
          {/* ───────── Hero ───────── */}
          <section className="hero sec--navy" aria-labelledby="hero-title">
            <div className="wrap hero__grid">
              <div className="hero__copy">
                <p className="eyebrow hero-in" style={delay(0)}>Chemistry Explorer for Android</p>
                <h1 id="hero-title" className="hero-in" style={delay(1)}>Class 11 Chemistry, built to be played.</h1>
                <p className="lead hero-in" style={delay(2)}>An independent Android app with swipe flashcards, nine concept games, interactive labs, graphs and a streak-and-XP home screen, in Hindi and English.</p>
                <div className="cta hero-in" style={delay(3)}>{dl}<a className="btn btn--ghost-dark btn--lg" href="#features">Explore Features</a></div>
                <dl className="facts hero-in" style={delay(4)}>
                  <div><dt>Platform</dt><dd>Android</dd></div>
                  {size && <div><dt>Package size</dt><dd>{size}</dd></div>}
                  <div><dt>Languages</dt><dd>Hindi and English</dd></div>
                  <div><dt>Syllabus</dt><dd>Class 11 NCERT, JEE, NEET</dd></div>
                </dl>
              </div>
              <div className="hero__media">
                <Gallery count={meta?.shots ?? 7} active={!splash} />
              </div>
            </div>
          </section>

          {/* ───────── Features ───────── */}
          <section id="features" className="sec sec--ivory">
            <div className="wrap">
              <div className="head rise">
                <p className="eyebrow">Features</p>
                <h2>Flashcards, games and labs for Class 11 Chemistry</h2>
              </div>
              <div className="fgrid">
                <Widget />
                {FEATURES.map(([icon, title, text]) => (
                  <article key={title} className="card rise">
                    <span className="card__icon"><Icon name={icon} size={22} /></span>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>

          {/* ───────── Tutorial video ───────── */}
          <section id="video" className="sec sec--deep video">
            <div className="wrap video__grid">
              <div className="video__copy rise">
                <p className="eyebrow">Tutorial</p>
                <h2>See Chemistry Explorer in Action</h2>
                <p>A walkthrough of the app so you can see how it works before installing.</p>
                {apk !== 'missing' && <a className="btn btn--ghost-dark" href={APK_HREF} download={APK_NAME}><Icon name="download" size={18} />Download App APK</a>}
              </div>
              <div className="video__frame rise">
                {vErr ? <p className="bad">The tutorial video couldn't be loaded.</p> :
                  <video controls preload="metadata" playsInline poster={asset('vid-poster.jpg')} onError={() => setVErr(true)} src={asset('vid tutorial.mp4')} />}
              </div>
            </div>
          </section>

          {/* ───────── Specifications ───────── */}
          <section id="specs" className="sec sec--ivory">
            <div className="wrap specs__grid">
              <div className="specs__intro rise">
                <p className="eyebrow">Specifications</p>
                <h2>Technical details</h2>
                <p className="muted">Android may ask you to allow installs from your browser before it opens the APK.</p>
              </div>
              <dl className="specs rise">
                <div><dt>Application</dt><dd>Chemistry Explorer</dd></div>
                <div><dt>Platform</dt><dd>Android</dd></div>
                <div><dt>Package size</dt><dd>{size ?? (apk === 'missing' ? 'Unavailable' : '…')}</dd></div>
                <div><dt>Developer</dt><dd>Aditya Maurya</dd></div>
                <div><dt>Focus</dt><dd>Chemistry · Class 11 NCERT · JEE • NEET</dd></div>
                <div><dt>Package ID</dt><dd className="mono">com.adityamaurya.chemexplorer</dd></div>
                <div><dt>Build</dt><dd>Debug build (APK)</dd></div>
                <div><dt>Version</dt><dd className={version === 'To be confirmed' ? 'tbc' : undefined}>{version}</dd></div>
                <div><dt>Minimum Android</dt><dd className="tbc">To be confirmed</dd></div>
                <div><dt>Internet needed</dt><dd className="tbc">To be confirmed</dd></div>
              </dl>
            </div>
          </section>

          {/* ───────── Support ───────── */}
          <section id="support" className="sec sec--sand support">
            <div className="wrap support__grid">
              <div className="support__copy rise">
                <p className="eyebrow">Support Us</p>
                <h2>Support Independent Learning</h2>
                <p>Chemistry Explorer is an independent educational project.🙏 If it helps you, you can support it voluntarily by scanning the QR code.❤️‍🩹 Contributions go toward development, educational content, improvements and future releases.</p>
                <p className="aside">I'd like to build more learning apps for Physics, Mathematics and Biology in the future.❤️‍🩹 This is a hope, not a promise, and supporting is entirely optional.</p>
              </div>
              <figure className="qrcard rise">
                <QR />
                <figcaption>Scan the QR code to support voluntarily.</figcaption>
              </figure>
            </div>
          </section>
        </main>

        {/* ───────── Footer ───────── */}
        <footer className="foot sec--navy">
          <div className="wrap">
            <div className="foot__grid">
              <div className="foot__brand">
                <a href="#top" className="brand"><img src={asset('logo.png')} alt="" width={32} height={32} /><span>Chemistry Explorer</span></a>
                <p>An independent Android app for Chemistry learning.</p>
                <a className="foot__mail" href={`mailto:${EMAIL}`}>{EMAIL}</a>
              </div>
              <nav aria-label="Footer" className="foot__nav">
                <div>
                  <h2>Explore</h2>
                  <a href="#features">Features</a>
                  <a href="#screenshots">Screenshots</a>
                  <a href="#video">Tutorial</a>
                  <a href="#specs">Specs</a>
                </div>
                <div>
                  <h2>Get involved</h2>
                  <a href={APK_HREF} download={APK_NAME}>Download APK</a>
                  <a href="#support">Support Us</a>
                  <button type="button" className="link" onClick={() => fb.current?.open()}>Give Feedback</button>
                </div>
              </nav>
            </div>
            <div className="foot__base">
              <p className="small">Feedback you submit is emailed to the developer via EmailJS and used only to improve the app.</p>
              <p>© {new Date().getFullYear()} Chemistry Explorer · Made with ❤️‍🩹 by Aditya Maurya</p>
            </div>
          </div>
        </footer>
        <Feedback ref={fb} />
      </div>
    </>
  )
}

/** Home-screen widget picture. If widget.jpg is missing the whole card disappears instead of showing a broken image. */
function Widget() {
  const [bad, setBad] = useState(false)
  if (bad) return null
  return (
    <figure className="widget rise">
      <span className="widget__tag">Home screen widget</span>
      <img src={asset('widget.jpg')} alt="The Chemistry Explorer home-screen streak widget" width={852} height={446} loading="lazy" onError={() => setBad(true)} />
      <figcaption>The app also offers a customizable streak widget for your home screen.</figcaption>
    </figure>
  )
}

function QR() {
  const [bad, setBad] = useState(false)
  return bad ? <div className="ph qr">QR code (qr.jpg) not found</div> :
    <img className="qr" src={asset('qr.jpg')} alt="QR code to support Chemistry Explorer" width={490} height={504} loading="lazy" onError={() => setBad(true)} />
}
