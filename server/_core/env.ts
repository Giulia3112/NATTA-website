export const ENV = {
  adminEmail: process.env.ADMIN_EMAIL ?? "alvaresgiulia@gmail.com",
  databaseUrl: process.env.DATABASE_URL ?? "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Scraper LLMs
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? "",
  // Firecrawl — for JS-rendered pages
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? "",
  // How often the auto-scraper runs (cron expression). Default: every 6 hours.
  scraperCron: process.env.SCRAPER_CRON ?? "0 */6 * * *",
};
