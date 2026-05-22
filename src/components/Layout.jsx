export default function Layout({ children, className = '', onThemeToggle, dark }) {
  return (
    <div className="min-h-dvh bg-cream dark:bg-stone-900 transition-colors duration-200">
      <div className={`max-w-md mx-auto px-4 py-6 ${className}`}>
        {onThemeToggle && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={onThemeToggle}
              aria-label="Toggle dark mode"
              className="w-9 h-9 flex items-center justify-center rounded-xl
                         bg-beige dark:bg-stone-700 text-warm-gray dark:text-stone-300
                         hover:bg-warm-gray-light/40 dark:hover:bg-stone-600 transition-all text-base"
            >
              {dark ? '☀️' : '🌙'}
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}
