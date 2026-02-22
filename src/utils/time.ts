export function toLocalDateTime(iso: string) {
  // Open-Meteo returns local-time ISO strings when timezone is provided (no Z suffix).
  // This parses safely in modern browsers.
  return new Date(iso)
}

export function dayKey(d: Date) {
  return d.toISOString().slice(0, 10)
}

export function formatHour(d: Date) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export function formatDayLabel(d: Date) {
  return d.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' })
}
