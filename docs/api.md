# API Contract

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `GET /auth/me`

## Assets

- `GET /assets`
- `GET /assets/:id`
- `POST /assets` requires `DEVELOPER` or `ADMIN`
- `GET /assets/admin/review` requires `ADMIN`
- `POST /assets/:id/submit-review` requires asset author or `ADMIN`
- `POST /assets/:id/approve` requires `ADMIN`
- `POST /assets/:id/reject` requires `ADMIN`
- `POST /assets/:id/install` requires login
- `GET /assets/me/installed` requires login
- `GET /assets/me/entitlements` requires login
- `GET /assets/me/wishlist` requires login
- `POST /assets/:id/wishlist` requires login
- `DELETE /assets/:id/wishlist` requires login
- `GET /assets/me/cart` requires login
- `POST /assets/:id/cart` requires login
- `DELETE /assets/:id/cart` requires login
- `POST /assets/me/cart/checkout-free` requires login

## Desktop Releases

- `GET /app/releases`
- `GET /app/releases/latest?platform=windows&channel=stable`
- `POST /app/releases` requires `ADMIN`

## Asset Metadata

```json
{
  "version": "1.0.0",
  "description": "Warm editorial theme",
  "tokens": {
    "colors": {
      "paper": "#f8f7f3",
      "accent": "#2b7a78"
    },
    "editorCss": ".prose-canvas h1 { color: #2b7a78; }",
    "exportCss": "@page { margin: 16mm; }"
  }
}
```
