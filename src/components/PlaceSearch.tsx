import { useEffect, useMemo, useRef, useState } from 'react'
import type { Place } from '../types'
import { geocodePlaces } from '../api/openMeteo'

function placeLabel(p: Place) {
  const bits = [p.name, p.admin1, p.country].filter(Boolean)
  return bits.join(', ')
}

export function PlaceSearch({
  value,
  onPick,
}: {
  value: Place | null
  onPick: (p: Place) => void
}) {
  const [query, setQuery] = useState(value?.name ?? '')
  const [results, setResults] = useState<Place[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const lastReq = useRef(0)

  useEffect(() => {
    setQuery(value?.name ?? '')
  }, [value?.name])

  useEffect(() => {
    const q = query.trim()
    setErr(null)
    if (q.length < 2) {
      setResults([])
      return
    }

    const reqId = Date.now()
    lastReq.current = reqId
    setLoading(true)

    const handle = setTimeout(() => {
      geocodePlaces(q)
        .then((r) => {
          if (lastReq.current !== reqId) return
          setResults(r)
          setOpen(true)
        })
        .catch((e) => {
          if (lastReq.current !== reqId) return
          setErr(e?.message ?? 'Search failed')
          setResults([])
          setOpen(true)
        })
        .finally(() => {
          if (lastReq.current !== reqId) return
          setLoading(false)
        })
    }, 250)

    return () => clearTimeout(handle)
  }, [query])

  const pickedLabel = useMemo(() => (value ? placeLabel(value) : ''), [value])

  return (
    <div className="place">
      <label className="label">Location</label>
      <div className="place__row">
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Try: Melbourne, Sydney, Auckland, Tokyo…"
          aria-label="Search location"
        />
        <button
          className="btn"
          type="button"
          onClick={() => {
            setQuery(pickedLabel || query)
            setOpen((v) => !v)
          }}
          aria-label="Toggle results"
        >
          {loading ? '…' : '▾'}
        </button>
      </div>

      {open && (results.length > 0 || err) && (
        <div className="place__panel">
          {err && <div className="place__err">{err}</div>}
          {results.slice(0, 8).map((p) => (
            <button
              key={`${p.id ?? ''}:${p.latitude}:${p.longitude}`}
              className="place__item"
              type="button"
              onClick={() => {
                onPick(p)
                setOpen(false)
              }}
            >
              <div className="place__name">{placeLabel(p)}</div>
              <div className="place__meta">
                {p.latitude.toFixed(4)}, {p.longitude.toFixed(4)}
                {p.timezone ? ` · ${p.timezone}` : ''}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="hint">Powered by Open‑Meteo (free). Search is optional; Melbourne works by default.</div>
    </div>
  )
}
