/** Lane: pages. */
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Project Name",
  description: "One-line pitch goes here.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
