const API_URL = "http://localhost:3000";

export function getMediaUrl(
  path: string | null,
): string | null {
  if (!path) {
    return null;
  }

  if (
    path.startsWith("http://") ||
    path.startsWith("https://")
  ) {
    return path;
  }

  return `${API_URL}${path}`;
}