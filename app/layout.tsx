import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Biruk | Software Engineer",
  description: "Full-Stack Developer, Web and Mobile",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-[#ecf0f3] text-[#1f2937] tracking-wide antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
