import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ requestLocale }) => {
  // Ensure it's a plain string, not a Promise
  const locale = (await requestLocale) ?? "de";

  try {
    const messages = (await import(`../messages/${locale}.json`)).default;
    return { locale, messages };
  } catch (error) {
    // Fallback if locale file doesn’t exist
    const fallbackLocale = "de";
    const messages = (await import(`../messages/${fallbackLocale}.json`))
      .default;
    return { locale: fallbackLocale, messages };
  }
});
