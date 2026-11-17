"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * Link to a section of the home page ("/#work"). On the home page it always scrolls smoothly to
 * the section — even when the URL already ends in that hash, where a normal link does nothing.
 * From other pages it navigates home and lands on the section.
 */
export default function HashLink({
  href,
  onNavigate,
  ...props
}: Omit<React.ComponentProps<typeof Link>, "href"> & { href: `/#${string}`; onNavigate?: () => void }) {
  const pathname = usePathname();
  const id = href.slice(2);

  return (
    <Link
      href={href}
      {...props}
      onClick={(e) => {
        props.onClick?.(e);
        onNavigate?.();
        if (pathname !== "/") return; // let Next navigate home; the browser jumps to the hash
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        history.replaceState(null, "", `#${id}`);
      }}
    />
  );
}
