import { useState } from 'react'
import Reveal from './ui/Reveal'
import { IconCheck } from './ui/icons'

// --- Configuration --------------------------------------------------------
// Submission endpoint. Set VITE_FORM_ENDPOINT in a .env file (see README).
// A Google Apps Script web-app URL backed by a Sheet works well here.
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || ''

// Optional fast-track. OFF by default. When true, a "Grab a time now" button is
// shown on success ONLY to qualified applicants. Leave false unless asked.
const SHOW_FASTTRACK = false
const FASTTRACK_URL = 'https://calendly.com/elammari-yassine12/30min'

const PLATFORMS = ['Instagram', 'TikTok', 'YouTube', 'Podcast', 'Other']
const AUDIENCE_SIZES = [
  'Under 10,000',
  '10,000 to 50,000',
  '50,000 to 500,000',
  '500,000+',
]

// --- Qualification logic (computed on submit, never shown to the applicant) -
function computeQualified(size) {
  return ['10,000 to 50,000', '50,000 to 500,000', '500,000+'].includes(size)
}
function computeTier(size) {
  if (size === '50,000 to 500,000' || size === '500,000+') return 'Macro'
  if (size === '10,000 to 50,000') return 'Micro/Mid'
  return 'Below threshold'
}

const EMPTY = {
  fullName: '',
  email: '',
  platform: '',
  handle: '',
  audienceSize: '',
  niche: '',
  tip: '',
  notes: '',
}

const REQUIRED = ['fullName', 'email', 'platform', 'handle', 'audienceSize', 'niche']
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)

function validate(values) {
  const errors = {}
  REQUIRED.forEach((key) => {
    if (!values[key].trim()) errors[key] = 'This field is required.'
  })
  if (values.email.trim() && !isEmail(values.email.trim())) {
    errors.email = 'Please enter a valid email address.'
  }
  return errors
}

export default function ApplyForm() {
  const [values, setValues] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [result, setResult] = useState({ qualified: false }) // for optional fast-track

  const setField = (key) => (e) => {
    const next = { ...values, [key]: e.target.value }
    setValues(next)
    if (touched[key]) setErrors(validate(next))
  }
  const onBlur = (key) => () => {
    setTouched((t) => ({ ...t, [key]: true }))
    setErrors(validate(values))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const found = validate(values)
    setErrors(found)
    setTouched(REQUIRED.reduce((acc, k) => ({ ...acc, [k]: true }), {}))
    if (Object.keys(found).length > 0) {
      // Move focus to the first invalid field for keyboard users.
      const first = REQUIRED.find((k) => found[k])
      if (first) document.getElementById(`field-${first}`)?.focus()
      return
    }

    const qualified = computeQualified(values.audienceSize)
    const tier = computeTier(values.audienceSize)
    const payload = {
      ...values,
      qualified,
      tier,
      timestamp: new Date().toISOString(),
    }
    setResult({ qualified })
    setStatus('submitting')

    // Empty endpoint in dev: log and show success so the flow is previewable.
    if (!ENDPOINT) {
      // eslint-disable-next-line no-console
      console.info('[The Wellness Billion] VITE_FORM_ENDPOINT is not set. Payload:', payload)
      setTimeout(() => setStatus('success'), 600)
      return
    }

    try {
      // text/plain avoids a CORS preflight, which keeps Google Apps Script
      // endpoints happy. The body is still JSON; parse it server-side.
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`Request failed: ${res.status}`)
      setStatus('success')
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[The Wellness Billion] Submission failed:', err)
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <section id="apply" className="section bg-paper scroll-mt-24">
        <div className="container-editorial max-w-2xl">
          <Reveal>
            <div className="rounded-card border border-line bg-sand/60 p-8 text-center shadow-soft sm:p-12">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-terracotta/12 text-terracotta">
                <IconCheck className="h-7 w-7" />
              </span>
              <h2 className="mt-6 text-3xl font-semibold sm:text-4xl">Thanks for applying.</h2>
              <p className="mx-auto mt-4 max-w-md text-lg leading-relaxed text-body">
                We read every application and will reach out if you are a good fit for the show.
              </p>
              {SHOW_FASTTRACK && result.qualified && (
                <a
                  href={FASTTRACK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-8"
                >
                  Grab a time now
                </a>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    )
  }

  return (
    <section id="apply" className="section bg-paper scroll-mt-24">
      <div className="container-editorial grid gap-12 md:grid-cols-12">
        <div className="md:col-span-5">
          <Reveal>
            <p className="eyebrow">Apply</p>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Come tell your story.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-body">
              Tell us a little about you and your community. It takes a couple of minutes. We read
              every application and reach out if it feels like a fit.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-body/70">
              No follower count is too small to apply. Share what you are about and we will take it
              from there.
            </p>
          </Reveal>
        </div>

        <div className="md:col-span-7">
          <Reveal delay={100}>
            <form
              noValidate
              onSubmit={handleSubmit}
              className="rounded-card border border-line bg-sand/50 p-6 shadow-soft sm:p-8"
            >
              <div className="grid gap-5">
                <Field
                  id="field-fullName"
                  label="Full name"
                  required
                  error={touched.fullName && errors.fullName}
                >
                  <input
                    id="field-fullName"
                    type="text"
                    autoComplete="name"
                    className={inputCls(touched.fullName && errors.fullName)}
                    value={values.fullName}
                    onChange={setField('fullName')}
                    onBlur={onBlur('fullName')}
                    aria-required="true"
                    aria-invalid={Boolean(touched.fullName && errors.fullName)}
                    aria-describedby={touched.fullName && errors.fullName ? 'err-fullName' : undefined}
                  />
                </Field>

                <Field
                  id="field-email"
                  label="Email"
                  required
                  error={touched.email && errors.email}
                >
                  <input
                    id="field-email"
                    type="email"
                    autoComplete="email"
                    className={inputCls(touched.email && errors.email)}
                    value={values.email}
                    onChange={setField('email')}
                    onBlur={onBlur('email')}
                    aria-required="true"
                    aria-invalid={Boolean(touched.email && errors.email)}
                    aria-describedby={touched.email && errors.email ? 'err-email' : undefined}
                  />
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="field-platform"
                    label="Main platform"
                    required
                    error={touched.platform && errors.platform}
                  >
                    <select
                      id="field-platform"
                      className={inputCls(touched.platform && errors.platform)}
                      value={values.platform}
                      onChange={setField('platform')}
                      onBlur={onBlur('platform')}
                      aria-required="true"
                      aria-invalid={Boolean(touched.platform && errors.platform)}
                      aria-describedby={
                        touched.platform && errors.platform ? 'err-platform' : undefined
                      }
                    >
                      <option value="" disabled>
                        Choose one
                      </option>
                      {PLATFORMS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field
                    id="field-handle"
                    label="Your handle"
                    required
                    error={touched.handle && errors.handle}
                  >
                    <input
                      id="field-handle"
                      type="text"
                      placeholder="@yourhandle"
                      className={inputCls(touched.handle && errors.handle)}
                      value={values.handle}
                      onChange={setField('handle')}
                      onBlur={onBlur('handle')}
                      aria-required="true"
                      aria-invalid={Boolean(touched.handle && errors.handle)}
                      aria-describedby={touched.handle && errors.handle ? 'err-handle' : undefined}
                    />
                  </Field>
                </div>

                <Field
                  id="field-audienceSize"
                  label="Audience size"
                  required
                  error={touched.audienceSize && errors.audienceSize}
                >
                  <select
                    id="field-audienceSize"
                    className={inputCls(touched.audienceSize && errors.audienceSize)}
                    value={values.audienceSize}
                    onChange={setField('audienceSize')}
                    onBlur={onBlur('audienceSize')}
                    aria-required="true"
                    aria-invalid={Boolean(touched.audienceSize && errors.audienceSize)}
                    aria-describedby={
                      touched.audienceSize && errors.audienceSize ? 'err-audienceSize' : undefined
                    }
                  >
                    <option value="" disabled>
                      Choose one
                    </option>
                    {AUDIENCE_SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  id="field-niche"
                  label="Your niche / focus"
                  required
                  hint="For example: metabolic health, longevity, fitness, women's health."
                  error={touched.niche && errors.niche}
                >
                  <input
                    id="field-niche"
                    type="text"
                    className={inputCls(touched.niche && errors.niche)}
                    value={values.niche}
                    onChange={setField('niche')}
                    onBlur={onBlur('niche')}
                    aria-required="true"
                    aria-invalid={Boolean(touched.niche && errors.niche)}
                    aria-describedby={
                      touched.niche && errors.niche
                        ? 'err-niche hint-niche'
                        : 'hint-niche'
                    }
                  />
                </Field>

                <Field id="field-tip" label="A wellness tip you would share with our audience">
                  <input
                    id="field-tip"
                    type="text"
                    className={inputCls(false)}
                    value={values.tip}
                    onChange={setField('tip')}
                  />
                </Field>

                <Field id="field-notes" label="Anything else, or why you would be a great guest">
                  <textarea
                    id="field-notes"
                    rows={4}
                    className={`${inputCls(false)} resize-y`}
                    value={values.notes}
                    onChange={setField('notes')}
                  />
                </Field>
              </div>

              {status === 'error' && (
                <p
                  role="alert"
                  className="mt-5 rounded-xl border border-terracotta/40 bg-terracotta/10 px-4 py-3 text-sm text-terracotta-hover"
                >
                  Something went wrong sending your application. Please try again, or email us
                  directly.
                </p>
              )}

              <div className="mt-7 flex items-center gap-4">
                <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
                  {status === 'submitting' ? 'Sending…' : 'Submit application'}
                </button>
                <p className="text-xs leading-relaxed text-body/60">
                  We will only use your details to consider you for the show.
                </p>
              </div>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// --- Small presentational helpers -----------------------------------------
function inputCls(hasError) {
  return [
    'w-full rounded-xl border bg-paper px-4 py-3 text-base text-ink placeholder:text-body/40',
    'transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-terracotta focus-visible:ring-offset-2 focus-visible:ring-offset-sand',
    hasError ? 'border-terracotta/60' : 'border-line',
  ].join(' ')
}

function Field({ id, label, required, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {required && <span className="ml-1 text-terracotta">*</span>}
      </label>
      {hint && (
        <p id={`hint-${id.replace('field-', '')}`} className="mt-1 text-xs text-body/60">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`err-${id.replace('field-', '')}`} className="mt-1.5 text-xs font-medium text-terracotta">
          {error}
        </p>
      )}
    </div>
  )
}
