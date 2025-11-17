import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Among Us Log Viewer",
  description: "Among Us game analytics dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
