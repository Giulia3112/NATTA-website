function trimEnv(name: string): string {
  const v = process.env[name];
  return typeof v === "string" ? v.trim() : "";
}

export const ENV = {
  adminEmail: process.env.ADMIN_EMAIL ?? "alvaresgiulia@gmail.com",
  databaseUrl: process.env.DATABASE_URL ?? "",
  firebaseProjectId: process.env.FIREBASE_PROJECT_ID ?? "",
  firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
  firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: trimEnv("BUILT_IN_FORGE_API_URL"),
  forgeApiKey: trimEnv("BUILT_IN_FORGE_API_KEY"),
  // Scraper LLMs — priority: Groq > Gemini > MiniMax > Forge (set GROQ_API_KEY on Render, not only .env)
  groqApiKey: trimEnv("GROQ_API_KEY"),
  geminiApiKey: trimEnv("GEMINI_API_KEY"),
  minimaxApiKey: trimEnv("MINIMAX_API_KEY"),
  // Firecrawl — for JS-rendered pages (free: 500 pages/month)
  firecrawlApiKey: trimEnv("FIRECRAWL_API_KEY"),
  // Cron schedule for auto-scraping. Default: every 6 hours.
  scraperCron: process.env.SCRAPER_CRON ?? "0 */6 * * *",
  // Tavily web search for AI — free 1000 searches/month: https://tavily.com
  tavilyApiKey: trimEnv("TAVILY_API_KEY"),
  // Transactional email (Resend): https://resend.com/docs/send-with-node
  resendApiKey: trimEnv("RESEND_API_KEY"),
  /** e.g. NATTA <notifications@yourdomain.com> — domain must be verified in Resend */
  emailFrom: trimEnv("EMAIL_FROM"),
  /** Public site URL for links in emails (no trailing slash) */
  appPublicUrl: trimEnv("APP_PUBLIC_URL") || "https://natta.pro",
};
