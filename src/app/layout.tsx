import type { Metadata } from "next";
import { Bodoni_Moda, DM_Sans, Playfair_Display } from "next/font/google";
import CookieNotice from "@/components/CookieNotice";
import { BRAND_NAME } from "@/lib/brand";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseOrigin = (() => {
  try {
    return supabaseUrl ? new URL(supabaseUrl).origin : null;
  } catch {
    return null;
  }
})();

export const metadata: Metadata = {
  title: `${BRAND_NAME} — Property Compliance Tracking`,
  description:
    "Track property compliance certificates for UK property managers",
  verification: {
    google: "qHPs2PS85slhBPPOE2PoBE8Jv9tCWjF1svdS3ZBraZ4",
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=3", sizes: "any" },
      { url: "/favicon-32x32.png?v=3", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=3",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfair.variable} ${bodoni.variable}`}
    >
      <head>
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <link rel="preconnect" href="https://api.resend.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://api.resend.com" />
      </head>
      <body
        className={`${dmSans.className} bg-dusty-cream font-light text-text antialiased`}
      >
        {children}
        <CookieNotice />
      </body>
    </html>
  );
}
