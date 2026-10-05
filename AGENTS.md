# Running this project (Base44 dev environment)

Static frontend only: Vite 5 + React 18 + TypeScript + shadcn/ui + Tailwind. **No backend, API,
database, or external credentials** — all data (balances, transactions, budgets, goals) is
hardcoded in `src/components/Dashboard.tsx` and friends. Nothing needs to be seeded or migrated.

## Start

```sh
docker compose -f docker-compose.base44.yml up -d
```

- One service, `web`, from the plain `node:22` image with the repo bind-mounted at `/app` and
  `node_modules` in a named volume (`web_node_modules`).
- On startup it runs `npm ci` (lockfile: `package-lock.json`; `bun.lockb` is unused here) and then
  `vite --host 0.0.0.0 --port 8080` in dev mode, so source edits hot-reload.
- Host port **3000** maps to the Vite dev port **8080** (3000 is the preview entry point).

## Quirks

- `vite.config.ts` was changed from `host: "::"` / fixed port to `host: true` +
  `allowedHosts: true`: the preview reaches the dev server through the sandbox proxy, whose host
  is not `localhost`. Without `allowedHosts` Vite rejects those requests. Vite 5.4.19 supports
  `server.allowedHosts` (added in 5.4.12) — do not remove it.
- `npm ci` runs on every container start (~10s once the node_modules volume is warm); first boot
  can take a minute. The Compose healthcheck waits up to 180s for `/` to return the app shell.
- `lovable-tagger` is a dev-mode-only plugin; harmless outside Lovable.

## Verify

```sh
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3000/            # 200
curl -s http://localhost:3000/src/main.tsx | head -3                       # live, unhashed source
docker compose -f docker-compose.base44.yml ps                             # web = healthy
```

Only route is `/` (`src/App.tsx`); anything else renders `src/pages/NotFound.tsx`. No test suite,
no lint CI required to run.
