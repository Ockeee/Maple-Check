import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Topbar from "@/components/Topbar";

const myFont = localFont({
  src: '../../public/fonts/Maplestory_Bold.ttf',
  variable: '--font-main',
})
export const metadata: Metadata = {
  title: "아맞다 메이플!",
  description: "My checklist app",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: '#ffffff',
}

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
