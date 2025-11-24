export const i18n = {
  locales: ["de"],
  defaultLocale: "de",
} as const;

export type Locale = (typeof i18n)["locales"][number];
