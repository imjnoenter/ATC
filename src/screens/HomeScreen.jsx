import { useState } from 'react'
import Layout from '../components/Layout.jsx'
import TransitCard from '../components/TransitCard.jsx'
import Spinner from '../components/Spinner.jsx'
import { filterByExactName, getSuggestedNames } from '../lib/flights.js'

export default function HomeScreen({ flights, loading, error, reload, progress, nickname, onNicknameChange, onSelectFlight, themeProps }) {
  const [selectedName, setSelectedName] = useState(null)

  const suggestions = selectedName ? [] : getSuggestedNames(flights, nickname)
  const filtered = selectedName
    ? filterByExactName(flights, selectedName)
    : []

  function handleInputChange(value) {
    setSelectedName(null)
    onNicknameChange(value)
  }

  function handleSelectName(name) {
    setSelectedName(name)
    onNicknameChange(name)
  }

  function handleClear() {
    setSelectedName(null)
    onNicknameChange('')
  }

  const showResults = !loading && !error && selectedName

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
          onChange={e => handleInputChange(e.target.value)}
          placeholder="e.g. John, Somchai…"
          className="input-base text-base"
          autoComplete="off"
          autoCapitalize="none"
        />

        {/* Suggestion chips — shown while typing before a name is selected */}
        {!selectedName && suggestions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map(name => (
              <button
                key={name}
                type="button"
                onClick={() => handleSelectName(name)}
                className="text-sm px-3 py-1 rounded-full bg-beige dark:bg-stone-700 text-warm-gray-dark dark:text-stone-200 border border-warm-gray-light/40 dark:border-stone-600 hover:bg-accent/20 hover:text-accent hover:border-accent/40 transition-colors"
              >
                {name}
              </button>
            ))}
          </div>
        )}

        {/* Selected name chip */}
        {selectedName && (
          <div className="mt-2 flex items-center gap-2">
            <span className="text-sm px-3 py-1.5 rounded-full bg-accent/15 text-accent border border-accent/50 font-semibold">
              {selectedName}
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-warm-gray dark:text-stone-400 hover:text-danger transition-colors px-1"
              aria-label="Clear selection"
            >
              ✕
            </button>
          </div>
        )}
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

      {showResults && (
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
                No flights found for <strong>"{selectedName}"</strong>
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

      {!loading && !error && !selectedName && !nickname.trim() && (
        <div className="card p-6 text-center mt-4">
          <div className="text-4xl mb-3">🛬</div>
          <p className="text-warm-gray dark:text-stone-400 text-sm">Enter your nickname above to see today's transits.</p>
        </div>
      )}
    </Layout>
  )
}
