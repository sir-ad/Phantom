import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Phantom Workspace",
  description: "AI-Native Product Management OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
