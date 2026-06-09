# Store Domain Model

## Current Step

The store now has the first commerce-oriented domain layer. The existing `UserAsset` install record remains for desktop sync compatibility, but access should gradually move to `Entitlement`.

## Entities

- `Asset`: Product listing owned by an author.
- `AssetVersion`: Versioned downloadable/installable package metadata.
- `Entitlement`: User's right to use an asset.
- `CartItem`: User's pending purchase/install intent.
- `WishlistItem`: User's saved interest.
- `UserAsset`: MVP installation record used by the current desktop sync API.
- `AppRelease`: Desktop application release metadata used by the store download page and future updater.

## Flow

```text
Wishlist -> Cart -> Checkout -> Entitlement -> Install -> Desktop Sync
```

For free assets, checkout can grant an entitlement immediately. For paid assets, checkout will later call a payment provider and grant entitlement only after payment confirmation.

## Compatibility

`POST /assets/:id/install` currently grants a free/purchase entitlement and then creates a `UserAsset` install record. This keeps the existing desktop app working while the store moves toward library-based entitlement sync.

Future desktop sync should prefer:

```text
GET /library/assets
```

over:

```text
GET /assets/me/installed
```
