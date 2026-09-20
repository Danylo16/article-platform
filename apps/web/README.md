# Article Platform Web

Next.js App Router frontend for the public DORIDA website and its CMS.

## Local development

The Fastify API must be available at `http://localhost:3000`.

```powershell
yarn workspace web dev
```

The web application runs at `http://localhost:5173`.

## Environment

Copy `.env.example` to `.env.local` only when the defaults need to change.

- `API_INTERNAL_URL` is used by Server Components.
- `NEXT_PUBLIC_API_URL` is used by the browser-based CMS and media URLs.
- `NEXT_PUBLIC_SITE_URL` is used for canonical URLs and metadata routes.

The CMS uses the Fastify session cookie. Browser API requests include
credentials, and protected Next.js admin routes validate the same session
server-side before rendering.

## Verification

```powershell
yarn workspace web typecheck
yarn workspace web lint
yarn workspace web build
```
