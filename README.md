# Interview Coach Frontend

Production-ready frontend scaffold for the current Spring Boot backend.

## Stack

- React 18 + TypeScript + Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- Zustand
- CSS tokens in `src/shared/styles/global.css`

## Run

```bash
npm install
cp .env.example .env
npm run generate:api
npm run dev
```

Build:

```bash
npm run build
```

## Production Docker image

```bash
docker build -t interview-coach-frontend:latest .
```

The image serves the built app with `nginx` on port `80`.

## Kubernetes

Raw manifests are in [k8s](/Users/sir/Desktop/Diplom/project/Interview-Coach-Frontend/k8s).

## Helm

Chart is in [helm/interview-coach-frontend](/Users/sir/Desktop/Diplom/project/Interview-Coach-Frontend/helm/interview-coach-frontend).

Install:

```bash
helm upgrade --install interview-coach-frontend ./helm/interview-coach-frontend
```

Override image and backend URL:

```bash
helm upgrade --install interview-coach-frontend ./helm/interview-coach-frontend \
  --set image.repository=your-registry/interview-coach-frontend \
  --set image.tag=latest \
  --set runtimeConfig.apiBaseUrl=http://interview-coach-backend.default.svc.cluster.local:8080
```

The frontend runtime config is rendered into `ConfigMap` key `app-config.js`, so `apiBaseUrl` can be changed without rebuilding the image.

## Docker Compose

For simple dev startup:

```bash
docker compose up --build
```

Frontend will be available at `http://localhost:5173`.

By default the container points to backend at `http://host.docker.internal:8080`.
If needed, override it in `.env`:

```bash
VITE_API_BASE_URL=http://host.docker.internal:8080
```

If your backend is another compose service later, replace it with that service URL, for example `http://backend:8080`.

## OpenAPI as source of truth

Spec is stored in [docs/openapi.yaml](/Users/sir/Desktop/Diplom/Interview-Coach-Frontend/docs/openapi.yaml).

Client generation script:

```bash
npm run generate:api
```

Current repository also includes a committed fallback schema at [src/api/generated/schema.ts](/Users/sir/Desktop/Diplom/Interview-Coach-Frontend/src/api/generated/schema.ts) so the app remains readable before regeneration.

## Structure

```text
src/
  app/
    providers/
    router/
  api/
    generated/
    lib/
  features/
    admin/
    auth/
    profiles/
    progress/
    sessions/
    user/
  pages/
    public/
    app/
    admin/
  shared/
    config/
    layouts/
    lib/
    styles/
    ui/
```

## Notes

- Token refresh is handled in `src/api/lib/http.ts`.
- If refresh fails, session is cleared and protected routes redirect to `/login`.
- `TODO` comments mark API ambiguities from the current spec.
