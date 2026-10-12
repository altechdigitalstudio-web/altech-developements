export type GeoPoint = {
  countryCode: string;
  countryName: string;
  city: string;
  lat: number;
  lng: number;
  code: string;
};

export const COUNTRY_META: Record<
  string,
  { name: string; lat: number; lng: number; defaultCity: string; cities: string[] }
> = {
  US: {
    name: "United States",
    lat: 37.0902,
    lng: -95.7129,
    defaultCity: "New York",
    cities: ["New York", "San Francisco", "Austin", "Chicago", "Seattle", "Los Angeles", "Miami"],
  },
  GB: {
    name: "United Kingdom",
    lat: 55.3781,
    lng: -3.436,
    defaultCity: "London",
    cities: ["London", "Manchester", "Edinburgh", "Bristol", "Cambridge"],
  },
  DE: {
    name: "Germany",
    lat: 51.1657,
    lng: 10.4515,
    defaultCity: "Berlin",
    cities: ["Berlin", "Munich", "Hamburg", "Frankfurt", "Cologne"],
  },
  FR: {
    name: "France",
    lat: 46.2276,
    lng: 2.2137,
    defaultCity: "Paris",
    cities: ["Paris", "Lyon", "Marseille", "Bordeaux", "Toulouse"],
  },
  ES: {
    name: "Spain",
    lat: 40.4637,
    lng: -3.7492,
    defaultCity: "Madrid",
    cities: ["Madrid", "Barcelona", "Valencia", "Seville"],
  },
  IT: {
    name: "Italy",
    lat: 41.8719,
    lng: 12.5674,
    defaultCity: "Rome",
    cities: ["Rome", "Milan", "Florence", "Turin", "Naples"],
  },
  NL: {
    name: "Netherlands",
    lat: 52.1326,
    lng: 5.2913,
    defaultCity: "Amsterdam",
    cities: ["Amsterdam", "Rotterdam", "Utrecht", "The Hague"],
  },
  IN: {
    name: "India",
    lat: 20.5937,
    lng: 78.9629,
    defaultCity: "Bengaluru",
    cities: ["Bengaluru", "Mumbai", "Delhi", "Hyderabad", "Pune"],
  },
  JP: {
    name: "Japan",
    lat: 36.2048,
    lng: 138.2529,
    defaultCity: "Tokyo",
    cities: ["Tokyo", "Osaka", "Kyoto", "Yokohama", "Fukuoka"],
  },
  BR: {
    name: "Brazil",
    lat: -14.235,
    lng: -51.9253,
    defaultCity: "São Paulo",
    cities: ["São Paulo", "Rio de Janeiro", "Brasília", "Curitiba"],
  },
  CA: {
    name: "Canada",
    lat: 56.1304,
    lng: -106.3468,
    defaultCity: "Toronto",
    cities: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
  },
  AU: {
    name: "Australia",
    lat: -25.2744,
    lng: 133.7751,
    defaultCity: "Sydney",
    cities: ["Sydney", "Melbourne", "Brisbane", "Perth"],
  },
  SG: {
    name: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    defaultCity: "Singapore",
    cities: ["Singapore"],
  },
  AE: {
    name: "United Arab Emirates",
    lat: 23.4241,
    lng: 53.8478,
    defaultCity: "Dubai",
    cities: ["Dubai", "Abu Dhabi", "Sharjah"],
  },
  SE: {
    name: "Sweden",
    lat: 60.1282,
    lng: 18.6435,
    defaultCity: "Stockholm",
    cities: ["Stockholm", "Gothenburg", "Malmö"],
  },
  CH: {
    name: "Switzerland",
    lat: 46.8182,
    lng: 8.2275,
    defaultCity: "Zurich",
    cities: ["Zurich", "Geneva", "Basel"],
  },
};

export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  "New York": { lat: 40.7128, lng: -74.006 },
  "San Francisco": { lat: 37.7749, lng: -122.4194 },
  Austin: { lat: 30.2672, lng: -97.7431 },
  Chicago: { lat: 41.8781, lng: -87.6298 },
  Seattle: { lat: 47.6062, lng: -122.3321 },
  "Los Angeles": { lat: 34.0522, lng: -118.2437 },
  Miami: { lat: 25.7617, lng: -80.1918 },
  London: { lat: 51.5074, lng: -0.1278 },
  Manchester: { lat: 53.4808, lng: -2.2426 },
  Edinburgh: { lat: 55.9533, lng: -3.1883 },
  Berlin: { lat: 52.52, lng: 13.405 },
  Munich: { lat: 48.1351, lng: 11.582 },
  Hamburg: { lat: 53.5511, lng: 9.9937 },
  Frankfurt: { lat: 50.1109, lng: 8.6821 },
  Paris: { lat: 48.8566, lng: 2.3522 },
  Lyon: { lat: 45.764, lng: 4.8357 },
  Madrid: { lat: 40.4168, lng: -3.7038 },
  Barcelona: { lat: 41.3851, lng: 2.1734 },
  Rome: { lat: 41.9028, lng: 12.4964 },
  Milan: { lat: 45.4642, lng: 9.19 },
  Amsterdam: { lat: 52.3676, lng: 4.9041 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Mumbai: { lat: 19.076, lng: 72.8777 },
  Delhi: { lat: 28.7041, lng: 77.1025 },
  Tokyo: { lat: 35.6762, lng: 139.6503 },
  Osaka: { lat: 34.6937, lng: 135.5023 },
  "São Paulo": { lat: -23.5505, lng: -46.6333 },
  "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
  Toronto: { lat: 43.6532, lng: -79.3832 },
  Vancouver: { lat: 49.2827, lng: -123.1207 },
  Sydney: { lat: -33.8688, lng: 151.2093 },
  Melbourne: { lat: -37.8136, lng: 144.9631 },
  Singapore: { lat: 1.3521, lng: 103.8198 },
  Dubai: { lat: 25.2048, lng: 55.2708 },
  Stockholm: { lat: 59.3293, lng: 18.0686 },
  Zurich: { lat: 47.3769, lng: 8.5417 },
};

export function getCountryCodeBadge(code: string): string {
  return (code || "GLOBAL").toUpperCase().slice(0, 3);
}

export function getCountryCoordinates(code: string): { lat: number; lng: number } {
  const match = COUNTRY_META[code?.toUpperCase()];
  if (match) return { lat: match.lat, lng: match.lng };
  return { lat: 20, lng: 0 };
}

export function getCityCoordinates(city: string, countryCode: string): { lat: number; lng: number } {
  if (CITY_COORDS[city]) return CITY_COORDS[city];
  return getCountryCoordinates(countryCode);
}

/**
 * Projects (lat, lng) to (x, y) coordinates on a standard Equirectangular SVG world map
 * width: w, height: h.
 */
export function geoToSvg(lat: number, lng: number, width = 800, height = 400): { x: number; y: number } {
  const x = ((lng + 180) / 360) * width;
  const clampedLat = Math.max(-85, Math.min(85, lat));
  const y = ((90 - clampedLat) / 180) * height;
  return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
}
