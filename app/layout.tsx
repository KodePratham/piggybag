import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Monoken",
  description: "Monoken Landing Page",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
