import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Black One NFC Memory System",
  description: "面向 NFC 自然记忆内容的体验站与后台运营系统。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
