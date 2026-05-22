import Layout from '../components/Layout.jsx'

export default function DoneScreen({ flight, onBackHome, themeProps }) {
  return (
    <Layout {...themeProps}>
      <div className="flex flex-col items-center justify-center min-h-[60dvh] text-center">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-warm-gray-dark dark:text-stone-100 mb-1">Report Complete</h2>
        <p className="text-warm-gray dark:text-stone-400 text-sm mb-1">
          {flight.reg} · {flight.flt || flight.fltDep}
        </p>
        <p className="text-warm-gray-light dark:text-stone-500 text-xs mb-8">
          Transit report submitted successfully.
        </p>
        <button type="button" onClick={onBackHome} className="btn-primary max-w-xs">
          Back to Dashboard
        </button>
      </div>
    </Layout>
  )
}
