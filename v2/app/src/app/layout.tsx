import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Companion Memory OS",
  description: "AI 陪伴产品 Memory 留存优化 — 真实 Memory 闭环 Demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
