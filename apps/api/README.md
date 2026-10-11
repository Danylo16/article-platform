# Article Platform API

## Media storage

Local development uses `MEDIA_STORAGE_DRIVER="local"` and writes images to
`apps/api/uploads`. Existing `/uploads/...` URLs remain available when another
driver is enabled.

For Cloudflare R2 or another S3-compatible service, set:

```dotenv
MEDIA_STORAGE_DRIVER="s3"
S3_ENDPOINT="https://<account-id>.r2.cloudflarestorage.com"
S3_REGION="auto"
S3_BUCKET="article-platform-media"
S3_ACCESS_KEY_ID="..."
S3_SECRET_ACCESS_KEY="..."
S3_PUBLIC_URL="https://media.example.com"
```

`S3_PUBLIC_URL` must be the public base URL of the bucket. For production R2,
use a custom domain connected to the bucket. The `r2.dev` URL is suitable only
for development.

When the API runs on AWS with an IAM role, omit both credential variables and
the AWS SDK will use its default credential provider chain.
# Address geocoding

The location editor resolves one address at a time through the public
OpenStreetMap Nominatim service. It deliberately does not provide autocomplete.
Set an identifying user agent and, preferably, a contact email in
`apps/api/.env`:

```env
NOMINATIM_BASE_URL="https://nominatim.openstreetmap.org"
NOMINATIM_USER_AGENT="DORIDA-Article-Platform/1.0"
NOMINATIM_CONTACT_EMAIL="editor@example.com"
```

The API limits this endpoint to one request per second. For production traffic,
replace `NOMINATIM_BASE_URL` with a compatible hosted or self-hosted geocoder
without changing the CMS.
