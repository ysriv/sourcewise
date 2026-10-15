import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sourcewise — Research, with receipts",
  description:
    "Ask questions about your own research material and get answers you can trace back to the source.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
