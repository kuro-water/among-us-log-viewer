import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Among Us Analytics Dashboard",
  description: "Analyze Among Us game data with interactive charts",
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
