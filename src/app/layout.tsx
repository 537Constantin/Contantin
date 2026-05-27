import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Navbar } from "@/components/site/navbar";
import { Footer } from "@/components/site/footer";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} – Luxuriöse, vegane Premium-Skincare`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "Premium Skincare",
    "vegane Hautpflege",
    "Luxus Beauty",
    "Serum",
    "Gesichtspflege",
    "cruelty-free Kosmetik",
    "MAISON ELORIA",
  ],
  authors: [{ name: siteConfig.founder }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} – Zeitlose Schönheit. Natürlich definiert.`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} – Premium Skincare`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "shopping",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#100d0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Brand",
  name: siteConfig.name,
  description: siteConfig.description,
  url: siteConfig.url,
  slogan: siteConfig.tagline,
  sameAs: Object.values(siteConfig.social),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#shop"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-ink focus:px-5 focus:py-2.5 focus:text-sm focus:text-canvas"
          >
            Zum Inhalt springen
          </a>
          <Navbar />
          <main id="content">{children}</main>
          <Footer />
        </ThemeProvider>
        <Script
          id="ld-brand"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </body>
    </html>
  );
}
