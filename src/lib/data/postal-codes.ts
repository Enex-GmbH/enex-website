// Postal codes data for supported cities
export interface PostalCode {
  code: string;
  city: string;
}

export const postalCodes: PostalCode[] = [
  // Pforzheim
  { code: "75172", city: "Pforzheim" },
  { code: "75173", city: "Pforzheim" },
  { code: "75175", city: "Pforzheim" },
  { code: "75177", city: "Pforzheim" },
  { code: "75179", city: "Pforzheim" },
  { code: "75180", city: "Pforzheim" },
  { code: "75181", city: "Pforzheim" },
  { code: "75217", city: "Pforzheim" },
  { code: "75223", city: "Pforzheim" },
  { code: "75210", city: "Pforzheim" },
  { code: "75196", city: "Pforzheim" },
  
  // Karlsruhe
  { code: "76131", city: "Karlsruhe" },
  { code: "76133", city: "Karlsruhe" },
  { code: "76135", city: "Karlsruhe" },
  { code: "76137", city: "Karlsruhe" },
  { code: "76139", city: "Karlsruhe" },
  { code: "76149", city: "Karlsruhe" },
  { code: "76185", city: "Karlsruhe" },
  { code: "76187", city: "Karlsruhe" },
  { code: "76189", city: "Karlsruhe" },
  { code: "76227", city: "Karlsruhe" },
  { code: "76228", city: "Karlsruhe" },
  { code: "76327", city: "Karlsruhe" },
  { code: "76307", city: "Karlsruhe" },
];

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
