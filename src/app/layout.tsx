import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nick Dobos Media",
  description: "Professional photography services based in Newnan, GA",
  icons: {
    icon: `/favicon.ico?t=${Date.now()}`,
  },
  openGraph: {
    title: "Nick Dobos Media",
    description: "Professional photography services based in Newnan, GA", 
    url: "https://nickdobosmedia.com",
    images: [
      {
        url: "https://wasabindmdemo.imgix.net/real-estate/featured-work/_DR62951-HDR.jpg?w=1200&h=630&fit=crop&auto=format",
        width: 1200,
        height: 630,
        alt: "Nick Dobos Media - Professional Real Estate Photography",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nick Dobos Media",
    description: "Professional photography services based in Newnan, GA",
    images: ["https://wasabindmdemo.imgix.net/real-estate/featured-work/_DR62951-HDR.jpg?w=1200&h=630&fit=crop&auto=format"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navigation />
        <main className="pt-16">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
