import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans, Noto_Sans_Devanagari } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import "./globals.css";

const notoSerif = Noto_Serif({
  variable: "--font-noto-serif",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vedanta Academy",
  description:
    "A traditional sanctuary for study, reflection, and realization. Live guided courses in Advaita Vedanta, Bhagavad Gita, and meditation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${notoSerif.variable} ${plusJakarta.variable} ${notoDevanagari.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-surface text-on-surface font-sans">
          {children}
          <Toaster position="bottom-center" />
        </body>
      </html>
    </ClerkProvider>
  );
}
