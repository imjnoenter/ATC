import { computeReportType } from '../lib/flights.js'

const STATUS_LABEL = { inProgress: 'In Progress', done: '✓ Done' }

const TYPE_CONFIG = {
  PREDEP:  { label: 'LT Pre-Dep', accent: 'bg-danger',      badge: 'bg-danger-light text-danger dark:bg-red-900/40 dark:text-red-300' },
  ARRIVAL: { label: 'LT Arrival', accent: 'bg-blue-soft',   badge: 'bg-blue-light text-blue-soft dark:bg-blue-soft/20 dark:text-blue-light' },
  TRANSIT: { label: 'Transit',    accent: 'bg-accent',      badge: 'bg-accent-light/50 text-accent-dark dark:bg-accent/20 dark:text-accent-light' },
}

function Cell({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-warm-gray dark:text-stone-500">
        {label}
      </span>
      <span className="text-sm font-semibold text-warm-gray-dark dark:text-stone-100 truncate">
        {value || <span className="text-warm-gray-light dark:text-stone-600">—</span>}
      </span>
    </div>
  )
}

export default function TransitCard({ flight, status, onClick, onToggleDone }) {
  const reportType = computeReportType(flight)
  const cfg = TYPE_CONFIG[reportType]
  const isDone = status === 'done'

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden border transition-all
        ${isDone
          ? 'bg-white dark:bg-stone-800 border-accent/30 dark:border-accent/20'
          : 'bg-white dark:bg-stone-800 border-beige dark:border-stone-700 shadow-cozy'}`}
    >
      {/* Accent top bar */}
      <div className={`h-1 w-full ${isDone ? 'bg-accent/40' : cfg.accent}`} />

      <div className="p-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-warm-gray-dark dark:text-stone-100">
              {flight.reg}
            </span>
            {flight.bay && (
              <span className="text-xs font-medium text-warm-gray dark:text-stone-400 bg-beige dark:bg-stone-700 px-2 py-0.5 rounded-lg">
                Bay {flight.bay}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.badge}`}>
              {cfg.label}
            </span>
            {status && STATUS_LABEL[status] && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                status === 'done'
                  ? 'bg-accent/20 text-accent dark:bg-accent/20 dark:text-accent-light'
                  : 'bg-blue-light text-blue-soft dark:bg-blue-soft/20 dark:text-blue-light'
              }`}>
                {STATUS_LABEL[status]}
              </span>
            )}
          </div>
        </div>

        {/* Shared 4-column grid */}
        <div className="bg-beige/50 dark:bg-stone-700/40 rounded-xl px-3 py-2.5">
          <div className="grid grid-cols-4 gap-x-2 gap-y-3">
            <div className="col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warm-gray dark:text-stone-500">✈ Arrival</p>
            </div>
            <Cell label="FLT" value={flight.flt} />
            <Cell label="ARR" value={flight.arr} />
            <Cell label="STA" value={flight.sta} />
            <Cell label="BAY" value={flight.bay} />

            <div className="col-span-4 border-t border-beige dark:border-stone-600" />

            <div className="col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warm-gray dark:text-stone-500">✈ Departure</p>
            </div>
            <Cell label="FLT" value={flight.fltDep} />
            <Cell label="DEP" value={flight.dep} />
            <Cell label="STD" value={flight.std} />
            <div />
          </div>
        </div>

        {flight.mechTech && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-warm-gray dark:text-stone-500 uppercase tracking-wider">Crew</span>
            <span className="text-xs font-medium text-warm-gray-dark dark:text-stone-300">{flight.mechTech}</span>
          </div>
        )}
      </div>

      {/* Footer: tap hint + done toggle */}
      <div className="px-4 pb-3 flex items-center justify-between gap-2">
        {!isDone ? (
          <button
            type="button"
            onClick={onClick}
            className="text-xs text-warm-gray-light dark:text-stone-600 hover:text-accent transition-colors active:scale-95"
          >
            Tap to start report →
          </button>
        ) : (
          <span className="text-xs text-accent/60 dark:text-accent/50">Report submitted</span>
        )}

        {onToggleDone && (
          <button
            type="button"
            onClick={onToggleDone}
            aria-label={isDone ? 'Mark undone' : 'Mark done'}
            className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0 text-xs font-bold
              ${isDone
                ? 'border-accent bg-accent text-white'
                : 'border-warm-gray-light dark:border-stone-600 text-transparent hover:border-accent hover:text-accent/50'}`}
          >
            ✓
          </button>
        )}
      </div>
    </div>
  )
}
