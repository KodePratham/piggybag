"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ConnectWallet } from "@/components/ConnectWallet";

const navLinks = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "What we fund", href: "/#what-we-fund" },
  { label: "Profile", href: "/profile" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/90 backdrop-blur-sm">
      <div className="pb-wrap flex h-14 items-center justify-between gap-6">
        <Link href="/" className="text-[15px] font-semibold tracking-tight text-[var(--foreground)] no-underline">
          PiggyBag
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/profile" && pathname === "/profile";
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
            href="/#apply"
            className="hidden text-sm font-medium text-[var(--brand)] no-underline hover:underline sm:inline"
          >
            Apply
          </Link>
          <ConnectWallet compact />
        </div>
      </div>
    </header>
  );
}
