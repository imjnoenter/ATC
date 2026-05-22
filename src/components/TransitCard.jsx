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

export default function TransitCard({ flight, status, onClick }) {
  const reportType = computeReportType(flight)
  const cfg = TYPE_CONFIG[reportType]
  const isDone = status === 'done'

  return (
    <button
      type="button"
      onClick={!isDone ? onClick : undefined}
      className={`w-full text-left rounded-2xl overflow-hidden border transition-all active:scale-[0.98]
        bg-white dark:bg-stone-800
        border-beige dark:border-stone-700
        shadow-cozy
        ${isDone ? 'opacity-55 cursor-default' : 'hover:shadow-cozy-md cursor-pointer'}`}
    >
      {/* Accent top bar */}
      <div className={`h-1 w-full ${cfg.accent}`} />

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
                  ? 'bg-accent-light/40 text-accent-dark dark:bg-accent/20 dark:text-accent-light'
                  : 'bg-blue-light text-blue-soft dark:bg-blue-soft/20 dark:text-blue-light'
              }`}>
                {STATUS_LABEL[status]}
              </span>
            )}
          </div>
        </div>

        {/* Shared 4-column grid — aligns FLT↔FLT, ARR↔DEP, STA↔STD, BAY only in arrival */}
        <div className="bg-beige/50 dark:bg-stone-700/40 rounded-xl px-3 py-2.5">
          <div className="grid grid-cols-4 gap-x-2 gap-y-3">
            {/* Arrival section label */}
            <div className="col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warm-gray dark:text-stone-500">✈ Arrival</p>
            </div>
            <Cell label="FLT" value={flight.flt} />
            <Cell label="ARR" value={flight.arr} />
            <Cell label="STA" value={flight.sta} />
            <Cell label="BAY" value={flight.bay} />

            {/* Divider */}
            <div className="col-span-4 border-t border-beige dark:border-stone-600" />

            {/* Departure section label */}
            <div className="col-span-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-warm-gray dark:text-stone-500">✈ Departure</p>
            </div>
            <Cell label="FLT" value={flight.fltDep} />
            <Cell label="DEP" value={flight.dep} />
            <Cell label="STD" value={flight.std} />
            <div />{/* empty 4th col to keep grid uniform */}
          </div>
        </div>

        {/* Mech */}
        {flight.mechTech && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-warm-gray dark:text-stone-500 uppercase tracking-wider">Crew</span>
            <span className="text-xs font-medium text-warm-gray-dark dark:text-stone-300">{flight.mechTech}</span>
          </div>
        )}
      </div>

      {/* Footer tap hint */}
      {!isDone && (
        <div className="px-4 pb-3 flex justify-end">
          <span className="text-xs text-warm-gray-light dark:text-stone-600">Tap to start report →</span>
        </div>
      )}
    </button>
  )
}
