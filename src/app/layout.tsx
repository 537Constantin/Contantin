import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/site/theme-provider";
import { SplashScreen } from "@/components/app/splash-screen";
import { CookieConsent } from "@/components/site/cookie-consent";
import { clerkEnabled } from "@/lib/auth";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} – ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "AI Workforce",
    "KI-Mitarbeiter",
    "AI Agents",
    "Multi-Agent System",
    "AI SaaS",
    "Workflow Automation",
    "KI Sekretär",
    "Voice AI",
  ],
  authors: [{ name: siteConfig.founder }],
  creator: siteConfig.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} – ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "technology",
  // Home-screen install feel: fullscreen standalone, clean status bar, plus
  // iOS launch (splash) images for the most common iPhone/iPad sizes.
  appleWebApp: {
    capable: true,
    title: siteConfig.shortName,
    statusBarStyle: "black",
    startupImage: [
      { url: "/apple-splash-2048x2732.png", media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/apple-splash-1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/apple-splash-1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/apple-splash-1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
    ],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  // Dark status-bar tint everywhere so the launch/splash has no light strip.
  themeColor: "#0a0e1a",
  width: "device-width",
  initialScale: 1,
  // Let content extend under the notch / home indicator; we pad via safe-area.
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const tree = (
    <html
      lang="de"
      suppressHydrationWarning
      className={`${inter.variable} ${display.variable} ${mono.variable}`}
    >
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SplashScreen />
          {children}
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );

  // Real accounts when Clerk is configured; otherwise demo mode (no provider).
  if (!clerkEnabled) return tree;

  return (
    <ClerkProvider
      appearance={{
        variables: { colorPrimary: "#09090b", borderRadius: "0.75rem" },
      }}
    >
      {tree}
    </ClerkProvider>
  );
}
