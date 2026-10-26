import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type FormEvent } from 'react'
import { EMAIL } from '../assets'
import { Icon } from './Icons'

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
type Field = 'msg' | 'mail' | 'files' | ''

const Feedback = forwardRef<FeedbackHandle>((_, ref) => {
  const dlg = useRef<HTMLDialogElement>(null)
  const area = useRef<HTMLTextAreaElement>(null)
  const mailBox = useRef<HTMLInputElement>(null)
  const busy = useRef(false)
  const closing = useRef(false)
  const [msg, setMsg] = useState('')
  const [mail, setMail] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [err, setErr] = useState('')
  const [errField, setErrField] = useState<Field>('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'draft' | 'fail'>('idle')
  const previews = useRef<Map<File, string>>(new Map())

  useImperativeHandle(ref, () => ({
    open: () => {
      const d = dlg.current
      if (!d) return
      setStatus('idle'); setErr(''); setErrField('')
      if (!d.open) d.showModal()
      // Only focus the text box where there is no on-screen keyboard to pop up.
      if (window.matchMedia('(pointer: fine)').matches) area.current?.focus()
    },
  }))
  useEffect(() => () => previews.current.forEach(URL.revokeObjectURL), [])

  // Animated close (160 ms), skipped when the visitor prefers reduced motion.
  const close = () => {
    const d = dlg.current
    if (!d || !d.open || closing.current) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { d.close(); return }
    closing.current = true
    d.classList.add('closing')
    setTimeout(() => { d.classList.remove('closing'); closing.current = false; d.close() }, 160)
  }

  const url = (f: File) => { if (!previews.current.has(f)) previews.current.set(f, URL.createObjectURL(f)); return previews.current.get(f)! }
  const drop = (f: File) => { URL.revokeObjectURL(url(f)); previews.current.delete(f); setFiles((a) => a.filter((x) => x !== f)) }

  const fail = (field: Field, text: string) => {
    setErr(text); setErrField(field)
    if (field === 'msg') area.current?.focus()
    if (field === 'mail') mailBox.current?.focus()
  }

  const pick = (list: FileList | null) => {
    if (!list) return
    let e = ''; const next = [...files]
    for (const f of Array.from(list)) {
      if (!OK_TYPES.includes(f.type)) e = `${f.name}: only JPG, PNG or WEBP images are allowed.`
      else if (f.size > MAX_BYTES) e = `${f.name} is larger than ${(MAX_BYTES / 1048576).toFixed(1)} MB.`
      else if (next.length >= MAX_FILES) e = `You can attach up to ${MAX_FILES} images.`
      else next.push(f)
    }
    setErr(e); setErrField(e ? 'files' : ''); setFiles(next)
  }

  const draft = () => {
    const body = `${msg}\n\n${mail ? `Reply to: ${mail}\n` : ''}${files.length ? `(Please attach ${files.length} screenshot(s) manually.)` : ''}`
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Chemistry Explorer feedback')}&body=${encodeURIComponent(body)}`
  }

  const submit = async (ev: FormEvent) => {
    ev.preventDefault()
    if (busy.current) return
    if (msg.trim().length < 10) return fail('msg', 'Please write at least 10 characters.')
    if (mail && !/^\S+@\S+\.\S+$/.test(mail)) return fail('mail', 'That email address looks invalid.')
    setErr(''); setErrField('')
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

  const finished = status === 'sent' || status === 'draft'
  const mb = (MAX_BYTES / 1048576).toFixed(1)

  return (
    <dialog ref={dlg} className="modal" aria-labelledby="fbt"
      onCancel={(e) => { e.preventDefault(); close() }}
      onClick={(e) => e.target === dlg.current && close()}>
      <form onSubmit={submit} noValidate>
        <div className="modal__head">
          <div>
            <h2 id="fbt">Give Feedback</h2>
            <p>Tell the developer what works, what doesn’t and what you’d like to see.</p>
          </div>
          <button type="button" className="modal__x" onClick={close} aria-label="Close feedback form"><Icon name="close" size={20} /></button>
        </div>

        <div className="modal__body">
          <div className="field">
            <label htmlFor="fb-msg">Your feedback</label>
            <textarea id="fb-msg" ref={area} value={msg} onChange={(e) => setMsg(e.target.value)} rows={5} required
              aria-invalid={errField === 'msg'} aria-describedby={errField === 'msg' ? 'fb-err' : undefined} />
          </div>

          <div className="field">
            <label htmlFor="fb-mail">Email <span>(optional, if you want a reply)</span></label>
            <input id="fb-mail" ref={mailBox} type="email" value={mail} onChange={(e) => setMail(e.target.value)} autoComplete="email"
              aria-invalid={errField === 'mail'} aria-describedby={errField === 'mail' ? 'fb-err' : undefined} />
          </div>

          <div className="field">
            <span className="field__label">Images <span>(optional)</span></span>
            <label className="drop">
              <Icon name="image" size={22} />
              <span className="drop__text">
                <strong>Add screenshots</strong>
                <small>JPG, PNG or WEBP · max {MAX_FILES} images, {mb} MB each</small>
              </span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple
                onChange={(e) => { pick(e.target.files); e.target.value = '' }} />
            </label>
            {files.length > 0 && (
              <ul className="thumbs" aria-label="Selected images">{files.map((f) => (
                <li key={f.name + f.size}>
                  <img src={url(f)} alt={`Selected: ${f.name}`} />
                  <button type="button" onClick={() => drop(f)} aria-label={`Remove ${f.name}`}><Icon name="close" size={14} /></button>
                </li>))}
              </ul>
            )}
            {!attach && files.length > 0 && <p className="hint">Image attachments are not enabled on this site yet; images won't be sent automatically.</p>}
          </div>

          <p className="hint">Your message{attach ? ' and images are' : ' is'} sent via EmailJS to the developer only.</p>

        </div>

        <div className="modal__foot">
          {/* Messages live in the pinned footer so errors are visible without scrolling the form. */}
          <div className="modal__msgs">
            <div role="alert" id="fb-err">
              {err && <p className="note note--bad"><Icon name="alert" size={18} /><span>{err}</span></p>}
              {status === 'fail' && (
                <p className="note note--bad"><Icon name="alert" size={18} />
                  <span>Sending failed. <button type="button" className="link" onClick={draft}>Open an email draft instead</button></span></p>
              )}
            </div>
            <div role="status">
              {status === 'sending' && <p className="note note--info"><span className="spin" aria-hidden="true" /><span>Sending your feedback…</span></p>}
              {status === 'sent' && <p className="note note--good"><Icon name="check" size={18} /><span>Thank you! Your feedback was sent.</span></p>}
              {status === 'draft' && <p className="note note--good"><Icon name="info" size={18} /><span>Feedback email service isn't configured, so your email app was opened with a draft.</span></p>}
            </div>
          </div>
          <div className="modal__actions">
            <button type="button" className="btn btn--line" onClick={close}>{finished ? 'Close' : 'Cancel'}</button>
            <button className="btn btn--ink" disabled={status === 'sending'}>
              {status === 'sending' ? <><span className="spin spin--light" aria-hidden="true" />Sending…</> : 'Submit'}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  )
})
export default Feedback
