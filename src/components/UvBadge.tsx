import { formatUv, uvLevel } from '../utils/uv'

export function UvBadge({ uv }: { uv: number }) {
  const lvl = uvLevel(uv)
  return (
    <span
      className="uv-badge"
      style={{ background: lvl.color, color: lvl.text, borderColor: lvl.text + '22' }}
      title={`UV ${formatUv(uv)} · ${lvl.label}`}
    >
      <span className="uv-badge__num">{formatUv(uv)}</span>
      <span className="uv-badge__lbl">{lvl.label}</span>
    </span>
  )
}
