Demo: https://uvprediction.netlify.app/
# UV Forecast (Melbourne + anywhere)

A  React + Vite app that shows **hourly UV index forecast for the next 3 days**.

- Default location: **Melbourne, AU**
- Optional: search any place (via Open‑Meteo geocoding)
- Views: **Chart** (hover for details) + **Table**
- Caches API responses in `localStorage` for 10 minutes to avoid hammering the API

## Data source

Uses **Open‑Meteo** (free, no API key):
- Geocoding: https://geocoding-api.open-meteo.com/
- Forecast: https://open-meteo.com/

We request: `hourly=uv_index` with `forecast_days=3` and `timezone=auto`.

## Run locally

From this folder:

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Notes

- UV is a forecast. treat it as guidance.
- If you want to pin it to Melbourne-only, remove the search UI and hardcode the coordinates.
