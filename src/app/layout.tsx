import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layout/ClientLayout";
import { OrganizationSchema, WebsiteSchema, LocalBusinessSchema } from "@/components/seo/StructuredData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

import { DEFAULT_SETTINGS } from "@/lib/settings";
import { getSettings } from "@/lib/settings-db";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteName = settings?.siteName || DEFAULT_SETTINGS.siteName;
  const description = settings?.siteDescriptionEn || DEFAULT_SETTINGS.siteDescriptionEn;

  return {
    title: {
      default: `${siteName} - #1 Auto Repair Shop Directory`,
      template: `%s | ${siteName}`
    },
    description: description,
    keywords: [
      "auto repair shop directory",
      "mechanic near me",
      "car repair",
      "certified workshops",
      "automotive service",
      "trusted mechanic",
      siteName,
      "auto repair Fort Worth",
      "auto repair Texas",
      "TX mechanics"
    ],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"),
    alternates: {
      canonical: "/",
      languages: {
        'es-MX': '/es',
        'en-US': '/'
      }
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      alternateLocale: ["es_MX"],
      siteName: siteName,
      title: `${siteName} - #1 Auto Repair Shop Directory`,
      description: description,
      images: [
        {
          url: "/uploads/workshops/autorepara.png",
          width: 1200,
          height: 630,
          alt: `${siteName} - Auto Repair Shop Directory`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteName} - Auto Repair Shop Directory`,
      description: description,
      images: ["/uploads/workshops/autorepara.png"],
      creator: `@${siteName.replace(/\s+/g, '')}`
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: settings?.googleSiteVerification || process.env.GOOGLE_SITE_VERIFICATION || "",
    },
    category: "automotive services",
    classification: "Auto Repair Directory",
    other: {
      "geo.region": "US-TX",
      "geo.placename": "Fort Worth",
      "geo.position": "32.7555;-97.3308",
    }
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
        <OrganizationSchema settings={settings} />
        <WebsiteSchema settings={settings} />
        <LocalBusinessSchema settings={settings} />
      </head>
      <body className={`${inter.variable} font-sans antialiased`} suppressHydrationWarning>
        <ClientLayout settings={settings}>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
