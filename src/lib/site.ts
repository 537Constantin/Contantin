export const siteConfig = {
  name: "SmartStaff",
  shortName: "SmartStaff",
  tagline: "Dein Unternehmen. Eine KI-Belegschaft.",
  description:
    "SmartStaff ist das Betriebssystem für KI-Mitarbeiter. Erstelle autonome KI-Agenten, die Telefon, Termine, E-Mails, Support, Dokumente und Beratung übernehmen – wie ein echtes digitales Team.",
  url: "https://workforce-os.app",
  locale: "de_DE",
  founder: "SmartStaff",
  social: {
    x: "https://x.com/workforceos",
    linkedin: "https://www.linkedin.com/company/workforceos",
    github: "https://github.com/537constantin/contantin",
  },
} as const;

export type SiteConfig = typeof siteConfig;
