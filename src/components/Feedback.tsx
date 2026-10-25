import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EMAIL } from '../assets'

const env = import.meta.env
const MAX_BYTES = Number(env.VITE_MAX_IMAGE_MB || 1.5) * 1024 * 1024
const MAX_FILES = 3
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const configured = !!(env.VITE_EMAILJS_SERVICE_ID && env.VITE_EMAILJS_TEMPLATE_ID && env.VITE_EMAILJS_PUBLIC_KEY)
const attach = env.VITE_EMAILJS_ATTACH === 'true'

const toDataUrl = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = () => rej(r.error); r.readAsDataURL(f)
})

export type FeedbackHandle = { open: () => void }

const Feedback = forwardRef<FeedbackHandle>((_, ref) => {
  const dlg = useRef<HTMLDialogElement>(null)
  const busy = useRef(false)
  const [msg, setMsg] = useState('')
  const [mail, setMail] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [err, setErr] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'draft' | 'fail'>('idle')
  const previews = useRef<Map<File, string>>(new Map())

  useImperativeHandle(ref, () => ({ open: () => { setStatus('idle'); setErr(''); dlg.current?.showModal() } }))
  useEffect(() => () => previews.current.forEach(URL.revokeObjectURL), [])

  const url = (f: File) => { if (!previews.current.has(f)) previews.current.set(f, URL.createObjectURL(f)); return previews.current.get(f)! }
  const drop = (f: File) => { URL.revokeObjectURL(url(f)); previews.current.delete(f); setFiles((a) => a.filter((x) => x !== f)) }

  const pick = (list: FileList | null) => {
    if (!list) return
    let e = ''; const next = [...files]
    for (const f of Array.from(list)) {
      if (!OK_TYPES.includes(f.type)) e = `${f.name}: only JPG, PNG or WEBP images are allowed.`
      else if (f.size > MAX_BYTES) e = `${f.name} is larger than ${(MAX_BYTES / 1048576).toFixed(1)} MB.`
      else if (next.length >= MAX_FILES) e = `You can attach up to ${MAX_FILES} images.`
      else next.push(f)
    }
    setErr(e); setFiles(next)
  }

  const draft = () => {
    const body = `${msg}\n\n${mail ? `Reply to: ${mail}\n` : ''}${files.length ? `(Please attach ${files.length} screenshot(s) manually.)` : ''}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Chemistry Explorer feedback')}&body=${encodeURIComponent(body)}`
  }

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (busy.current) return
    if (msg.trim().length < 10) return setErr('Please write at least 10 characters.')
    if (mail && !/^\S+@\S+\.\S+$/.test(mail)) return setErr('That email address looks invalid.')
    setErr('')
    if (!configured) { draft(); setStatus('draft'); return }
    busy.current = true; setStatus('sending')
    try {
      const params: Record<string, string> = { message: msg.trim(), reply_to: mail || 'not provided', to_email: EMAIL,
        note: files.length && !attach ? `${files.length} image(s) were selected but not attached (attachments disabled).` : '' }
      if (attach) for (let i = 0; i < files.length; i++) params[`image_${i + 1}`] = await toDataUrl(files[i])
      const r = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_id: env.VITE_EMAILJS_SERVICE_ID, template_id: env.VITE_EMAILJS_TEMPLATE_ID, user_id: env.VITE_EMAILJS_PUBLIC_KEY, template_params: params }),
      })
      if (!r.ok) throw new Error(await r.text())
      setStatus('sent'); setMsg(''); setMail(''); files.forEach(drop)
    } catch { setStatus('fail') } finally { busy.current = false }
  }

  return (
    <dialog ref={dlg} className="modal" aria-labelledby="fbt" onClick={(e) => e.target === dlg.current && dlg.current?.close()}>
      <form onSubmit={submit} noValidate>
        <h2 id="fbt">Give Feedback</h2>
        <label>Your feedback<textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} required /></label>
        <label>Email (optional, if you want a reply)<input type="email" value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email" /></label>
        <label>Images (optional · JPG/PNG/WEBP · max {MAX_FILES}, {(MAX_BYTES / 1048576).toFixed(1)} MB each)
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(e) => { pick(e.target.files); e.target.value = '' }} /></label>
        <div className="thumbs">{files.map((f) => (
          <figure key={f.name + f.size}><img src={url(f)} alt={`Selected: ${f.name}`} /><button type="button" onClick={() => drop(f)} aria-label={`Remove ${f.name}`}>×</button></figure>))}</div>
        {!attach && files.length > 0 && <p className="hint">Image attachments are not enabled on this site yet; images won't be sent automatically.</p>}
        <p className="hint">Your message{attach ? ' and images are' : ' is'} sent via EmailJS to the developer only.</p>
        <div role="alert" className="msgs">
          {err && <p className="bad">{err}</p>}
          {status === 'sent' && <p className="good">Thank you! Your feedback was sent.</p>}
          {status === 'draft' && <p className="good">Feedback email service isn't configured, so your email app was opened with a draft.</p>}
          {status === 'fail' && <p className="bad">Sending failed. <button type="button" className="link" onClick={draft}>Open an email draft instead</button></p>}
        </div>
        <div className="row">
          <button type="button" className="btn ghost" onClick={() => dlg.current?.close()}>Cancel</button>
          <button className="btn" disabled={status === 'sending'}>{status === 'sending' ? 'Sending…' : 'Submit'}</button>
        </div>
      </form>
    </dialog>
  )
})
export default Feedback
