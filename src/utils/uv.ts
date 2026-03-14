export type UvLevel = {
  label: 'Low' | 'Moderate' | 'High' | 'Very high' | 'Extreme'
  color: string
  text: string
}

export function uvLevel(uv: number): UvLevel {
  if (uv < 3) return { label: 'Low', color: '#16a34a', text: '#052e16' }
  if (uv < 6) return { label: 'Moderate', color: '#f59e0b', text: '#451a03' }
  if (uv < 8) return { label: 'High', color: '#f97316', text: '#431407' }
  if (uv < 11) return { label: 'Very high', color: '#dc2626', text: '#450a0a' }
  return { label: 'Extreme', color: '#7c3aed', text: '#2e1065' }
}

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export function formatUv(uv: number) {
  // Open-Meteo returns floats sometimes.
  return (Math.round(uv * 10) / 10).toFixed(1)
}
