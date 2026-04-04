import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PatientProvider } from "@/contexts/PatientContext";
import { MainHeader } from "@/components/ui/MainHeader";
import { Footer } from "@/components/ui/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agnos Patient Management",
  description: "Real-time patient information management system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-gray-900 font-sans">
        <PatientProvider>
          <MainHeader />
          <div className="flex-1 flex flex-col">
            {children}
          </div>
          <Footer />
        </PatientProvider>
      </body>
    </html>
  );
}
