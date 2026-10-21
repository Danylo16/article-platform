#!/usr/bin/env bash
set -euo pipefail
umask 077
: "${DATABASE_URL:?Set DATABASE_URL}"
: "${UPLOAD_DIR:?Set UPLOAD_DIR}"
: "${BACKUP_DIR:?Set BACKUP_DIR outside uploads and release directories}"
# Local-storage deployments only. Pause API writes for a consistent snapshot.
mkdir -p "$BACKUP_DIR"
destination=$(mktemp -d "$BACKUP_DIR/dorida-$(date -u +%Y%m%dT%H%M%SZ)-XXXXXX")
PGDATABASE=$(node --input-type=module -e 'const url = new URL(process.env.DATABASE_URL); url.searchParams.delete("schema"); process.stdout.write(url.href)')
export PGDATABASE
pg_dump --format=custom --file="$destination/database.dump"
tar -C "$UPLOAD_DIR" -czf "$destination/uploads.tar.gz" .
(cd "$destination" && sha256sum database.dump uploads.tar.gz > SHA256SUMS)
printf '%s\n' "Backup complete: $destination"
