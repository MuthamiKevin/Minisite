import type { Metadata } from "next";
import "./globals.css";

// Without metadataBase, relative share-image paths get resolved against whatever
// host built the site — which meant WhatsApp was being handed a localhost URL it
// could never load, so link previews came through with no image at all.
const SITE_URL = "https://allanandshiphira.netlify.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Allan & Shiphira | 17 October 2026",
  description: "Join Allan and Shiphira as they celebrate their wedding at Naipei Gardens, Limuru.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Allan & Shiphira",
    title: "Allan & Shiphira",
    description: "Our Journey. His Grace. Our Forever.",
    // share.jpg is venue.jpg recropped to 1200x630 — the size WhatsApp and Facebook
    // need before they'll render a large banner instead of a small thumbnail.
    images: [{ url: "/share.jpg", width: 1200, height: 630, type: "image/jpeg", alt: "Naipei Gardens, Limuru" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Allan & Shiphira",
    description: "17 October 2026 · Naipei Gardens, Limuru",
    images: ["/share.jpg"],
  },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
