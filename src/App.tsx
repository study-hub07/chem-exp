import { useCallback, useEffect, useRef, useState } from 'react'
import Splash from './components/Splash'
import Gallery from './components/Gallery'
import Feedback, { type FeedbackHandle } from './components/Feedback'
import { asset, B, EMAIL, type Meta } from './assets'

const FEATURES = [
  ['🔥', 'Streak home screen', 'Daily streak, XP, and a "10 daily flashcards" progress bar on the home screen.'],
  ['🃏', 'Touch-swipe flashcards', 'Hold and drag a card right for Got It (+10 XP) or left for Missed (-3 XP). Chapter-wise sets with Easy/Medium style tags.'],
  ['🎮', '9 JEE concept games', 'Periodic Drag, Aufbau Orbital Filler, Electron Parking, Formula Forge, Reaction Balancer, Shape Shift, Trend Detective, Mole Factory and Carbon Chain Crafter, each with levels or modes and played/wins stats.'],
  ['🏭', 'Interactive labs', 'Hands-on labs such as Mole Factory: pick moles of each reactant, find the limiting reagent and run the conveyor.'],
  ['📈', 'HD Graph & Lab', 'A graph section with a touch crosshair and 4 graphs, as listed on the app home screen.'],
  ['📚', 'Chapter Formula Vault', 'A topic-wise NCERT listing of formulas, as listed on the app home screen.'],
  ['🔖', 'Bookmarked questions', 'Bookmark questions from the games and revisit them later.'],
  ['🌐', 'Hindi / English', 'Switch the app between Hindi and English from the top bar.'],
]

const rise = (el: Element | null) => {
  if (!el) return
  const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: 0.1 })
  el.querySelectorAll('.rise').forEach((n) => io.observe(n))
}

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
    : <a className="btn big" href={`${B}assets/chem-exp.apk`} download="Chemistry-Explorer.apk">Download App APK{size && ` · ${size}`}</a>

  return (
    <>
      {splash && <Splash onDone={done} />}
      <div ref={main} className={splash ? 'hold' : 'app'}>
        <header className="nav"><a href="#top" className="brand"><img src={asset('logo.png')} alt="" width={32} height={32} />Chemistry Explorer</a>
          <nav aria-label="Main"><a href="#features">Features</a><a href="#video">Video</a><a href="#specs">Specs</a><a href="#support">Support</a></nav></header>
        <main id="top">
          <section className="hero">
            <div className="copy">
              <h1>Chemistry Explorer</h1>
              <p className="tag">Class 11 NCERT and JEE interactive suite for Chemistry.</p>
              <p>An independent Android app with swipe flashcards, nine concept games, interactive labs, graphs and a streak-and-XP home screen, in Hindi and English.</p>
              <div className="cta">{dl}<a className="btn ghost" href="#features">Explore Features</a></div>
            </div>
            <Gallery count={meta?.shots ?? 7} />
          </section>

          <section id="features" className="sec rise"><h2>Explore Features</h2>
            <figure className="widget"><img src={asset('widget.jpg')} alt="The Chemistry Explorer home-screen streak widget" width={852} height={446} loading="lazy" onError={(e) => (e.currentTarget.style.display = 'none')} /><figcaption>The app also offers a customizable streak widget for your home screen.</figcaption></figure>
            <div className="grid">{FEATURES.map(([i, t, d]) => <article key={t} className="card"><span aria-hidden>{i}</span><h3>{t}</h3><p>{d}</p></article>)}</div></section>

          <section id="video" className="sec rise"><h2>See Chemistry Explorer in Action</h2>
            <p>A walkthrough of the app so you can see how it works before installing.</p>
            {vErr ? <p className="bad">The tutorial video couldn't be loaded.</p> :
              <video controls preload="metadata" playsInline poster={asset('vid-poster.jpg')} onError={() => setVErr(true)} src={asset('vid tutorial.mp4')} />}</section>

          <section id="specs" className="sec rise"><h2>Specifications</h2>
            <dl className="specs">
              <div><dt>Application</dt><dd>Chemistry Explorer</dd></div><div><dt>Platform</dt><dd>Android</dd></div>
              <div><dt>Package size</dt><dd>{size ?? (apk === 'missing' ? 'Unavailable' : '…')}</dd></div>
              <div><dt>Developer</dt><dd>Aditya Maurya</dd></div><div><dt>Focus</dt><dd>Chemistry · Class 11 NCERT · JEE</dd></div><div><dt>Package ID</dt><dd>com.adityamaurya.chemexplorer</dd></div><div><dt>Build</dt><dd>Debug build (APK)</dd></div>
              <div><dt>Version</dt><dd>{version}</dd></div><div><dt>Minimum Android</dt><dd>To be confirmed</dd></div>
              <div><dt>Internet needed</dt><dd>To be confirmed</dd></div></dl></section>

          <section id="support" className="sec rise support"><div>
            <h2>Support Independent Learning</h2>
            <p>Chemistry Explorer is an independent educational project. If it helps you, you can support it voluntarily by scanning the QR code. Contributions go toward development, educational content, improvements and future releases.</p>
            <p>I'd like to build more learning apps for Physics, Mathematics and Biology in the future. This is a hope, not a promise, and supporting is entirely optional.</p></div>
            <QR /></section>
        </main>
        <footer className="foot">
          <div><strong>Chemistry Explorer</strong><p>An independent Android app for Chemistry learning.</p></div>
          <nav aria-label="Footer"><a href="#features">Features</a><a href="#video">Video</a><a href="#specs">Specs</a>
            <a href={`${B}assets/chem-exp.apk`} download="Chemistry-Explorer.apk">Download APK</a><a href="#support">Support Us</a>
            <button className="link" onClick={() => fb.current?.open()}>Give Feedback</button><a href={`mailto:${EMAIL}`}>{EMAIL}</a></nav>
          <p className="small">Feedback you submit is emailed to the developer via EmailJS and used only to improve the app.</p>
          <p>© {new Date().getFullYear()} Chemistry Explorer · Made with ❤️‍🩹 by Aditya Maurya</p>
        </footer>
        <Feedback ref={fb} />
      </div>
    </>
  )
}

function QR() {
  const [bad, setBad] = useState(false)
  return bad ? <div className="ph qr">QR code (qr.jpg) not found</div> :
    <img className="qr" src={asset('qr.jpg')} alt="QR code to support Chemistry Explorer" width={240} height={240} loading="lazy" onError={() => setBad(true)} />
}
