"use client";

import Link from "next/link";
import { useLocale } from "@/lib/LocaleContext";

export default function FooterBottom() {
  const { t } = useLocale();

  return (
    <footer className="border-t border-navy-900/10 bg-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img
              src="/images/logo-canonbridge.svg"
              alt="CanonBridge"
              width={180}
              height={40}
              className="h-14 w-auto"
            />
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-navy-700" aria-label="Footer navigation">
            <a href="#how-it-works" className="hover:text-navy-900 transition-colors">
              How It Works
            </a>
            <a href="#architecture" className="hover:text-navy-900 transition-colors">
              Architecture
            </a>
            <Link href="/pricing" className="hover:text-navy-900 transition-colors">
              Pricing
            </Link>
            <a href="#demo" className="hover:text-navy-900 transition-colors">
              Contact
            </a>
            <Link href="/terms" className="hover:text-navy-900 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-navy-900 transition-colors">
              Privacy
            </Link>
            <Link href="/dpa" className="hover:text-navy-900 transition-colors">
              DPA
            </Link>
          </nav>

          <div className="text-sm text-navy-700/65">
            {t.footer.copyright}
          </div>
        </div>
      </div>
    </footer>
  );
}
