import type { Place, UvForecastResponse } from '../types'

const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

function cacheGet<T>(key: string, maxAgeMs: number): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { savedAt: number; value: T }
    if (!parsed?.savedAt) return null
    if (Date.now() - parsed.savedAt > maxAgeMs) return null
    return parsed.value
  } catch {
    return null
  }
}

function cacheSet<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify({ savedAt: Date.now(), value }))
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export async function geocodePlaces(name: string, count = 8): Promise<Place[]> {
  const q = name.trim()
  if (!q) return []

  const url = new URL(GEO_URL)
  url.searchParams.set('name', q)
  url.searchParams.set('count', String(count))
  url.searchParams.set('language', 'en')
  url.searchParams.set('format', 'json')

  const cacheKey = `geo:${q.toLowerCase()}`
  const cached = cacheGet<Place[]>(cacheKey, 24 * 60 * 60 * 1000)
  if (cached) return cached

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Geocoding failed (${res.status})`)
  const data = (await res.json()) as { results?: Place[] }
  const results = data.results ?? []
  cacheSet(cacheKey, results)
  return results
}

export function pickMelbourneAU(results: Place[]): Place | null {
  if (!results.length) return null

  const exact = results.find(
    (r) => r.name.toLowerCase() === 'melbourne' && r.country_code === 'AU' && r.admin1?.toLowerCase() === 'victoria',
  )
  if (exact) return exact

  const au = results.find((r) => r.name.toLowerCase() === 'melbourne' && r.country_code === 'AU')
  if (au) return au

  return results[0]
}

export async function fetchUvHourly(params: {
  latitude: number
  longitude: number
  days?: number
  timezone?: string
  force?: boolean
}): Promise<UvForecastResponse> {
  const days = params.days ?? 3
  const tz = params.timezone ?? 'auto'

  const url = new URL(FORECAST_URL)
  url.searchParams.set('latitude', String(params.latitude))
  url.searchParams.set('longitude', String(params.longitude))
  url.searchParams.set('hourly', 'uv_index')
  url.searchParams.set('forecast_days', String(days))
  url.searchParams.set('timezone', tz)

  const cacheKey = `uv:${params.latitude.toFixed(4)}:${params.longitude.toFixed(4)}:${days}:${tz}`
  if (!params.force) {
    const cached = cacheGet<UvForecastResponse>(cacheKey, 10 * 60 * 1000)
    if (cached) return cached
  }

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Forecast failed (${res.status})`)
  const data = (await res.json()) as UvForecastResponse
  cacheSet(cacheKey, data)
  return data
}
