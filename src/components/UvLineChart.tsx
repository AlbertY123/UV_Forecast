import { useMemo, useState } from 'react'
import { clamp, formatUv, uvLevel } from '../utils/uv'
import { formatDayLabel, formatHour, toLocalDateTime } from '../utils/time'

type Point = { t: Date; uv: number }

function buildPath(points: { x: number; y: number }[]) {
  if (!points.length) return ''
  const [p0, ...rest] = points
  return `M ${p0.x} ${p0.y} ` + rest.map((p) => `L ${p.x} ${p.y}`).join(' ')
}

export function UvLineChart({
  times,
  uvs,
  timezone,
}: {
  times: string[]
  uvs: number[]
  timezone: string
}) {
  const pts: Point[] = useMemo(() => {
    const n = Math.min(times.length, uvs.length)
    const out: Point[] = []
    for (let i = 0; i < n; i++) {
      out.push({ t: toLocalDateTime(times[i]), uv: uvs[i] ?? 0 })
    }
    return out
  }, [times, uvs])

  const maxUv = useMemo(() => Math.max(1, ...pts.map((p) => p.uv)), [pts])

  // Keep the chart readable: pad to next integer and cap at 14.
  const yMax = useMemo(() => clamp(Math.ceil(maxUv + 0.5), 6, 14), [maxUv])

  const w = 980
  const h = 280
  const pad = { l: 44, r: 16, t: 18, b: 34 }

  const innerW = w - pad.l - pad.r
  const innerH = h - pad.t - pad.b

  const [hoverIdx, setHoverIdx] = useState<number | null>(null)

  const dayBreaks = useMemo(() => {
    // indexes where day changes
    const idxs: number[] = []
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1].t
      const b = pts[i].t
      if (a.getFullYear() !== b.getFullYear() || a.getMonth() !== b.getMonth() || a.getDate() !== b.getDate()) {
        idxs.push(i)
      }
    }
    return idxs
  }, [pts])

  const coords = useMemo(() => {
    const n = Math.max(1, pts.length - 1)
    return pts.map((p, i) => {
      const x = pad.l + (innerW * i) / n
      const y = pad.t + innerH - (innerH * p.uv) / yMax
      return { x, y }
    })
  }, [pts, innerW, innerH, yMax])

  const path = useMemo(() => buildPath(coords), [coords])

  const hover = hoverIdx != null ? pts[hoverIdx] : null
  const hoverCoord = hoverIdx != null ? coords[hoverIdx] : null

  return (
    <div className="card">
      <div className="card__head">
        <div>
          <div className="card__title">Hourly UV (next 3 days)</div>
          <div className="card__sub">Timezone: {timezone}</div>
        </div>
        {hover && (
          <div className="hover">
            <div className="hover__dt">
              {formatDayLabel(hover.t)} · {formatHour(hover.t)}
            </div>
            <div className="hover__uv">
              <span className="dot" style={{ background: uvLevel(hover.uv).color }} />
              UV {formatUv(hover.uv)} ({uvLevel(hover.uv).label})
            </div>
          </div>
        )}
      </div>

      <div className="chart">
        <svg
          viewBox={`0 0 ${w} ${h}`}
          role="img"
          aria-label="UV index line chart"
          onMouseLeave={() => setHoverIdx(null)}
          onMouseMove={(e) => {
            const svg = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
            const x = e.clientX - svg.left
            const t = clamp((x - pad.l) / innerW, 0, 1)
            const idx = Math.round(t * (pts.length - 1))
            setHoverIdx(idx)
          }}
        >
          {/* background bands */}
          {[
            { from: 0, to: 3, c: '#16a34a10' },
            { from: 3, to: 6, c: '#f59e0b14' },
            { from: 6, to: 8, c: '#f9731616' },
            { from: 8, to: 11, c: '#dc262618' },
            { from: 11, to: yMax, c: '#7c3aed14' },
          ].map((b) => {
            const y1 = pad.t + innerH - (innerH * b.from) / yMax
            const y2 = pad.t + innerH - (innerH * b.to) / yMax
            return (
              <rect
                key={`${b.from}-${b.to}`}
                x={pad.l}
                y={y2}
                width={innerW}
                height={y1 - y2}
                fill={b.c}
              />
            )
          })}

          {/* y grid */}
          {Array.from({ length: yMax + 1 }).map((_, i) => {
            const y = pad.t + innerH - (innerH * i) / yMax
            return (
              <g key={i}>
                <line x1={pad.l} x2={w - pad.r} y1={y} y2={y} stroke="#0f172a10" />
                {i % 2 === 0 && (
                  <text x={pad.l - 10} y={y + 4} textAnchor="end" fontSize="12" fill="#0f172aa8">
                    {i}
                  </text>
                )}
              </g>
            )
          })}

          {/* day breaks */}
          {dayBreaks.map((i) => {
            const x = coords[i]?.x ?? 0
            return <line key={i} x1={x} x2={x} y1={pad.t} y2={pad.t + innerH} stroke="#0f172a14" />
          })}

          {/* line */}
          <path d={path} fill="none" stroke="#0ea5e9" strokeWidth={3} strokeLinejoin="round" />

          {/* points */}
          {coords.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={i === hoverIdx ? 5 : 2.5} fill={i === hoverIdx ? '#0ea5e9' : '#0ea5e944'} />
          ))}

          {/* hover crosshair */}
          {hoverCoord && (
            <g>
              <line x1={hoverCoord.x} x2={hoverCoord.x} y1={pad.t} y2={pad.t + innerH} stroke="#0f172a2a" />
            </g>
          )}

          {/* x labels: day */}
          {[
            { idx: 0, label: pts[0] ? formatDayLabel(pts[0].t) : '' },
            ...dayBreaks.map((i) => ({ idx: i, label: pts[i] ? formatDayLabel(pts[i].t) : '' })),
          ].map((d) => {
            const x = coords[d.idx]?.x ?? pad.l
            return (
              <text key={d.idx} x={x + 6} y={h - 10} fontSize="12" fill="#0f172aa8">
                {d.label}
              </text>
            )
          })}
        </svg>
      </div>

      <div className="legend">
        <span className="lg"><span className="sw" style={{ background: '#16a34a' }} /> Low</span>
        <span className="lg"><span className="sw" style={{ background: '#f59e0b' }} /> Moderate</span>
        <span className="lg"><span className="sw" style={{ background: '#f97316' }} /> High</span>
        <span className="lg"><span className="sw" style={{ background: '#dc2626' }} /> Very high</span>
        <span className="lg"><span className="sw" style={{ background: '#7c3aed' }} /> Extreme</span>
      </div>
    </div>
  )
}
