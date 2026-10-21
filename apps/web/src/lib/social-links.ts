export function isInstagramUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" && ["instagram.com", "www.instagram.com"].includes(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}
