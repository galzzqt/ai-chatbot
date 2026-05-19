import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "OLLI AI - TopsellBelanja AI Assistant",
  description: "Asisten belanja AI resmi dari TopsellBelanja. Temukan rekomendasi gadget terbaik, hitung cicilan, dan bandingkan spesifikasi HP dengan mudah.",
  icons: {
    icon: "/logo.png",
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
      className={`${dmSans.variable} h-full antialiased`}
    >
      <body className="overflow-hidden">{children}</body>
    </html>
  );
}
