import type { Metadata } from "next";
import { Bricolage_Grotesque, Figtree } from "next/font/google";
import { TopBar } from "@/components/TopBar";
import { SaveStateProvider } from "@/components/SaveState";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-display",
});
const body = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "Dream Planner ♡",
  description: "Home, trips and savings in one place.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>
        <SaveStateProvider>
          <TopBar />
          {children}
        </SaveStateProvider>
      </body>
    </html>
  );
}
