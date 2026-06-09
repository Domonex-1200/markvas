# Desktop Release Distribution

## Goal

MarkVas Store should be able to show the latest desktop app build and later support app updates without coupling the storefront to a single distribution provider.

The current implementation uses an internal release API:

```text
GET /app/releases
GET /app/releases/latest?platform=windows&channel=stable
```

The API stores release metadata in PostgreSQL. The actual binary can live on GitHub Releases, S3-compatible object storage, or a commercial CDN.

## Release Metadata

Each release includes:

- `version`: semantic desktop app version.
- `platform`: currently `windows` for the portfolio build. The API type still leaves room for future `macos` and `linux` channels.
- `channel`: `stable` or `beta`.
- `downloadUrl`: public binary URL.
- `checksum`: checksum used to verify the downloaded file.
- `signature`: optional signature for future auto-update verification.
- `releaseNotes`: short user-facing notes.

## Recommended Flow

1. Build the Electron app per OS in CI.
2. Upload the Windows `.exe` installer artifact to the release storage.
3. Generate checksums during CI.
4. Register the release metadata through the admin API or a CI deploy script.
5. The store download page reads the release API and renders platform-specific download buttons.

## Production Notes

- Do not serve unsigned auto-update binaries.
- Keep `stable` and `beta` channels separate.
- Store only metadata in PostgreSQL. Large binaries should stay in object storage or GitHub Releases.
- If downloads are private, issue short-lived signed URLs from the API instead of storing permanent private URLs.
