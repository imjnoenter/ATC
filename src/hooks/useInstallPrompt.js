import { useState, useEffect } from 'react'

const DISMISSED_KEY = 'pwa-install-dismissed'

export function useInstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISSED_KEY) === '1'
  )

  useEffect(() => {
    const handler = e => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!prompt) return
    prompt.prompt()
    await prompt.userChoice
    setPrompt(null)
  }

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1')
    setDismissed(true)
  }

  return { canInstall: !!prompt && !dismissed, install, dismiss }
}
