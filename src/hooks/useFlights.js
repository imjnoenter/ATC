import { useState, useEffect } from 'react'
import { fetchFlights } from '../lib/sheet.js'

const CACHE_KEY = 'atc_flights_cache'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

function loadCache() {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function saveCache(data) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
  } catch {}
}

export function useFlights() {
  const [flights, setFlights] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function load() {
    setLoading(true)
    setError(null)
    const cached = loadCache()
    if (cached) {
      setFlights(cached)
      setLoading(false)
      return
    }
    try {
      const data = await fetchFlights()
      saveCache(data)
      setFlights(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  return { flights, loading, error, reload: load }
}
