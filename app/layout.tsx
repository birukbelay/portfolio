import type { Metadata, Viewport } from "next";
import { Inter, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import Navbar from "@/components/site/Navbar";
import Footer from "@/components/site/Footer";
import RevealObserver from "@/components/site/RevealObserver";
import { MotionEffects } from "@/components/site/Motion";
import "@/styles/globals.css";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  title: "Biruk Kassa — Software Engineer",
  description:
    "Full-stack software engineer building scalable backends (Node.js, NestJS, Go) and polished web apps (React, Next.js).",
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f6f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e0e0c" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`scroll-smooth ${sans.variable} ${display.variable} ${mono.variable}`}>
      <body>
        {/* Runs before paint: applies the saved theme (no flash). Entrance animations and scroll
            reveals only switch on once the browser actually draws a frame ("motion-ready"), so
            content never gets stuck invisible where animations can't run. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){var d=document.documentElement;d.classList.add('js-reveal');requestAnimationFrame(function(){d.classList.add('motion-ready')});try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'||t==='ocean')d.dataset.theme=t}catch(e){}})()",
          }}
        />
        <RevealObserver />
        <MotionEffects />
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
