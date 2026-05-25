# Player Platform

React/Vite player for HLS playback through a provider with token-based access parameters.

## Requirements

- Node.js 22+
- npm 10+
- Docker + Docker Compose (for containerized run)

## ENV Setup

1. Copy `.env.example` to `.env`.
2. Set the variables:

```dotenv
VITE_VIDEO_PROVIDER_HOST=http://10.88.88.2
VITE_VIDEO_PROVIDER_PROXY_PATH=/hls-proxy
VITE_VIDEO_POSTER_PATH=/thumbnails
VITE_DEFAULT_VIDEO_ID=3fb87d2e-b294-4c4e-a937-9be65496e1f7
VITE_DEFAULT_TOKEN=change_me_service_key_32_chars_min
```

## Local Run (without Docker)

```bash
npm ci
npm run dev
```

The app will be available at `http://localhost:5173`.

## Run with Docker Compose

```bash
docker compose up --build
```

The app will be available at `http://localhost:5173`.

### ENV Configuration in Compose

- Values from `.env` are loaded via `env_file`.
- You can override them in `docker-compose.yml` under `environment`.
- Host port can be configured with `VITE_PORT`:

```bash
VITE_PORT=4173 docker compose up --build
```

## Useful Commands

```bash
npm run dev      # run in development mode
npm run build    # production build
npm run preview  # preview production build locally
npm run lint     # run eslint
```

## Iframe Embedding

Pass parameters in the query string:

`https://your-player-host/?id=3fb87d2e-b294-4c4e-a937-9be65496e1f7&token=393787af868c1e71cc031ef6f91b848cc599550a427d697452835ac9664cb448&expires=1779665729&codec=av1`

Iframe example:

```html
<iframe
  src="https://your-player-host/?id=3fb87d2e-b294-4c4e-a937-9be65496e1f7&token=...&expires=...&codec=av1"
  width="100%"
  height="100%"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  frameborder="0"
></iframe>
```

If `allowfullscreen` or `allow="fullscreen"` is missing, fullscreen mode will not work inside the iframe.

## Stream URL Format

The player builds stream URL in this format:

`{VITE_VIDEO_PROVIDER_HOST}{VITE_VIDEO_PROVIDER_PROXY_PATH}/{id}/master.m3u8?token={token}&expires={expires}&codec={codec}`
