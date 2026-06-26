export const siteConfig = {
  name: "AI Workforce OS",
  shortName: "Workforce OS",
  tagline: "Dein Unternehmen. Eine KI-Belegschaft.",
  description:
    "AI Workforce OS ist das Betriebssystem für KI-Mitarbeiter. Erstelle autonome KI-Agenten, die Postfach, Termine, Support, Vertrieb, Buchhaltung und Beratung übernehmen — wie ein echtes digitales Team.",
  url: "https://workforce-os.app",
  locale: "de_DE",
  founder: "AI Workforce OS",
  social: {
    x: "https://x.com/workforceos",
    linkedin: "https://www.linkedin.com/company/workforceos",
    github: "https://github.com/537constantin/contantin",
  },
} as const;

export type SiteConfig = typeof siteConfig;
