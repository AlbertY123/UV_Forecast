import { useEffect, useMemo, useState } from 'react'
import './App.css'
import type { Place, UvForecastResponse } from './types'
import { fetchUvHourly, geocodePlaces, pickMelbourneAU } from './api/openMeteo'
import { PlaceSearch } from './components/PlaceSearch'
import { DaySummary } from './components/DaySummary'
import { UvLineChart } from './components/UvLineChart'
import { HourlyTable } from './components/HourlyTable'

function placeTitle(p: Place | null) {
  if (!p) return '—'
  const bits = [p.name, p.admin1, p.country].filter(Boolean)
  return bits.join(', ')
}

function App() {
  const [place, setPlace] = useState<Place | null>(null)
  const [forecast, setForecast] = useState<UvForecastResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [view, setView] = useState<'chart' | 'table'>('chart')
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Default: Melbourne
  useEffect(() => {
    let alive = true
    geocodePlaces('Melbourne')
      .then((r) => {
        if (!alive) return
        const picked = pickMelbourneAU(r)
        if (picked) setPlace(picked)
      })
      .catch(() => {
        // ignore; user can still search manually
      })
    return () => {
      alive = false
    }
  }, [])

  async function load(p: Place, force = false) {
    setErr(null)
    setLoading(true)
    try {
      const data = await fetchUvHourly({
        latitude: p.latitude,
        longitude: p.longitude,
        days: 3,
        timezone: 'auto',
        force,
      })
      setForecast(data)
      setLastUpdated(new Date())
    } catch (e: any) {
      setErr(e?.message ?? 'Failed to load UV forecast')
      setForecast(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!place) return
    void load(place)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [place?.latitude, place?.longitude])

  const hourly = forecast?.hourly
  const times = hourly?.time ?? []
  const uvs = hourly?.uv_index ?? []

  const headerMeta = useMemo(() => {
    if (!place) return null
    return {
      title: placeTitle(place),
      coords: `${place.latitude.toFixed(4)}, ${place.longitude.toFixed(4)}`,
      tz: forecast?.timezone ?? '—',
    }
  }, [place, forecast?.timezone])

  return (
    <div className="page">
      <header className="top">
        <div className="brand">
          <div className="brand__title">UV Forecast</div>
          <div className="brand__sub">Hourly prediction for the next 3 days (default: Melbourne)</div>
        </div>
        <div className="actions">
          <button
            className="btn btn--ghost"
            type="button"
            onClick={() => place && load(place, true)}
            disabled={!place || loading}
          >
            Refresh
          </button>
        </div>
      </header>

      <main className="wrap">
        <div className="panel">
          <PlaceSearch value={place} onPick={(p) => setPlace(p)} />

          {headerMeta && (
            <div className="metaBar">
              <div className="metaBar__title">{headerMeta.title}</div>
              <div className="metaBar__row">
                <span className="pill">{headerMeta.coords}</span>
                <span className="pill">TZ: {headerMeta.tz}</span>
                {lastUpdated && (
                  <span className="pill">
                    Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          )}

          {err && <div className="alert">{err}</div>}

          {loading && <div className="loading">Loading UV…</div>}

          {!loading && forecast && times.length > 0 && uvs.length > 0 && (
            <>
              <DaySummary times={times} uvs={uvs} />

              <div className="tabs">
                <button
                  className={`tab ${view === 'chart' ? 'tab--on' : ''}`}
                  type="button"
                  onClick={() => setView('chart')}
                >
                  Chart
                </button>
                <button
                  className={`tab ${view === 'table' ? 'tab--on' : ''}`}
                  type="button"
                  onClick={() => setView('table')}
                >
                  Table
                </button>
              </div>

              {view === 'chart' ? (
                <UvLineChart times={times} uvs={uvs} timezone={forecast.timezone} />
              ) : (
                <HourlyTable times={times} uvs={uvs} />
              )}

              <footer className="foot">
                Data: Open‑Meteo (hourly uv_index). This is a forecast — treat it as guidance, not a guarantee.
              </footer>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
