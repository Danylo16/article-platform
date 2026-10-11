type NominatimResult = {
  display_name?: string;
  lat?: string;
  lon?: string;
};

export async function geocodeAddress(address: string) {
  const baseUrl =
    process.env.NOMINATIM_BASE_URL ?? "https://nominatim.openstreetmap.org";
  const userAgent =
    process.env.NOMINATIM_USER_AGENT ?? "DORIDA-Article-Platform/1.0";
  const contactEmail = process.env.NOMINATIM_CONTACT_EMAIL?.trim();
  const url = new URL("/search", baseUrl);

  url.searchParams.set("q", address);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "1");
  url.searchParams.set("countrycodes", "at");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("accept-language", "de");

  if (contactEmail) {
    url.searchParams.set("email", contactEmail);
  }

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": userAgent,
    },
    signal: AbortSignal.timeout(8_000),
  });

  if (!response.ok) {
    throw new Error("GEOCODING_PROVIDER_ERROR");
  }

  const results = (await response.json()) as NominatimResult[];
  const result = results[0];
  const latitude = Number(result?.lat);
  const longitude = Number(result?.lon);

  if (
    !result?.display_name ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error("GEOCODING_NOT_FOUND");
  }

  return {
    address: result.display_name,
    latitude,
    longitude,
  };
}
