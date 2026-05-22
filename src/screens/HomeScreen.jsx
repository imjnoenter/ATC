import Layout from '../components/Layout.jsx'
import TransitCard from '../components/TransitCard.jsx'
import Spinner from '../components/Spinner.jsx'
import { filterByNickname } from '../lib/flights.js'

export default function HomeScreen({ flights, loading, error, reload, progress, nickname, onNicknameChange, onSelectFlight, themeProps }) {
  const filtered = filterByNickname(flights, nickname)

  return (
    <Layout {...themeProps}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-2xl font-bold text-warm-gray-dark dark:text-stone-100 tracking-tight">ATC</h1>
          <button
            type="button"
            onClick={reload}
            disabled={loading}
            className="text-xs text-warm-gray dark:text-stone-400 hover:text-accent transition-colors px-2 py-1 rounded-lg"
          >
            {loading ? <Spinner size="sm" /> : '↻ Refresh'}
          </button>
        </div>
        <p className="text-warm-gray dark:text-stone-400 text-sm">Aircraft Transit Checker</p>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-warm-gray dark:text-stone-400 uppercase tracking-wider mb-2">
          Your Nickname
        </label>
        <input
          type="text"
          value={nickname}
          onChange={e => onNicknameChange(e.target.value)}
          placeholder="e.g. John, Somchai…"
          className="input-base text-base"
          autoComplete="off"
          autoCapitalize="none"
        />
      </div>

      {loading && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Spinner />
          <p className="text-warm-gray dark:text-stone-400 text-sm">Fetching today's schedule…</p>
        </div>
      )}

      {error && !loading && (
        <div className="card p-4 border-danger/30 bg-danger-light/20 dark:bg-red-900/20 dark:border-red-700/30 space-y-2">
          <p className="text-sm font-semibold text-danger">Unable to load schedule</p>
          <p className="text-xs text-warm-gray dark:text-stone-400">{error}</p>
          <p className="text-xs text-warm-gray dark:text-stone-400">
            Make sure the Google Sheet is shared publicly ("Anyone with the link can view").
          </p>
          <button type="button" onClick={reload} className="btn-primary mt-2 text-sm py-2">
            Try Again
          </button>
        </div>
      )}

      {!loading && !error && nickname.trim() && (
        <div>
          <p className="text-xs font-semibold text-warm-gray dark:text-stone-400 uppercase tracking-wider mb-3">
            {filtered.length > 0
              ? `${filtered.length} flight${filtered.length !== 1 ? 's' : ''} assigned`
              : 'No flights found'}
          </p>
          {filtered.length === 0 && (
            <div className="card p-6 text-center">
              <div className="text-3xl mb-2">✈️</div>
              <p className="text-warm-gray dark:text-stone-400 text-sm">
                No flights found for <strong>"{nickname}"</strong>
              </p>
              <p className="text-xs text-warm-gray-light dark:text-stone-500 mt-1">
                Check your nickname or try a shorter search.
              </p>
            </div>
          )}
          <div className="space-y-3">
            {filtered.map(flight => (
              <TransitCard
                key={flight.id}
                flight={flight}
                status={progress[flight.id]}
                onClick={() => onSelectFlight(flight)}
              />
            ))}
          </div>
        </div>
      )}

      {!loading && !error && !nickname.trim() && (
        <div className="card p-6 text-center mt-4">
          <div className="text-4xl mb-3">🛬</div>
          <p className="text-warm-gray dark:text-stone-400 text-sm">Enter your nickname above to see today's transits.</p>
        </div>
      )}
    </Layout>
  )
}
