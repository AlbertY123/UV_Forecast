import { useMemo } from 'react'
import { toLocalDateTime, formatDayLabel, formatHour, dayKey } from '../utils/time'
import { UvBadge } from './UvBadge'

type Row = { t: Date; uv: number }

export function HourlyTable({ times, uvs }: { times: string[]; uvs: number[] }) {
  const grouped = useMemo(() => {
    const n = Math.min(times.length, uvs.length)
    const byDay = new Map<string, { label: string; rows: Row[] }>()

    for (let i = 0; i < n; i++) {
      const t = toLocalDateTime(times[i])
      const key = dayKey(t)
      const uv = uvs[i] ?? 0
      const g = byDay.get(key)
      if (!g) byDay.set(key, { label: formatDayLabel(t), rows: [{ t, uv }] })
      else g.rows.push({ t, uv })
    }

    return Array.from(byDay.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([, v]) => v)
  }, [times, uvs])

  return (
    <div className="card">
      <div className="card__head">
        <div>
          <div className="card__title">Hourly table</div>
          <div className="card__sub">Tip: hover the chart for quick reads.</div>
        </div>
      </div>

      <div className="tableWrap">
        {grouped.map((g) => (
          <div key={g.label} className="dayBlock">
            <div className="dayBlock__head">{g.label}</div>
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>UV</th>
                </tr>
              </thead>
              <tbody>
                {g.rows.map((r) => (
                  <tr key={r.t.toISOString()}>
                    <td className="mono">{formatHour(r.t)}</td>
                    <td>
                      <UvBadge uv={r.uv} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  )
}
