/** Lane: pages. */
import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "./(site)/_components/Nav";
import Footer from "./(site)/_components/Footer";
import { ToastProvider } from "@/components/core/Toast";
import CommandK from "@/components/core/CommandK";

export const metadata: Metadata = {
  title: { default: "SmartPath Scout — name any GT class", template: "%s · SmartPath Scout" },
  description:
    "Name any Georgia Tech class. A swarm of Grok agents scours the web and X for past exams, syllabi and student chatter, then builds you a SmartPath study path in about 60 seconds.",
  openGraph: {
    title: "SmartPath Scout",
    description: "A swarm of Grok agents builds your study path for any Georgia Tech class.",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#06080c", colorScheme: "dark" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <ToastProvider>
          <Nav />
          <div className="min-h-[calc(100vh-4rem)]">{children}</div>
          <Footer />
          <CommandK />
        </ToastProvider>
      </body>
    </html>
  );
}
