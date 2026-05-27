#!/usr/bin/env bash
# MAISON ELORIA — vollständiges Setup. Ausführen in leerem Ordner: bash setup.sh
set -euo pipefail

mkdir -p "$(dirname ".eslintrc.json")"
cat > ".eslintrc.json" <<'EOF_MAISON_ELORIA_9f3a2b'
{
  "extends": "next/core-web-vitals"
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname ".gitignore")"
cat > ".gitignore" <<'EOF_MAISON_ELORIA_9f3a2b'
# dependencies
/node_modules
/.pnp
.pnp.*

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# env files
.env
.env*.local

# typescript
*.tsbuildinfo
next-env.d.ts

# editor
.vscode/*
!.vscode/extensions.json
.idea
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "next-env.d.ts")"
cat > "next-env.d.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
/// <reference types="next" />
/// <reference types="next/image-types/global" />
/// <reference path="./.next/types/routes.d.ts" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "next.config.ts")"
cat > "next.config.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async headers() {
    const securityHeaders = [
      { key: "X-DNS-Prefetch-Control", value: "on" },
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
      {
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
      },
    ];

    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

export default nextConfig;
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "package.json")"
cat > "package.json" <<'EOF_MAISON_ELORIA_9f3a2b'
{
  "name": "maison-eloria",
  "version": "1.0.0",
  "private": true,
  "description": "MAISON ELORIA – premium, conversion-optimised skincare experience built with Next.js.",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "lucide-react": "^0.469.0",
    "motion": "^11.15.0",
    "next": "^15.1.6",
    "next-themes": "^0.4.4",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "tailwind-merge": "^2.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4.0.0",
    "@types/node": "^22.10.5",
    "@types/react": "^19.0.7",
    "@types/react-dom": "^19.0.3",
    "eslint": "^9.18.0",
    "eslint-config-next": "^15.1.6",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.3"
  }
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "postcss.config.mjs")"
cat > "postcss.config.mjs" <<'EOF_MAISON_ELORIA_9f3a2b'
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "public/icon.svg")"
cat > "public/icon.svg" <<'EOF_MAISON_ELORIA_9f3a2b'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#1c1714"/>
  <text x="32" y="44" font-family="Georgia, 'Playfair Display', serif" font-size="38" font-weight="600" fill="#cca96e" text-anchor="middle">E</text>
</svg>
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/globals.css")"
cat > "src/app/globals.css" <<'EOF_MAISON_ELORIA_9f3a2b'
@import "tailwindcss";

/* Dark mode driven by next-themes `class` strategy */
@custom-variant dark (&:where(.dark, .dark *));

/* ============================================================
   DESIGN TOKENS
   Warm, editorial luxury palette — ivory / espresso / gold.
   ============================================================ */
@theme {
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-playfair), Georgia, "Times New Roman", serif;

  --color-canvas: #fbf8f3;
  --color-surface: #ffffff;
  --color-surface-soft: #f6efe4;
  --color-ink: #1c1714;
  --color-ink-soft: #4a423b;
  --color-muted: #8a7f73;
  --color-border: #ece3d6;
  --color-gold: #b28c56;
  --color-gold-soft: #d8c39c;

  --radius-card: 1.5rem;

  --shadow-soft: 0 1px 2px rgba(28, 23, 20, 0.04),
    0 12px 40px -16px rgba(28, 23, 20, 0.18);
  --shadow-float: 0 24px 70px -28px rgba(28, 23, 20, 0.4);

  --ease-lux: cubic-bezier(0.22, 1, 0.36, 1);

  --animate-marquee: marquee 40s linear infinite;
  --animate-shimmer: shimmer 2.4s linear infinite;

  @keyframes marquee {
    from {
      transform: translateX(0);
    }
    to {
      transform: translateX(-50%);
    }
  }

  @keyframes shimmer {
    from {
      background-position: -200% 0;
    }
    to {
      background-position: 200% 0;
    }
  }
}

/* Dark theme overrides — deep warm charcoal */
.dark {
  --color-canvas: #100d0b;
  --color-surface: #1a1512;
  --color-surface-soft: #221b16;
  --color-ink: #f5efe6;
  --color-ink-soft: #cbbfb1;
  --color-muted: #9a8d7e;
  --color-border: #2c2520;
  --color-gold: #cca96e;
  --color-gold-soft: #6f5a39;

  --shadow-soft: 0 1px 2px rgba(0, 0, 0, 0.3),
    0 18px 50px -20px rgba(0, 0, 0, 0.7);
  --shadow-float: 0 28px 80px -30px rgba(0, 0, 0, 0.8);
}

/* ============================================================
   BASE
   ============================================================ */
@layer base {
  * {
    border-color: var(--color-border);
  }

  html {
    scroll-behavior: smooth;
    scroll-padding-top: 6rem;
    -webkit-text-size-adjust: 100%;
  }

  body {
    background-color: var(--color-canvas);
    color: var(--color-ink);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    font-feature-settings: "ss01", "cv01", "cv02";
  }

  ::selection {
    background-color: color-mix(in srgb, var(--color-gold) 30%, transparent);
    color: var(--color-ink);
  }

  :focus-visible {
    outline: 2px solid var(--color-gold);
    outline-offset: 3px;
    border-radius: 4px;
  }

  /* Respect reduced motion globally */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.001ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.001ms !important;
      scroll-behavior: auto !important;
    }
  }
}

/* ============================================================
   UTILITIES
   ============================================================ */
@utility font-serif {
  font-family: var(--font-serif);
}

@utility text-balance {
  text-wrap: balance;
}

@utility text-gradient-gold {
  background: linear-gradient(
    100deg,
    var(--color-gold) 0%,
    color-mix(in srgb, var(--color-gold) 55%, var(--color-ink)) 60%
  );
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

@utility glass {
  background-color: color-mix(in srgb, var(--color-surface) 70%, transparent);
  backdrop-filter: blur(20px) saturate(160%);
  -webkit-backdrop-filter: blur(20px) saturate(160%);
}

/* Subtle film-grain / vignette overlay helper */
@utility noise {
  background-image: radial-gradient(
      circle at 1px 1px,
      color-mix(in srgb, var(--color-ink) 8%, transparent) 1px,
      transparent 0
    );
  background-size: 4px 4px;
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/icon.svg")"
cat > "src/app/icon.svg" <<'EOF_MAISON_ELORIA_9f3a2b'
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="#1c1714"/>
  <text x="32" y="44" font-family="Georgia, 'Playfair Display', serif" font-size="38" font-weight="600" fill="#cca96e" text-anchor="middle">E</text>
</svg>
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/layout.tsx")"
cat > "src/app/layout.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
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
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/manifest.ts")"
cat > "src/app/manifest.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.shortName,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#fbf8f3",
    theme_color: "#fbf8f3",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/not-found.tsx")"
cat > "src/app/not-found.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/ui/section";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center py-32 text-center">
      <span className="font-serif text-7xl font-semibold text-gradient-gold">404</span>
      <h1 className="mt-4 font-serif text-3xl font-semibold tracking-tight">
        Diese Seite existiert nicht.
      </h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Die angeforderte Seite konnte nicht gefunden werden. Kehren Sie zurück zur
        Markenwelt von MAISON ELORIA.
      </p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          Zur Startseite
        </Link>
      </Button>
    </Container>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/opengraph-image.tsx")"
cat > "src/app/opengraph-image.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const runtime = "edge";
export const alt = `${siteConfig.name} – Zeitlose Schönheit. Natürlich definiert.`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(120% 120% at 50% 0%, #f6efe4 0%, #fbf8f3 55%, #f1e7d6 100%)",
          padding: 80,
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
            color: "#b28c56",
          }}
        >
          {siteConfig.name}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            color: "#1c1714",
          }}
        >
          <div style={{ fontSize: 76, lineHeight: 1.05, fontWeight: 600 }}>
            Zeitlose Schönheit.
          </div>
          <div style={{ fontSize: 76, lineHeight: 1.05, color: "#b28c56" }}>
            Natürlich definiert.
          </div>
        </div>
        <div style={{ fontSize: 26, color: "#8a7f73" }}>
          Premium Skincare · Vegan · Cruelty-free
        </div>
      </div>
    ),
    { ...size },
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/page.tsx")"
cat > "src/app/page.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import { Hero } from "@/components/sections/hero";
import { Marquee } from "@/components/sections/marquee";
import { Shop } from "@/components/sections/shop";
import { Brand } from "@/components/sections/brand";
import { Testimonials } from "@/components/sections/testimonials";
import { About } from "@/components/sections/about";
import { Contact } from "@/components/sections/contact";
import { CTA } from "@/components/sections/cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Shop />
      <Brand />
      <Testimonials />
      <About />
      <Contact />
      <CTA />
    </>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/rechtliches/page.tsx")"
cat > "src/app/rechtliches/page.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container, Eyebrow } from "@/components/ui/section";
import { legalSections } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Rechtliches – Impressum, Datenschutz, AGB & Widerruf",
  description:
    "Impressum, Datenschutzerklärung, AGB und Widerrufsbelehrung von MAISON ELORIA.",
  robots: { index: false, follow: true },
};

export default function LegalPage() {
  return (
    <Container className="pt-32 pb-24 sm:pt-40">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-gold"
      >
        <ArrowLeft className="h-4 w-4" />
        Zurück zur Startseite
      </Link>

      <div className="mt-8">
        <Eyebrow>Rechtliches</Eyebrow>
        <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
          Impressum, Datenschutz, AGB &amp; Widerruf
        </h1>
        <p className="mt-4 max-w-2xl leading-relaxed text-ink-soft">
          Die folgenden Inhalte sind klar gegliedert und für die direkte Umsetzung
          vorbereitet. Platzhalter sind eindeutig markiert und müssen vor
          Veröffentlichung individuell ergänzt und rechtlich geprüft werden.
        </p>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[200px_1fr]">
        <nav className="lg:sticky lg:top-28 lg:self-start" aria-label="Rechtliche Abschnitte">
          <ul className="flex flex-wrap gap-2 lg:flex-col">
            {legalSections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  className="inline-block rounded-full border border-border px-4 py-2 text-sm text-ink-soft transition-colors hover:border-gold/50 hover:text-gold lg:border-0 lg:px-0 lg:py-1 lg:hover:border-0"
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-14">
          {legalSections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="font-serif text-2xl font-semibold tracking-tight">
                {s.title}
              </h2>
              <div className="mt-5 whitespace-pre-line rounded-[var(--radius-card)] border border-border bg-surface p-6 text-sm leading-relaxed text-ink-soft sm:p-8">
                {s.body}
              </div>
            </section>
          ))}
        </div>
      </div>
    </Container>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/robots.ts")"
cat > "src/app/robots.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/app/sitemap.ts")"
cat > "src/app/sitemap.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: siteConfig.url,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/rechtliches`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/motion/reveal.tsx")"
cat > "src/components/motion/reveal.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
"use client";

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** translate distance in px before settling */
  y?: number;
  as?: "div" | "li" | "article" | "span";
}

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  as = "div",
}: RevealProps) {
  const reduce = useReducedMotion();
  const MotionTag = motion[as];

  return (
    <MotionTag
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionTag>
  );
}

const staggerParent: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const staggerChild: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
};

export function Stagger({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? undefined : staggerParent}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? undefined : staggerChild}>
      {children}
    </motion.div>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/about.tsx")"
cat > "src/components/sections/about.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import Image from "next/image";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const values = [
  {
    title: "Qualität",
    body: "Sorgfältig kuratierte Rezepturen, klare Produktarchitektur und hochwertiger Markenauftritt.",
  },
  {
    title: "Nachhaltigkeit",
    body: "Bewusste Entscheidungen bei Materialien, Verpackung und langfristiger Markenführung.",
  },
  {
    title: "Vertrauen",
    body: "Transparente Kommunikation, ruhiger Ton und ein kundenorientiertes, glaubwürdiges Erlebnis.",
  },
];

export function About() {
  return (
    <Section id="about">
      <Container>
        <div className="grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <div className="relative aspect-[5/6] overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-float)]">
              <Image
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=1200&q=80"
                alt="MAISON ELORIA – Markenwelt"
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
          </Reveal>

          <div>
            <Reveal>
              <Eyebrow>Über uns</Eyebrow>
              <h2 className="mt-5 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
                Eine Markenstory mit Ruhe, Wirkung und Haltung.
              </h2>
              <p className="mt-6 leading-relaxed text-ink-soft">
                MAISON ELORIA entstand aus dem Wunsch, Beauty neu zu
                interpretieren: weniger Lautstärke, mehr Substanz. Im Mittelpunkt
                stehen klar konzipierte Pflegerituale, zurückhaltender Luxus und
                eine Haltung, die Qualität, Nachhaltigkeit und Sinnlichkeit
                verbindet.
              </p>
            </Reveal>

            <Stagger className="mt-8 space-y-4">
              {values.map((v) => (
                <StaggerItem
                  key={v.title}
                  className="rounded-2xl border border-border bg-surface p-5"
                >
                  <h3 className="font-serif text-lg font-semibold">{v.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{v.body}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </div>
      </Container>
    </Section>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/brand.tsx")"
cat > "src/components/sections/brand.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import { Leaf, Recycle, ShieldCheck, Sparkles } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const pillars = [
  {
    icon: Leaf,
    title: "Vegan formuliert",
    body: "Ausgewählte Rezepturen ohne tierische Inhaltsstoffe für ein zeitgemäßes Premiumverständnis.",
  },
  {
    icon: ShieldCheck,
    title: "Dermatologisch getestet",
    body: "Sanfte Pflege mit Fokus auf Hautverträglichkeit, Vertrauen und hochwertige Formulierung.",
  },
  {
    icon: Sparkles,
    title: "Cruelty-free",
    body: "Verantwortungsvoll entwickelte Produkte mit glaubwürdiger, ruhiger Markenhaltung.",
  },
  {
    icon: Recycle,
    title: "Nachhaltig gedacht",
    body: "Bewusste Entscheidungen bei Materialien, Verpackung und langfristiger Markenführung.",
  },
];

export function Brand() {
  return (
    <Section id="brand">
      <Container>
        <div className="grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <Eyebrow>Marke</Eyebrow>
            <h2 className="mt-5 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              High-End-Pflege, die Ritual und Wirkung in Einklang bringt.
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-ink-soft">
              MAISON ELORIA verbindet anspruchsvolles Design, ausgewählte
              Inhaltsstoffe und ein reduziertes Erscheinungsbild zu einer souveränen,
              vertrauensvollen und hochwertigen Markenidentität.
            </p>
            <div className="mt-8 flex flex-wrap gap-2.5">
              {["Ruhige Premium-Ästhetik", "SEO-orientiert", "Mobil optimiert"].map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border bg-surface px-4 py-1.5 text-sm text-ink-soft"
                  >
                    {tag}
                  </span>
                ),
              )}
            </div>
          </Reveal>

          <Stagger className="grid gap-4 sm:grid-cols-2">
            {pillars.map((p) => (
              <StaggerItem
                key={p.title}
                className="rounded-[var(--radius-card)] border border-border bg-surface p-6 shadow-[var(--shadow-soft)] transition-transform duration-500 [transition-timing-function:var(--ease-lux)] hover:-translate-y-1"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gold/12 text-gold">
                  <p.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-serif text-lg font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.body}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </Section>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/contact.tsx")"
cat > "src/components/sections/contact.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site";

const inputClass =
  "h-12 w-full rounded-xl border border-border bg-surface px-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-gold";

export function Contact() {
  return (
    <Section id="contact" className="bg-surface-soft/40">
      <Container>
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="flex flex-col justify-between gap-10 rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-soft)]">
            <div>
              <Eyebrow>Kontakt</Eyebrow>
              <h2 className="mt-5 font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
                Wir freuen uns auf Ihre Nachricht.
              </h2>
              <p className="mt-4 leading-relaxed text-ink-soft">
                Fragen zu Produkten, Bestellungen oder Kooperationen? Unser Team
                antwortet ruhig, kompetent und persönlich.
              </p>
            </div>

            <NewsletterForm />

            <a
              href={`mailto:${siteConfig.email}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-ink transition-colors hover:text-gold"
            >
              <Mail className="h-4 w-4" />
              {siteConfig.email}
            </a>
          </div>

          <ContactForm />
        </div>
      </Container>
    </Section>
  );
}

function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [done, setDone] = React.useState(false);

  return (
    <div className="rounded-2xl bg-surface-soft p-5">
      <h3 className="font-serif text-lg font-semibold">Exklusive Rituale &amp; Neuheiten</h3>
      <p className="mt-1 text-sm text-muted">
        Ausgewählte Launches, stilvoll und reduziert.
      </p>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (email.includes("@")) setDone(true);
        }}
      >
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ihre E-Mail-Adresse"
          aria-label="E-Mail-Adresse für Newsletter"
          className={inputClass}
        />
        <Button type="submit" aria-label="Newsletter abonnieren">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
      <AnimatePresence>
        {done && (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-gold"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Bitte bestätigen Sie die E-Mail in Ihrem Postfach (Double-Opt-in).
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContactForm() {
  const [sent, setSent] = React.useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
      className="rounded-[var(--radius-card)] border border-border bg-surface p-8 shadow-[var(--shadow-soft)]"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <input required placeholder="Vorname" aria-label="Vorname" className={inputClass} />
        <input required placeholder="Nachname" aria-label="Nachname" className={inputClass} />
        <input
          required
          type="email"
          placeholder="E-Mail-Adresse"
          aria-label="E-Mail-Adresse"
          className={inputClass}
        />
        <input placeholder="Telefon (optional)" aria-label="Telefon" className={inputClass} />
      </div>
      <input
        required
        placeholder="Betreff"
        aria-label="Betreff"
        className={`${inputClass} mt-4`}
      />
      <textarea
        required
        rows={5}
        placeholder="Ihre Nachricht"
        aria-label="Ihre Nachricht"
        className="mt-4 w-full rounded-xl border border-border bg-surface p-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-gold"
      />
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Mit dem Absenden willigen Sie in die Verarbeitung Ihrer Daten zur
        Bearbeitung Ihrer Anfrage ein. Weitere Informationen in der
        Datenschutzerklärung.
      </p>

      <div className="mt-5 flex items-center gap-4">
        <Button type="submit" size="lg" disabled={sent}>
          {sent ? "Nachricht gesendet" : "Nachricht senden"}
        </Button>
        <AnimatePresence>
          {sent && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1.5 text-sm text-gold"
            >
              <CheckCircle2 className="h-4 w-4" />
              Vielen Dank!
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/cta.tsx")"
cat > "src/components/sections/cta.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container, Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export function CTA() {
  return (
    <Section>
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-border bg-ink px-8 py-16 text-center text-canvas sm:px-16 sm:py-24">
            <div aria-hidden className="pointer-events-none absolute inset-0">
              <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-gold/30 blur-[100px]" />
              <div className="noise absolute inset-0 opacity-30" />
            </div>
            <h2 className="relative mx-auto max-w-2xl text-balance font-serif text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Beginnen Sie Ihr Ritual zeitloser Schönheit.
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-lg text-canvas/70">
              Kostenfreier Versand ab 60 € · 30 Tage Rückgaberecht · Premium Support
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-3">
              <Button asChild variant="gold" size="lg">
                <Link href="#shop">
                  Kollektion entdecken
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="border border-canvas/20 bg-transparent text-canvas hover:bg-canvas/10"
              >
                <Link href="#contact">Kontakt aufnehmen</Link>
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/hero.tsx")"
cat > "src/components/sections/hero.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/section";

const stats = [
  { value: "+12.000", label: "Zufriedene Kundinnen" },
  { value: "4,9/5", label: "Durchschnittsbewertung" },
  { value: "48h", label: "Schneller Versand" },
];

const ease = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 26 },
    show: { opacity: 1, y: 0, transition: { duration: 0.85, ease } },
  };

  return (
    <section id="home" className="relative overflow-hidden pt-32 sm:pt-40 lg:pt-44">
      {/* ambient gradient + grain */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-12%] h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-gold/12 blur-[120px]" />
        <div className="absolute right-[-10%] top-[30%] h-80 w-80 rounded-full bg-gold-soft/20 blur-[100px]" />
        <div className="noise absolute inset-0 opacity-50" />
      </div>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            variants={reduce ? undefined : container}
            initial={reduce ? false : "hidden"}
            animate="show"
          >
            <motion.div variants={item}>
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-4 py-1.5 text-xs font-medium tracking-wide text-ink-soft backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Premium Skincare · Vegan · Cruelty-free
              </span>
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 text-balance font-serif text-5xl font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
            >
              Zeitlose Schönheit.{" "}
              <span className="text-gradient-gold">Natürlich definiert.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-7 max-w-xl text-lg leading-relaxed text-ink-soft"
            >
              Eine moderne, elegante und conversion-optimierte Beauty-Welt –
              minimalistisch inszeniert, luxuriös im Ausdruck und gestaltet für
              Vertrauen, Premium-Positionierung und eine exzellente Erfahrung auf
              allen Geräten.
            </motion.p>

            <motion.div variants={item} className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="#shop">
                  Jetzt entdecken
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="#brand">Markenwelt ansehen</Link>
              </Button>
            </motion.div>

            <motion.dl
              variants={item}
              className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-border pt-8"
            >
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-xs leading-snug text-muted">{s.label}</dd>
                </div>
              ))}
            </motion.dl>
          </motion.div>

          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1.1, ease, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border shadow-[var(--shadow-float)]">
              <Image
                src="https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80"
                alt="MAISON ELORIA – luxuriöses Pflegeritual"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/30 via-transparent to-transparent" />
            </div>

            <motion.div
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease, delay: 0.7 }}
              className="glass absolute -bottom-6 -left-4 max-w-[15rem] rounded-2xl border border-border p-5 shadow-[var(--shadow-float)] sm:-left-8"
            >
              <div className="flex items-center gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <h3 className="mt-2 font-serif text-lg font-semibold">Luxury Ritual</h3>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Formulierungen mit klarer Philosophie und einem Gefühl stiller
                Exklusivität.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/marquee.tsx")"
cat > "src/components/sections/marquee.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
const items = [
  "Vegan formuliert",
  "Cruelty-free",
  "Dermatologisch getestet",
  "Made in Germany",
  "Ohne Mikroplastik",
  "Recycelbare Verpackung",
  "Premium Positionierung",
  "DSGVO-konform",
];

export function Marquee() {
  return (
    <section
      aria-label="Markenversprechen"
      className="border-y border-border bg-surface-soft/50 py-6"
    >
      <div className="relative flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex shrink-0 animate-[var(--animate-marquee)] items-center gap-12 pr-12">
          {[...items, ...items].map((item, i) => (
            <span
              key={i}
              className="flex items-center gap-12 whitespace-nowrap font-serif text-lg tracking-tight text-ink-soft"
            >
              {item}
              <span className="h-1.5 w-1.5 rounded-full bg-gold/60" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/shop.tsx")"
cat > "src/components/sections/shop.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
"use client";

import * as React from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Search, Star, X } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { categories, products, type Product } from "@/lib/products";
import { cn, formatPrice } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export function Shop() {
  const [active, setActive] = React.useState<(typeof categories)[number]>("Alle");
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Product | null>(null);
  const reduce = useReducedMotion();

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchesCategory = active === "Alle" || p.category === active;
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.promise.toLowerCase().includes(q) ||
        p.ingredients.some((i) => i.toLowerCase().includes(q));
      return matchesCategory && matchesQuery;
    });
  }, [active, query]);

  return (
    <Section id="shop">
      <Container>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Kollektion</Eyebrow>
            <h2 className="mt-5 text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
              Bestseller &amp; Pflegerituale
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-ink-soft">
              Eine kuratierte Auswahl hochwertiger Beauty-Produkte mit luxuriösen
              Texturen, ausgewählten Inhaltsstoffen und klarer, moderner Ästhetik.
            </p>
          </div>

          <label className="relative block w-full max-w-xs">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Produkte durchsuchen"
              aria-label="Produkte durchsuchen"
              className="h-11 w-full rounded-full border border-border bg-surface pl-11 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-muted focus:border-gold"
            />
          </label>
        </div>

        <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Kategorien">
          {categories.map((cat) => (
            <button
              key={cat}
              role="tab"
              aria-selected={active === cat}
              onClick={() => setActive(cat)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm transition-all duration-300 [transition-timing-function:var(--ease-lux)]",
                active === cat
                  ? "border-ink bg-ink text-canvas"
                  : "border-border bg-surface text-ink-soft hover:border-gold/50 hover:text-ink",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.ul layout className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => (
              <motion.li
                key={product.id}
                layout
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease }}
              >
                <ProductCard product={product} onOpen={() => setSelected(product)} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        {filtered.length === 0 && (
          <p className="mt-12 text-center text-muted">
            Keine Produkte gefunden. Bitte passen Sie Ihre Suche an.
          </p>
        )}
      </Container>

      <ProductDialog product={selected} onClose={() => setSelected(null)} />
    </Section>
  );
}

function ProductCard({
  product,
  onOpen,
}: {
  product: Product;
  onOpen: () => void;
}) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-card)] border border-border bg-surface shadow-[var(--shadow-soft)] transition-shadow duration-500 hover:shadow-[var(--shadow-float)]">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${product.name} ansehen`}
        className="relative aspect-[4/3] w-full overflow-hidden"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 [transition-timing-function:var(--ease-lux)] group-hover:scale-105"
        />
        <div className="absolute left-3 top-3 flex gap-2">
          {product.bestseller && <Badge variant="gold">Bestseller</Badge>}
          <Badge>{product.skinType}</Badge>
        </div>
      </button>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-serif text-xl font-semibold tracking-tight">
              {product.name}
            </h3>
            <p className="mt-1 text-sm text-muted">{product.promise}</p>
          </div>
          <span className="shrink-0 font-serif text-lg font-semibold">
            {formatPrice(product.price)}
          </span>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {product.description}
        </p>

        <div className="mt-auto flex items-center gap-3 pt-6">
          <Button variant="gold" size="sm" className="flex-1">
            In den Warenkorb
          </Button>
          <Button variant="outline" size="sm" onClick={onOpen}>
            Details
          </Button>
        </div>
      </div>
    </article>
  );
}

function ProductDialog({
  product,
  onClose,
}: {
  product: Product | null;
  onClose: () => void;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    if (product) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", onKey);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [product, onClose]);

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <div
            className="absolute inset-0 bg-ink/50 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, ease }}
            className="relative grid max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-t-3xl border border-border bg-surface shadow-[var(--shadow-float)] sm:rounded-3xl md:grid-cols-2"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Schließen"
              className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface/80 text-ink backdrop-blur transition-colors hover:bg-surface-soft"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative hidden aspect-square md:block">
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="40vw"
                className="object-cover"
              />
            </div>

            <div className="overflow-y-auto p-7">
              <div className="flex items-center gap-2">
                {product.bestseller && <Badge variant="gold">Bestseller</Badge>}
                <span className="inline-flex items-center gap-1 text-sm text-gold">
                  <Star className="h-3.5 w-3.5 fill-current" />
                  {product.rating.toFixed(1).replace(".", ",")}
                </span>
              </div>

              <h3 className="mt-3 font-serif text-2xl font-semibold tracking-tight">
                {product.name}
              </h3>
              <p className="mt-2 text-ink-soft">{product.description}</p>
              <p className="mt-4 font-serif text-2xl font-semibold">
                {formatPrice(product.price)}
              </p>

              <dl className="mt-6 space-y-4 border-t border-border pt-6 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Inhaltsstoffe
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-2">
                    {product.ingredients.map((ing) => (
                      <span
                        key={ing}
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface-soft px-3 py-1 text-xs text-ink-soft"
                      >
                        <Check className="h-3 w-3 text-gold" />
                        {ing}
                      </span>
                    ))}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                    Anwendung
                  </dt>
                  <dd className="mt-1.5 leading-relaxed text-ink-soft">{product.usage}</dd>
                </div>
              </dl>

              <Button variant="gold" size="lg" className="mt-7 w-full">
                In den Warenkorb · {formatPrice(product.price)}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/sections/testimonials.tsx")"
cat > "src/components/sections/testimonials.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import { Star } from "lucide-react";
import { Container, Eyebrow, Section } from "@/components/ui/section";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

const testimonials = [
  {
    quote:
      "Die Texturen wirken außergewöhnlich hochwertig. Meine Haut fühlt sich gepflegt, ruhig und sichtbar ebenmäßiger an.",
    name: "Sophie K.",
    role: "Verifizierte Kundin",
  },
  {
    quote:
      "Eine Beauty Brand, die Luxus und Wirksamkeit auf stille, elegante Weise verbindet. Besonders das Serum überzeugt mich täglich.",
    name: "Clara M.",
    role: "Verifizierte Kundin",
  },
  {
    quote:
      "Vom Packaging bis zur Anwendung ist alles durchdacht. Die Marke vermittelt Vertrauen, Qualität und Ruhe.",
    name: "Nina M.",
    role: "Verifizierte Kundin",
  },
];

export function Testimonials() {
  return (
    <Section id="journal" className="bg-surface-soft/40">
      <Container>
        <Reveal>
          <Eyebrow>Stimmen</Eyebrow>
          <h2 className="mt-5 max-w-2xl text-balance font-serif text-4xl font-semibold tracking-tight sm:text-5xl">
            Vertrauen, das sich in jeder Anwendung zeigt.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem
              key={t.name}
              className="flex h-full flex-col rounded-[var(--radius-card)] border border-border bg-surface p-7 shadow-[var(--shadow-soft)]"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-5 flex-1 text-lg leading-relaxed text-ink-soft">
                „{t.quote}“
              </blockquote>
              <figcaption className="mt-6 border-t border-border pt-5">
                <div className="font-semibold text-ink">{t.name}</div>
                <div className="text-sm text-muted">{t.role}</div>
              </figcaption>
            </StaggerItem>
          ))}
        </Stagger>
      </Container>
    </Section>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/site/footer.tsx")"
cat > "src/components/site/footer.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import Link from "next/link";
import { Instagram, Linkedin } from "lucide-react";
import { Container } from "@/components/ui/section";
import { navLinks, siteConfig } from "@/lib/site";

const trust = [
  "Sichere Zahlung",
  "Schneller Versand",
  "Premium Support",
  "DSGVO-orientiert",
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-soft/40">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="font-serif text-2xl font-semibold tracking-tight">
              {siteConfig.name}
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Hochwertige, vegane Beauty-Produkte mit luxuriöser Markenästhetik –
              gestaltet für ein ruhiges, vertrauensvolles Einkaufserlebnis.
            </p>
            <div className="mt-6 flex gap-3">
              <Link
                href={siteConfig.social.instagram}
                aria-label="Instagram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-surface"
              >
                <Instagram className="h-[18px] w-[18px]" />
              </Link>
              <Link
                href={siteConfig.social.linkedin}
                aria-label="LinkedIn"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-surface"
              >
                <Linkedin className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>

          <nav aria-label="Footer Navigation">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Navigation
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link href="#home" className="text-ink-soft transition-colors hover:text-gold">
                  Start
                </Link>
              </li>
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-ink-soft transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/rechtliches" className="text-ink-soft transition-colors hover:text-gold">
                  Rechtliches
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Trust &amp; Service
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {trust.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Alle Rechte vorbehalten.
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href="/rechtliches#impressum" className="transition-colors hover:text-gold">
              Impressum
            </Link>
            <Link href="/rechtliches#datenschutz" className="transition-colors hover:text-gold">
              Datenschutz
            </Link>
            <Link href="/rechtliches#agb" className="transition-colors hover:text-gold">
              AGB
            </Link>
            <Link href="/rechtliches#widerruf" className="transition-colors hover:text-gold">
              Widerruf
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/site/navbar.tsx")"
cat > "src/components/site/navbar.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
"use client";

import * as React from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { navLinks, siteConfig } from "@/lib/site";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));

  // Lock body scroll when the mobile menu is open.
  React.useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto px-3 pt-3 sm:px-5 sm:pt-4">
        <nav
          className={cn(
            "mx-auto flex max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 [transition-timing-function:var(--ease-lux)] sm:px-5",
            scrolled
              ? "glass border border-border shadow-[var(--shadow-soft)]"
              : "border border-transparent",
          )}
        >
          <Link
            href="#home"
            className="font-serif text-lg font-semibold tracking-tight"
            aria-label={`${siteConfig.name} – zur Startseite`}
          >
            {siteConfig.name}
          </Link>

          <ul className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="rounded-full px-4 py-2 text-sm text-ink-soft transition-colors duration-300 hover:bg-surface-soft hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link href="#shop">Jetzt entdecken</Link>
            </Button>
            <button
              type="button"
              aria-label="Menü öffnen"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/60 md:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 top-0 z-40 md:hidden"
          >
            <div
              className="absolute inset-0 bg-canvas/80 backdrop-blur-xl"
              onClick={() => setOpen(false)}
            />
            <motion.ul
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-3 mt-24 space-y-1 rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-float)]"
            >
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 text-lg font-medium text-ink transition-colors hover:bg-surface-soft"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Button asChild className="w-full" onClick={() => setOpen(false)}>
                  <Link href="#shop">Jetzt entdecken</Link>
                </Button>
              </li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/site/theme-provider.tsx")"
cat > "src/components/site/theme-provider.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/site/theme-toggle.tsx")"
cat > "src/components/site/theme-toggle.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Helles Design aktivieren" : "Dunkles Design aktivieren"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/60 text-ink transition-colors duration-300 hover:bg-surface-soft"
    >
      <AnimatePresence mode="wait" initial={false}>
        {mounted && (
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ opacity: 0, rotate: -45, scale: 0.6 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 45, scale: 0.6 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {isDark ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/ui/badge.tsx")"
cat > "src/components/ui/badge.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "gold" | "outline";

const variants: Record<Variant, string> = {
  default: "bg-surface-soft text-ink-soft",
  gold: "bg-gold/12 text-gold ring-1 ring-gold/25",
  outline: "border border-border text-muted",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { variant?: Variant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-wide",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/ui/button.tsx")"
cat > "src/components/ui/button.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import * as React from "react";
import { Slot } from "@/components/ui/slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "gold" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ink text-canvas hover:bg-ink/90 shadow-[var(--shadow-soft)]",
  gold: "bg-gold text-white hover:brightness-105 shadow-[var(--shadow-soft)]",
  outline:
    "border border-border bg-transparent text-ink hover:bg-surface-soft",
  ghost: "bg-transparent text-ink hover:bg-surface-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-13 px-8 text-base",
};

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "group relative inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-tight",
          "transition-[transform,background-color,filter,box-shadow] duration-300 [transition-timing-function:var(--ease-lux)]",
          "active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/ui/section.tsx")"
cat > "src/components/ui/section.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import * as React from "react";
import { cn } from "@/lib/utils";

export function Section({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("scroll-mt-24 py-20 sm:py-28 lg:py-32", className)}
      {...props}
    >
      {children}
    </section>
  );
}

export function Container({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.28em] text-gold",
        className,
      )}
    >
      <span className="h-px w-7 bg-gold/50" aria-hidden />
      {children}
    </span>
  );
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/components/ui/slot.tsx")"
cat > "src/components/ui/slot.tsx" <<'EOF_MAISON_ELORIA_9f3a2b'
import * as React from "react";

/**
 * Minimal `asChild` slot: merges the component's props onto its single
 * child element. Avoids pulling in an extra dependency for one use case.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
}

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!React.isValidElement(children)) return null;

    const child = children as React.ReactElement<Record<string, unknown>>;
    const childProps = child.props;

    return React.cloneElement(child, {
      ...props,
      ...childProps,
      className: [
        (props as { className?: string }).className,
        childProps.className as string | undefined,
      ]
        .filter(Boolean)
        .join(" "),
      ref,
    } as Record<string, unknown>);
  },
);
Slot.displayName = "Slot";
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/lib/legal.ts")"
cat > "src/lib/legal.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
export interface LegalSection {
  id: string;
  title: string;
  body: string;
}

export const legalSections: LegalSection[] = [
  {
    id: "impressum",
    title: "Impressum",
    body: `MAISON ELORIA

Angaben gemäß § 5 DDG

Julian Graf von und zu Egloffstein
[Rechtsform ergänzen, falls zutreffend]
[Adresse einfügen]
[PLZ Ort einfügen]
Deutschland

Kontakt
Telefon: [Telefonnummer einfügen]
E-Mail: [E-Mail-Adresse einfügen]

Vertreten durch
Julian Graf von und zu Egloffstein

Umsatzsteuer
Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG: [USt-IdNr. einfügen]

Registereintrag
Eintragung im Handelsregister: [Registergericht und Registernummer einfügen, falls vorhanden]

Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV
Julian Graf von und zu Egloffstein
[Adresse einfügen, sofern abweichend]

Haftung für Inhalte
Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte wird jedoch keine Gewähr übernommen. Gesetzliche Verantwortlichkeiten bleiben unberührt.

Haftung für Links
Sofern diese Website Links zu externen Websites Dritter enthält, besteht auf deren Inhalte kein Einfluss. Für diese fremden Inhalte wird daher keine Gewähr übernommen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich.

Urheberrecht
Die auf dieser Website veröffentlichten Inhalte unterliegen dem deutschen Urheberrecht, soweit nicht anders gekennzeichnet. Jede Verwertung außerhalb der Grenzen des Urheberrechts bedarf der vorherigen schriftlichen Zustimmung des jeweiligen Rechteinhabers.`,
  },
  {
    id: "datenschutz",
    title: "Datenschutzerklärung",
    body: `1. Verantwortlicher
Verantwortlich für die Datenverarbeitung auf dieser Website ist:
Julian Graf von und zu Egloffstein
[Adresse einfügen]
[E-Mail-Adresse einfügen]
[Telefonnummer einfügen]

2. Allgemeine Hinweise zur Datenverarbeitung
Der Schutz Ihrer personenbezogenen Daten hat für uns höchste Priorität. Wir verarbeiten personenbezogene Daten ausschließlich im Rahmen der geltenden datenschutzrechtlichen Vorschriften, insbesondere der DSGVO und des BDSG.

3. Hosting und Server-Logfiles
Beim Besuch dieser Website werden durch den Hosting-Anbieter technisch erforderliche Daten automatisch erfasst (z. B. IP-Adresse, Datum und Uhrzeit des Zugriffs, Browsertyp, Betriebssystem, Referrer-URL). Die Verarbeitung erfolgt zur Gewährleistung von Stabilität, Sicherheit und Funktionsfähigkeit der Website.

4. Kontaktaufnahme
Wenn Sie uns per Kontaktformular oder E-Mail kontaktieren, verarbeiten wir die von Ihnen mitgeteilten Daten zur Bearbeitung Ihrer Anfrage und für den Fall von Anschlussfragen.

5. Kundenkonto und Bestellungen
Im Rahmen einer Bestellung verarbeiten wir die erforderlichen Daten (Name, Rechnungs- und Lieferadresse, Kontaktdaten, Zahlungsinformationen). Die Verarbeitung erfolgt zur Vertragsdurchführung sowie Erfüllung gesetzlicher Aufbewahrungspflichten.

6. Zahlungsdienstleister
Zur Zahlungsabwicklung können externe Zahlungsdienstleister eingebunden werden. Es gelten ergänzend deren Datenschutzbestimmungen.

7. Newsletter
Wenn Sie unseren Newsletter abonnieren, verarbeiten wir Ihre E-Mail-Adresse zur Versendung sowie zur Dokumentation Ihrer Einwilligung (Double-Opt-in). Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.

8. Cookies und ähnliche Technologien
Diese Website verwendet technisch notwendige Cookies. Nicht erforderliche Cookies werden erst nach Ihrer ausdrücklichen Einwilligung gesetzt.

9. Ihre Rechte
Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit sowie Widerspruch. Erteilte Einwilligungen können Sie jederzeit widerrufen.

10. Beschwerderecht
Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.

11. Aktualität und Änderungen
Maßgeblich ist die jeweils auf dieser Website veröffentlichte Fassung.`,
  },
  {
    id: "agb",
    title: "AGB",
    body: `1. Geltungsbereich
Diese AGB gelten für alle Bestellungen, die Verbraucher und Unternehmer über den Online-Shop von MAISON ELORIA abschließen.

2. Vertragspartner
Der Kaufvertrag kommt zustande mit:
Julian Graf von und zu Egloffstein
[Adresse einfügen]
[E-Mail-Adresse einfügen]

3. Angebot und Vertragsschluss
Die Darstellung der Produkte stellt kein bindendes Angebot dar. Durch Anklicken von „Zahlungspflichtig bestellen“ geben Sie ein verbindliches Angebot ab. Der Vertrag kommt durch unsere Auftragsbestätigung oder Versand der Ware zustande.

4. Preise und Versandkosten
Alle Preise verstehen sich in Euro. Versandkosten werden im Bestellprozess gesondert ausgewiesen.

5. Zahlung
Die Zahlung erfolgt über die im Shop angebotenen Zahlungsmethoden.

6. Lieferung
Die Lieferung erfolgt an die angegebene Lieferadresse. Teillieferungen sind zulässig, soweit zumutbar.

7. Eigentumsvorbehalt
Die Ware bleibt bis zur vollständigen Bezahlung unser Eigentum.

8. Widerrufsrecht
Verbrauchern steht das gesetzliche Widerrufsrecht zu (siehe Widerrufsbelehrung).

9. Gewährleistung
Es gelten die gesetzlichen Mängelhaftungsrechte.

10. Produkthinweise
Unsere Produkte dienen der kosmetischen Anwendung. Bitte beachten Sie die Anwendungshinweise und prüfen Sie Produkte bei empfindlicher Haut gegebenenfalls zunächst an einer kleinen Hautstelle.

11. Schlussbestimmungen
Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts, soweit dem keine zwingenden Verbraucherschutzvorschriften entgegenstehen.`,
  },
  {
    id: "widerruf",
    title: "Widerrufsbelehrung",
    body: `Verbraucher haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.

Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter die Ware in Besitz genommen haben.

Um Ihr Widerrufsrecht auszuüben, müssen Sie uns
Julian Graf von und zu Egloffstein
[Adresse einfügen]
[E-Mail-Adresse einfügen]
mittels einer eindeutigen Erklärung über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.

Folgen des Widerrufs
Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von Ihnen erhalten haben, einschließlich der Lieferkosten, unverzüglich und spätestens binnen vierzehn Tagen zurückzuzahlen. Wir können die Rückzahlung verweigern, bis wir die Waren zurückerhalten haben.

Sie haben die Waren unverzüglich und spätestens binnen vierzehn Tagen an uns zurückzusenden. Sie tragen die unmittelbaren Kosten der Rücksendung der Waren.

Ausschluss des Widerrufsrechts
Das Widerrufsrecht besteht nicht bei versiegelten Waren, die aus Gründen des Gesundheitsschutzes oder der Hygiene nicht zur Rückgabe geeignet sind, wenn ihre Versiegelung nach der Lieferung entfernt wurde.`,
  },
];
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/lib/products.ts")"
cat > "src/lib/products.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
export type SkinType =
  | "Alle Hauttypen"
  | "Trockene Haut"
  | "Empfindliche Haut"
  | "Reife Haut"
  | "Mischhaut"
  | "Normale Haut";

export type Category = "Serum" | "Creme" | "Reinigung" | "Augenpflege" | "Toner" | "Öl";

export interface Product {
  id: string;
  name: string;
  promise: string;
  description: string;
  price: number;
  category: Category;
  skinType: SkinType;
  bestseller: boolean;
  rating: number;
  image: string;
  ingredients: string[];
  usage: string;
}

export const products: Product[] = [
  {
    id: "velvet-renewal-serum",
    name: "Velvet Renewal Serum",
    promise: "Feine Linien sichtbar verfeinern.",
    description:
      "Ein seidiges Premium-Serum mit gepflegter Textur für ein glattes, ebenmäßiges und strahlendes Hautbild.",
    price: 89,
    category: "Serum",
    skinType: "Alle Hauttypen",
    bestseller: true,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Niacinamid", "Peptide", "Hyaluron", "Squalan"],
    usage:
      "Morgens und abends 2–3 Tropfen auf die gereinigte Haut auftragen und sanft einarbeiten.",
  },
  {
    id: "pure-radiance-cream",
    name: "Pure Radiance Cream",
    promise: "Nährt intensiv und schenkt Komfort.",
    description:
      "Eine reichhaltige, dennoch moderne Pflegecreme für geschmeidige Haut und ein luxuriöses Finish.",
    price: 74,
    category: "Creme",
    skinType: "Trockene Haut",
    bestseller: true,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Ceramide", "Sheabutter", "Vitamin E", "Jojobaöl"],
    usage: "Als letzten Pflegeschritt morgens und abends auftragen.",
  },
  {
    id: "golden-dew-cleanser",
    name: "Golden Dew Cleanser",
    promise: "Milde Reinigung mit luxuriöser Haptik.",
    description:
      "Ein sanfter Cleanser, der Make-up, Alltagsspuren und überschüssigen Talg gründlich entfernt.",
    price: 42,
    category: "Reinigung",
    skinType: "Empfindliche Haut",
    bestseller: false,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Aloe Vera", "Panthenol", "Glycerin", "Haferextrakt"],
    usage: "Auf feuchter Haut einmassieren und mit Wasser abnehmen.",
  },
  {
    id: "luminous-eye-elixir",
    name: "Luminous Eye Elixir",
    promise: "Frischer Blick mit eleganter Leichtigkeit.",
    description:
      "Eine gezielte Augenpflege für ein geglättetes Erscheinungsbild und ein vitales, waches Aussehen.",
    price: 68,
    category: "Augenpflege",
    skinType: "Reife Haut",
    bestseller: false,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Koffein", "Peptide", "Hyaluron", "Magnolienextrakt"],
    usage: "Morgens und abends sanft um die Augenpartie einklopfen.",
  },
  {
    id: "silk-barrier-mist",
    name: "Silk Barrier Mist",
    promise: "Hydration in feinstem Sprühnebel.",
    description:
      "Ein ultrafeiner Pflege-Nebel zur Erfrischung, Durchfeuchtung und Vorbereitung der Haut auf die weitere Routine.",
    price: 48,
    category: "Toner",
    skinType: "Mischhaut",
    bestseller: false,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Rosenwasser", "Beta-Glucan", "Aminosäuren", "Glycerin"],
    usage: "Nach der Reinigung oder zwischendurch aufsprühen.",
  },
  {
    id: "nocturne-repair-oil",
    name: "Nocturne Repair Oil",
    promise: "Nächtliche Regeneration mit edlem Glow.",
    description:
      "Ein seidiges Gesichtsöl für die abendliche Pflegeroutine mit luxuriösem Hautgefühl und geschmeidigem Finish.",
    price: 79,
    category: "Öl",
    skinType: "Normale Haut",
    bestseller: true,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1200&q=80",
    ingredients: ["Arganöl", "Bakuchiol", "Squalan", "Aprikosenkernöl"],
    usage: "Abends 3–4 Tropfen als Abschluss der Routine auftragen.",
  },
];

export const categories: ("Alle" | Category)[] = [
  "Alle",
  "Serum",
  "Creme",
  "Reinigung",
  "Augenpflege",
  "Toner",
  "Öl",
];
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/lib/site.ts")"
cat > "src/lib/site.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
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
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "src/lib/utils.ts")"
cat > "src/lib/utils.ts" <<'EOF_MAISON_ELORIA_9f3a2b'
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number, currency = "EUR", locale = "de-DE") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}
EOF_MAISON_ELORIA_9f3a2b

mkdir -p "$(dirname "tsconfig.json")"
cat > "tsconfig.json" <<'EOF_MAISON_ELORIA_9f3a2b'
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
EOF_MAISON_ELORIA_9f3a2b

echo ""
echo "Fertig. Jetzt:  npm install  &&  npm run dev"
