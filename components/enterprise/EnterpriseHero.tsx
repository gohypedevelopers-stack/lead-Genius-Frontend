import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function EnterpriseHero() {
  return (
    <section className="relative px-6 pt-32 pb-20 overflow-hidden bg-background">
      {/* Optional Gradient Background Effect (subtle) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] -z-10" />

      <div className="mx-auto max-w-4xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-8 rounded-full bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
          <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
            Logistics Enterprise
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl md:text-7xl mb-6">
          Enterprise Logistics <br />
          <span className="text-blue-600">Growth Platform</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-10">
          Convert inbound shipping inquiries into customers, automate
          follow-ups, and help your sales team close logistics deals faster with
          AI-powered workflows.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/demo"
            className="h-12 px-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
          >
            Request a Demo
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="#features"
            className="h-12 px-8 rounded-lg border border-border bg-card hover:bg-muted/50 text-foreground text-sm font-semibold transition-all flex items-center justify-center hover:border-blue-200 dark:hover:border-blue-800"
          >
            Explore Logistics Features
          </Link>
        </div>
      </div>
    </section>
  );
}
