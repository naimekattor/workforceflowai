"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { MouseEvent } from "react";

interface ScrollIntoViewOptions {
  behavior: "smooth" | "auto";
}

const Footer = () => {
    const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>): void => {
  e.preventDefault();

  if (window.location.pathname === "/") {
    document.getElementById("hero")?.scrollIntoView({
      behavior: "smooth",
    } as ScrollIntoViewOptions);
  } else {
    router.push("/#hero");
  }
};
  return (
    <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 lg:col-span-2">
          <div className="mb-6">
  <Link href="/#hero" onClick={handleClick}>
    <div className="relative w-[180px] h-[80px]">
      <Image
        src="/images/workforceflowailogo1.png"
        alt="Revoostai logo"
        fill
        sizes="(max-width: 768px) 120px, 180px"
        className="object-contain"
      />
    </div>
  </Link>
</div>
          <p className="text-sm max-w-xs">
            Complete workflow management for modern service businesses.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Product</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/#features"
                className="hover:text-cyan-400 transition-colors"
              >
                Features
              </Link>
            </li>
            <li>
              <Link
                href="/#pricing"
                className="hover:text-cyan-400 transition-colors"
              >
                Pricing
              </Link>
            </li>
            <li>
              <Link
                href="/#how-it-works"
                className="hover:text-cyan-400 transition-colors"
              >
                How It Works
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Company</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/about"
                className="hover:text-cyan-400 transition-colors"
              >
                About Us
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="hover:text-cyan-400 transition-colors"
              >
                Contact
              </Link>
            </li>
            <li>
              <Link
                href="/support"
                className="hover:text-cyan-400 transition-colors"
              >
                Support
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <Link
                href="/privacy-policy"
                className="hover:text-cyan-400 transition-colors"
              >
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link
                href="/terms-conditions"
                className="hover:text-cyan-400 transition-colors"
              >
                Terms and Conditions
              </Link>
            </li>
            
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
        <p>© 2026 Workforceflow AI Ltd. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
