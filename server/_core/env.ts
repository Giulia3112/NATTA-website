export const ENV = {
  adminEmail: process.env.ADMIN_EMAIL ?? "alvaresgiulia@gmail.com",
  databaseUrl: process.env.DATABASE_URL ?? "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  // Scraper LLMs — priority order: Groq > Gemini > MiniMax > Forge
  groqApiKey: process.env.GROQ_API_KEY ?? "",        // free: 30 RPM, 6000 RPD
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",    // free: 15 RPM, 1500 RPD
  minimaxApiKey: process.env.MINIMAX_API_KEY ?? "",  // paid
  // Firecrawl — for JS-rendered pages (free: 500 pages/month)
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY ?? "",
  // Cron schedule for auto-scraping. Default: every 6 hours.
  scraperCron: process.env.SCRAPER_CRON ?? "0 */6 * * *",
};
