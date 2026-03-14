import { useMemo } from 'react'
import { formatUv, uvLevel } from '../utils/uv'
import { dayKey, formatDayLabel, formatHour, toLocalDateTime } from '../utils/time'
import { UvBadge } from './UvBadge'

type DayRow = {
  day: string
  label: string
  maxUv: number
  peakTime: Date
}

export function DaySummary({ times, uvs }: { times: string[]; uvs: number[] }) {
  const days: DayRow[] = useMemo(() => {
    const n = Math.min(times.length, uvs.length)
    const bucket = new Map<string, { label: string; maxUv: number; peak: Date }>()

    for (let i = 0; i < n; i++) {
      const t = toLocalDateTime(times[i])
      const key = dayKey(t)
      const uv = uvs[i] ?? 0
      const cur = bucket.get(key)
      if (!cur || uv > cur.maxUv) {
        bucket.set(key, { label: formatDayLabel(t), maxUv: uv, peak: t })
      }
    }

    return Array.from(bucket.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(0, 3)
      .map(([day, v]) => ({ day, label: v.label, maxUv: v.maxUv, peakTime: v.peak }))
  }, [times, uvs])

  return (
    <div className="grid3">
      {days.map((d) => {
        const lvl = uvLevel(d.maxUv)
        return (
          <div key={d.day} className="card card--tight">
            <div className="card__title">{d.label}</div>
            <div className="row">
              <UvBadge uv={d.maxUv} />
              <div className="meta">
                <div className="meta__k">Peak time</div>
                <div className="meta__v">{formatHour(d.peakTime)}</div>
              </div>
            </div>
            <div className="bar">
              <div
                className="bar__fill"
                style={{ width: `${Math.min(100, (d.maxUv / 12) * 100)}%`, background: lvl.color }}
              />
            </div>
            <div className="muted">Max UV {formatUv(d.maxUv)} ({lvl.label})</div>
          </div>
        )
      })}
    </div>
  )
}
