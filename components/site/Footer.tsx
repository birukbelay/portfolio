"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuGithub, LuLinkedin } from "react-icons/lu";
import { FaMedium } from "react-icons/fa";
import { LINKS } from "@/data/myLinks";

export default function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  const socials = [
    { href: LINKS.LINKEDIN_URL, label: "LinkedIn", icon: LuLinkedin },
    { href: LINKS.GITHUB_URL, label: "GitHub", icon: LuGithub },
    { href: LINKS.MediumUrl, label: "Medium", icon: FaMedium },
  ];

  return (
    <footer className="no-print border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-sm text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} Biruk Kassa · <Link href="/resume" className="hover:text-ink">Résumé</Link>
        </p>
        <div className="flex items-center gap-1">
          {socials.map(({ href, label, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="rounded-full p-2 transition hover:bg-ink/5 hover:text-ink">
              <Icon size={17} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
