export default function InstallBanner({ onInstall, onDismiss }) {
  return (
    <div className="card p-3 mb-4 flex items-center gap-3 border-accent/30 bg-accent/5 dark:bg-accent/10">
      <span className="text-xl shrink-0">📲</span>
      <p className="flex-1 text-sm text-warm-gray-dark dark:text-stone-200 leading-snug">
        Add ATC to your home screen for quick access
      </p>
      <button
        type="button"
        onClick={onInstall}
        className="shrink-0 bg-accent text-white text-xs font-semibold rounded-lg py-1.5 px-3 active:scale-[0.97] transition-all"
      >
        Install
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 text-warm-gray dark:text-stone-400 hover:text-danger transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}
