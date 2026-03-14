export type Place = {
  id?: number
  name: string
  country?: string
  country_code?: string
  admin1?: string
  latitude: number
  longitude: number
  timezone?: string
}

export type UvForecastResponse = {
  latitude: number
  longitude: number
  timezone: string
  hourly?: {
    time: string[]
    uv_index?: number[]
    uv_index_clear_sky?: number[]
  }
}
