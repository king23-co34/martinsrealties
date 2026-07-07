# Martins Realties — Frontend

A complete, responsive frontend for **Martins Realties** (D'S Martins Nig Enterprise), built with plain **HTML, Tailwind CSS (via CDN) and vanilla JavaScript** — no build step, no framework, no bundler required.

It is fully integrated with the live backend at:
```
https://martinsrealties-backend.onrender.com/api/v1
```

## Running it

There's nothing to install or build. Because pages use `fetch()` (which requires HTTP, not `file://`), serve the folder with any static server, for example:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open the printed local URL in your browser.

To deploy, upload this folder as-is to any static host (Vercel, Netlify, GitHub Pages, cPanel, etc). No environment variables or build commands are needed — the backend URL is set directly in `js/api.js`.

## Structure

```
├── index.html              Homepage (hero, services, featured properties, reviews, blog, contact, FAQ)
├── about.html
├── properties.html         Listing with search/filter/sort/pagination
├── property-details.html   Single property + gallery + add-to-cart
├── blog.html                See note below
├── contact.html
├── login.html / register.html
├── profile.html             Profile edit, password change, order history
├── cart.html / checkout.html
├── admin/                   Admin dashboard, properties, orders, inquiries, reviews, users
├── css/style.css            Brand tokens, fonts, loader/skeleton animations
├── js/
│   ├── api.js                Single API client — every backend endpoint in one place
│   ├── ui.js                 Navbar/footer, toasts, loader, auth guards, shared card renderers
│   ├── main.js, properties.js, property-details.js, profile.js, cart.js, checkout.js
│   └── admin/                One script per admin page
└── assets/logo.png
```

## Backend integration

- Every API call lives in `js/api.js`, matching the endpoints, request bodies, and response shapes in the backend's own README/controllers exactly (e.g. `POST /auth/login` → `{ token, data: { user } }`, `GET /properties` → `{ total, page, pages, data: { properties } }`).
- **Auth**: on login/register, the JWT from the response body is stored in `localStorage` and sent as `Authorization: Bearer <token>` on every request (the backend's httpOnly cookie is also accepted automatically via `credentials: 'include'`, but Bearer is the primary mechanism since the frontend and API are on different domains).
- **Protected pages** (`profile`, `cart`, `checkout`, all of `/admin`) check auth client-side via `requireAuth()` / `requireAdmin()` in `js/ui.js` and redirect to login if needed. The backend still enforces its own auth/role checks — this is a UX convenience, not a security boundary.
- **Image uploads** (property create/edit) are sent as `multipart/form-data` with field name `images`, matching the Multer/Cloudinary setup.
- **Errors**: any non-2xx response is surfaced via a toast using the backend's `message` field (and `express-validator` field errors when present).

## One known gap: Blog

The backend documented in the project's README has **no blog endpoints or model**. Rather than invent fake posts, `blog.html` and the homepage's blog section show an honest "coming soon" placeholder. If/when blog endpoints are added to the backend, wire them into `js/main.js` (`blogPreview()`) and `blog.html` the same way `properties.js` consumes `/properties`.

## CORS

Make sure the backend's `CORS_ORIGINS` environment variable includes whichever origin you deploy this frontend to (e.g. `https://your-frontend.vercel.app`), or requests will be blocked by the browser.
