import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BarChart3, Calendar } from "lucide-react";

export default function ManufacturingHero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Text Content */}
          <div className="max-w-2xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-8 rounded-full bg-blue-50 border border-blue-100 dark:bg-blue-900/20 dark:border-blue-800">
              <span className="text-[11px] font-bold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                Enterprise Manufacturing Edition
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6 leading-tight">
              Enterprise <br /> Manufacturing <br />
              <span className="text-blue-600">Sales & Operations</span> <br />
              Platform
            </h1>

            {/* Subtitle */}
            <p className="text-base text-muted-foreground leading-relaxed mb-10">
              Track visits, manage distributors, automate follow-ups, and
              convert manufacturing leads faster with AI-driven workflows
              designed for scale.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
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
                View Features
              </Link>
            </div>
          </div>

          {/* Right Column: Dashboard Visual */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl bg-card">
              <Image
                src="/assets/enterprise_dashboard.png"
                alt="Manufacturing Dashboard"
                width={800}
                height={600}
                className="w-full h-auto object-cover"
                priority
              />
            </div>

            {/* Floating Elements mimicking the design */}
            <div className="absolute -top-6 -right-6 z-20 hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 shadow-xl border border-border px-4 py-2 rounded-xl animate-bounce-slow">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground font-semibold">
                  Intent Score
                </div>
                <div className="text-lg font-bold text-foreground">92</div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 z-20 hidden md:flex items-center gap-3 bg-white dark:bg-slate-900 shadow-xl border border-border px-4 py-3 rounded-xl">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-foreground">
                  Meeting Booked
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Precision Parts Corp • 2:00 PM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
