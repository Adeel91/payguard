import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PayGuard",
    template: "%s | PayGuard",
  },
  description: "Paid before signing safety agent for Web3 users and CROO agent commerce.",
  applicationName: "PayGuard",
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/android-chrome-512x512.png",
      },
    ],
  },
  openGraph: {
    title: "PayGuard",
    description:
      "Paid before signing safety agent for Web3 users and CROO agent commerce.",
    siteName: "PayGuard",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "PayGuard logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "PayGuard",
    description:
      "Paid before signing safety agent for Web3 users and CROO agent commerce.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-canvas text-ink antialiased">{children}</body>
    </html>
  );
}
