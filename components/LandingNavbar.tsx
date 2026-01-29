"use client";

import Link from "next/link";
import {
  Zap,
  Briefcase,
  PlayCircle,
  BookOpen,
  Rocket,
  ChevronDown,
  Handshake,
  Factory,
  Truck,
  Shield,
} from "lucide-react";

export default function LandingNavbar() {
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
            <Zap className="h-4 w-4 text-white" fill="currentColor" />
          </div>
          <span className="text-lg font-bold tracking-tight">LeadGenius</span>
        </div>

        {/* Links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Product
          </Link>

          {/* Resources Dropdown */}
          <div className="group relative h-full flex items-center">
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
              Resources
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 fixed top-14 left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ease-out z-60">
              <div className="w-[480px] overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-2xl shadow-purple-500/20 dark:bg-slate-950 ring-1 ring-black/5">
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/resources/case-studies"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-300 group/item border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover/item:bg-blue-600 group-hover/item:text-white dark:bg-blue-900/50 dark:text-blue-400">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground mb-0.5">
                        Case Studies
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        Success stories & results
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/demo-videos"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-linear-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 transition-all duration-300 group/item border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover/item:bg-purple-600 group-hover/item:text-white dark:bg-purple-900/50 dark:text-purple-400">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground mb-0.5">
                        Demo Videos
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        Product walkthroughs
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/latest-blogs"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-linear-to-br hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-900/40 dark:hover:to-rose-900/40 transition-all duration-300 group/item border border-transparent hover:border-pink-100 dark:hover:border-pink-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-600 transition-colors group-hover/item:bg-pink-600 group-hover/item:text-white dark:bg-pink-900/50 dark:text-pink-400">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground mb-0.5">
                        Latest Blogs
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        Insights & sales tips
                      </p>
                    </div>
                  </Link>

                  <Link
                    href="/resources/gtm-resources"
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/40 dark:hover:to-amber-900/40 transition-all duration-300 group/item border border-transparent hover:border-orange-100 dark:hover:border-orange-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover/item:bg-orange-600 group-hover/item:text-white dark:bg-orange-900/50 dark:text-orange-400">
                      <Rocket className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-foreground mb-0.5">
                        GTM Resources
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-snug">
                        Guides & playbooks
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/pricing"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </Link>

          {/* Enterprise Dropdown */}
          <div className="group relative h-full flex items-center">
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
              Enterprise
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-300 ease-out z-60">
              <div className="w-[180px] mt-2 overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-2xl shadow-purple-500/20 dark:bg-slate-950 ring-1 ring-black/5">
                <div className="flex flex-col gap-1">
                  <Link
                    href="/enterprise/manufacturing"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-linear-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-300 group/item border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover/item:bg-blue-600 group-hover/item:text-white dark:bg-blue-900/50 dark:text-blue-400">
                      <Factory className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      Manufacturing
                    </div>
                  </Link>

                  <Link
                    href="/enterprise/logistics"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-linear-to-br hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 transition-all duration-300 group/item border border-transparent hover:border-purple-100 dark:hover:border-purple-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600 transition-colors group-hover/item:bg-purple-600 group-hover/item:text-white dark:bg-purple-900/50 dark:text-purple-400">
                      <Truck className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      Logistics
                    </div>
                  </Link>

                  <Link
                    href="/enterprise/insurance"
                    className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-linear-to-br hover:from-orange-50 hover:to-red-50 dark:hover:from-orange-900/40 dark:hover:to-red-900/40 transition-all duration-300 group/item border border-transparent hover:border-orange-100 dark:hover:border-orange-800"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600 transition-colors group-hover/item:bg-orange-600 group-hover/item:text-white dark:bg-orange-900/50 dark:text-orange-400">
                      <Shield className="h-4.5 w-4.5" />
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      Insurance
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Partners Dropdown */}
          <div className="group relative h-full flex items-center">
            <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors outline-none">
              Partners
              <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
            </button>

            <div className="invisible opacity-0 translate-y-2 group-hover:visible group-hover:opacity-100 group-hover:translate-y-0 absolute top-full right-0 pt-4 transition-all duration-300 ease-out z-[60]">
              <div className="w-[300px] overflow-hidden rounded-2xl border border-border bg-white p-3 shadow-2xl shadow-purple-500/20 dark:bg-slate-950 ring-1 ring-black/5">
                <div className="flex flex-col gap-1">
                  <Link
                    href="/affiliate-program"
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/40 dark:hover:to-indigo-900/40 transition-all duration-300 group/item border border-transparent hover:border-blue-100 dark:hover:border-blue-800"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 transition-colors group-hover/item:bg-blue-600 group-hover/item:text-white dark:bg-blue-900/50 dark:text-blue-400">
                      <Handshake className="h-5 w-5" />
                    </div>
                    <div className="text-sm font-bold text-foreground">
                      Affiliate program
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Login
          </Link>
          <Link
            href="/login"
            className="rounded-full bg-foreground px-4 py-1.5 text-sm font-bold text-background transition-transform hover:scale-105 active:scale-95"
          >
            Start for free
          </Link>
        </div>
      </div>
    </nav>
  );
}
