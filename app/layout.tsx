import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PPC Marketer Finder",
  description: "Find businesses running PPC campaigns in any area",
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
