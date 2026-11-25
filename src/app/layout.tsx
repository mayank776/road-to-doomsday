import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import { BackToTop, SiteFooter, SiteHeader } from "@/components/layout/site-header-footer";
import { SmoothScroll } from "@/components/effects/smooth-scroll";
import { CustomCursor } from "@/components/effects/custom-cursor";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const anton = Anton({ variable: "--font-anton", subsets: ["latin"], weight: "400" });
const jbm = JetBrains_Mono({ variable: "--font-jbm", subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: { default: "The Road to Doomsday", template: "%s · The Road to Doomsday" },
  description:
    "A visual, evidence-labelled journey through the MCU threads leading into Avengers: Doomsday.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${anton.variable} ${jbm.variable} grain font-sans antialiased`}>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-16 focus:z-[80] focus:bg-raised focus:px-3 focus:py-2">
          Skip to content
        </a>
        <SmoothScroll />
        <CustomCursor />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <BackToTop />
      </body>
    </html>
  );
}
