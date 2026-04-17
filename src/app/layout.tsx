import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display, JetBrains_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const mono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Gavel — settle it in court",
    template: "%s · Gavel",
  },
  description:
    "Submit a dispute. Watch a jury of fifteen AI personas argue it out and hand down a verdict. Petty beefs or real disputes — Gavel decides.",
  applicationName: "Gavel",
  keywords: [
    "dispute",
    "ai jury",
    "settle a beef",
    "couples court",
    "roommate court",
  ],
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Gavel",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    type: "website",
    title: "Gavel — settle it in court",
    description:
      "Submit a dispute. Watch a jury of AI personas argue it out and hand down a verdict.",
    siteName: "Gavel",
    url: baseUrl,
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Gavel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gavel — settle it in court",
    description:
      "Submit a dispute. Watch a jury of AI personas argue it out and hand down a verdict.",
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${inter.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground font-sans flex flex-col [overscroll-behavior-y:contain]">
        <div aria-hidden className="gv-grain" />
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster richColors closeButton position="top-center" />
      </body>
    </html>
  );
}
