// Postal codes data for supported cities
export interface PostalCode {
  code: string;
  city: string;
}

export const postalCodes: PostalCode[] = [
  { code: "75172", city: "Pforzheim" },
  { code: "75173", city: "Pforzheim" },
  { code: "75175", city: "Pforzheim" },
  { code: "75177", city: "Pforzheim" },
  { code: "75179", city: "Pforzheim" },
  { code: "75180", city: "Pforzheim" },
  { code: "75181", city: "Pforzheim" },
  { code: "75210", city: "Keltern" },
  { code: "75223", city: "Niefern-Öschelbronn" },
  { code: "75228", city: "Ispringen" },
  { code: "75233", city: "Remchingen" },
  { code: "75236", city: "Kämpfelbach" },
  { code: "75239", city: "Pfinztal" },
  { code: "75248", city: "Ötisheim" },
  { code: "75249", city: "Kieselbronn" },
  { code: "75417", city: "Mühlacker" },
  { code: "75443", city: "Östringen" },
];

/** PLZ liegt im Kern-Einzugsgebiet (ohne Anfahrtszuschlag). */
export function isInsideServiceZone(postalCode: string): boolean {
  return postalCodes.some((pc) => pc.code === postalCode);
}

// Helper function to search postal codes
export function searchPostalCodes(query: string): PostalCode[] {
  if (!query || query.trim() === "") {
    return postalCodes;
  }

  const lowerQuery = query.toLowerCase().trim();

  return postalCodes.filter(
    (pc) =>
      pc.code.includes(lowerQuery) ||
      pc.city.toLowerCase().includes(lowerQuery)
  );
}

// Helper function to get postal code by code
export function getPostalCodeByCode(code: string): PostalCode | undefined {
  return postalCodes.find((pc) => pc.code === code);
}

// Helper function to get all unique cities
export function getCities(): string[] {
  return Array.from(new Set(postalCodes.map((pc) => pc.city)));
}
