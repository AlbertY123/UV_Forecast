export function toLocalDateTime(iso: string) {
  // Open-Meteo returns local-time ISO strings when timezone is provided (no Z suffix).
  // This parses safely in modern browsers.
  return new Date(iso)
}

export function dayKey(d: Date) {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatHour(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDayLabel(d: Date) {
  return d.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })
}
