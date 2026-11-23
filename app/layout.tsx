import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Header from "./components/header";
import Footer from "./components/footer";
import ThemeProvider from "./components/theme-provider";
import ThemeProviderWrapper from "./components/theme-provider-wrapper";

import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Optic Feed",
  description: "A Social Media Website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteContent = (
    <>
      <Suspense
        fallback={
          <header className="border-b border-gray-200 bg-gray-200 px-6 py-4">
            Loading...
          </header>
        }
      >
        <Header />
      </Suspense>

      <main className="flex-1">
        {children}
      </main>

      <Footer />
    </>
  );

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Suspense
          fallback={
            <ThemeProvider initialTheme="light">
              {siteContent}
            </ThemeProvider>
          }
        >
          <ThemeProviderWrapper>
            {siteContent}
          </ThemeProviderWrapper>
        </Suspense>
      </body>
    </html>
  );
}
