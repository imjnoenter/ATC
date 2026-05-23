import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import TransitCard from '../components/TransitCard.jsx'
import { buildPrefillUrl, computeReportType } from '../lib/formUrl.js'

const TYPE_LABEL = {
  TRANSIT: 'Transit',
  PREDEP:  'Long Transit — Pre-Dep',
  ARRIVAL: 'Long Transit — Arrival',
}


function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-accent text-white'
          : 'bg-beige dark:bg-stone-700 text-warm-gray dark:text-stone-300 hover:bg-warm-gray-light/40 dark:hover:bg-stone-600'
      }`}
    >
      {copied ? '✓ Copied' : 'Copy URL'}
    </button>
  )
}

export default function FormGuideScreen({ flight, onComplete, onBack, themeProps }) {
  const reportType = computeReportType(flight)
  const prefillUrl = buildPrefillUrl(flight)

  return (
    <Layout {...themeProps}>
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-warm-gray dark:text-stone-400 text-sm mb-4 -ml-1">
        <span>‹</span> Back
      </button>

      <div className="mb-2">
        <p className="text-xs font-semibold text-warm-gray dark:text-stone-400 uppercase tracking-wider">Automated Report</p>
        <h2 className="text-xl font-bold text-warm-gray-dark dark:text-stone-100 mt-0.5">
          {flight.reg} · {TYPE_LABEL[reportType]}
        </h2>
      </div>

      <div className="mb-4 pointer-events-none select-none">
        <TransitCard flight={flight} status="inProgress" />
      </div>

      <div className="card p-4 space-y-4 mb-4">
        <div>
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">Page 1 of 7</span>
          <h3 className="text-base font-bold text-warm-gray-dark dark:text-stone-100 mt-0.5">Open & Verify Email</h3>
          <p className="text-sm text-warm-gray dark:text-stone-400 mt-1 leading-relaxed">
            Open the pre-filled form. Tick the checkbox to record your email, then click Next.
          </p>
        </div>

      </div>

      <div className="card p-3 mb-4 flex items-center gap-2">
        <p className="text-xs text-warm-gray dark:text-stone-400 flex-1 truncate">Pre-fill URL ready</p>
        <CopyButton text={prefillUrl} />
      </div>

      <div className="space-y-2">
        <button type="button" onClick={() => window.open(prefillUrl, '_blank', 'noopener')} className="btn-primary">
          Open Pre-Filled Form ↗
        </button>
        <button type="button" onClick={onComplete} className="btn-secondary">
          Mark as Complete ✓
        </button>
      </div>
    </Layout>
  )
}
