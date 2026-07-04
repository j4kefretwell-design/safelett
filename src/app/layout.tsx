import type { Metadata } from "next";
import { DM_Sans, Inter, Playfair_Display } from "next/font/google";
import { BRAND_NAME } from "@/lib/brand";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Property Compliance Tracking`,
  description:
    "Track property compliance certificates for UK property managers",
  verification: {
    google: "qHPs2PS85slhBPPOE2PoBE8Jv9tCWjF1svdS3ZBraZ4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${inter.variable} ${playfair.variable}`}>
      <head>
        <link
          rel="preload"
          as="image"
          href="/anthony-fomin-zjBxPUHE_ok-unsplash.jpg"
          fetchPriority="high"
        />
        <link
          rel="preload"
          as="image"
          href="/vojtech-bartonicek-wgG7jLQ7M0U-unsplash.jpg"
          fetchPriority="high"
        />
      </head>
      <body className={`${dmSans.className} bg-dusty-cream font-light text-text antialiased`}>
        {children}
      </body>
    </html>
  );
}
