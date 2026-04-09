import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Topbar from "@/components/Topbar";

const myFont = localFont({
  src: '../../public/fonts/Maplestory_Bold.ttf',
  variable: '--font-main',
})
export const metadata: Metadata = {
  title: "Checklist App",
  description: "My checklist app",
  manifest: "/manifest.json",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={myFont.variable}>
        <Topbar />
        {children}
      </body>
    </html>
  );
}
