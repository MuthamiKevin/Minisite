import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Allan & Shiphira | 17 October 2026",
  description: "Join Allan and Shiphira as they celebrate their wedding at Naipei Gardens, Limuru.",
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Allan & Shiphira", description: "Our Journey. His Grace. Our Forever.", images: ["/og.jpg"] },
  twitter: { card: "summary_large_image", title: "Allan & Shiphira", description: "17 October 2026 · Naipei Gardens, Limuru", images: ["/og.jpg"] },
};

export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body>{children}</body></html>;
}
