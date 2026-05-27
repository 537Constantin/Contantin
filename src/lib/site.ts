export const siteConfig = {
  name: "MAISON ELORIA",
  shortName: "Eloria",
  tagline: "Zeitlose Schönheit. Natürlich definiert.",
  description:
    "MAISON ELORIA – luxuriöse, vegane und dermatologisch getestete Premium-Skincare. Minimalistisch inszeniert, conversion-optimiert und für ein ruhiges, vertrauensvolles Einkaufserlebnis gestaltet.",
  url: "https://maison-eloria.com",
  locale: "de_DE",
  ogImage: "/opengraph-image",
  founder: "Julian Graf von und zu Egloffstein",
  email: "kontakt@maison-eloria.com",
  social: {
    instagram: "https://instagram.com/maison.eloria",
    pinterest: "https://pinterest.com/maison.eloria",
    tiktok: "https://tiktok.com/@maison.eloria",
    linkedin: "https://linkedin.com/company/maison-eloria",
  },
} as const;

export const navLinks = [
  { href: "#shop", label: "Kollektion" },
  { href: "#brand", label: "Marke" },
  { href: "#about", label: "Über uns" },
  { href: "#journal", label: "Stimmen" },
  { href: "#contact", label: "Kontakt" },
] as const;

export type NavLink = (typeof navLinks)[number];
