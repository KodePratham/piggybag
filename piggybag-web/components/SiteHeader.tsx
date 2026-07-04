"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "@/components/ConnectWallet";
import { Logo } from "@/components/Logo";

const navLinks = [
  { label: "Monad Blitz", href: "/monad-blitz" },
  { label: "Profile", href: "/profile" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/90 backdrop-blur-sm">
      <div className="pb-header-wrap flex h-14 items-center justify-between gap-6">
        <Logo size={26} />

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive =
              (link.href === "/profile" && pathname === "/profile") ||
              (link.href === "/monad-blitz" && pathname === "/monad-blitz");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium no-underline transition-colors ${
                  isActive
                    ? "text-[var(--brand)]"
                    : "text-[#55535f] hover:text-[var(--foreground)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/apply"
            className={`hidden text-sm font-medium no-underline sm:inline ${
              pathname === "/apply"
                ? "text-[var(--brand)] underline"
                : "text-[var(--brand)] hover:underline"
            }`}
          >
            Apply
          </Link>
          <ConnectWallet compact />
        </div>
      </div>
    </header>
  );
}
