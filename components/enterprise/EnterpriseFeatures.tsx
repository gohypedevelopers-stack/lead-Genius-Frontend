import Image from "next/image";
import { CheckCircle2, Zap, BarChart3, Send } from "lucide-react";

export default function EnterpriseFeatures() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Visual Dashboard */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

            {/* Image Container (Overflow Hidden for rounded corners) */}
            <div className="relative rounded-xl overflow-hidden border border-border shadow-2xl bg-card">
              <Image
                src="/assets/enterprise_dashboard.png"
                alt="Enterprise Dashboard"
                width={700}
                height={500}
                className="w-full h-auto"
              />
            </div>

            {/* Floating Badge 1 (Top Left Overlap) - NOW OUTSIDE overflow-hidden */}
            <div className="absolute -top-6 -left-6 z-20 flex items-center gap-3 bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-gray-800 px-5 py-3 rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Action Needed
                </div>
                <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                  High R/P Surge
                </div>
              </div>
            </div>

            {/* Floating Badge 2 (Bottom Right Overlap) - NOW OUTSIDE overflow-hidden */}
            <div className="absolute -bottom-6 -right-6 z-20 flex items-center gap-4 bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-gray-800 px-6 py-4 rounded-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <BarChart3 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
                  Lead Score
                </div>
                <div className="text-base font-bold text-gray-900 dark:text-gray-100">
                  High Intent Level: 92
                </div>
              </div>
            </div>
          </div>

          {/* Right: Features List */}
          <div className="space-y-12">
            {/* Item 1 */}
            <div className="relative pl-8 border-l-2 border-blue-600">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-600 ring-4 ring-blue-100 dark:ring-blue-900/30" />
              <h3 className="text-2xl font-bold text-foreground mb-3">
                Intent Scoring
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Identify shippers visiting your site and score them based on
                cargo volume intent before they even speak to sales.
              </p>
            </div>

            {/* Item 2 */}
            <div className="relative pl-8 border-l-2 border-border hover:border-blue-600/50 transition-colors group cursor-pointer">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-border group-hover:bg-blue-400 ring-4 ring-transparent transition-all" />
              <h3 className="text-2xl font-bold text-muted-foreground group-hover:text-foreground transition-colors mb-2">
                Auto-Enrichment
              </h3>
              <p className="text-muted-foreground/60 group-hover:text-muted-foreground text-sm transition-colors">
                Automatically find verified logistics decision makers from
                anonymous visits and build a complete profile instantly.
              </p>
            </div>

            {/* Item 3 */}
            <div className="relative pl-8 border-l-2 border-border hover:border-blue-600/50 transition-colors group cursor-pointer">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-border group-hover:bg-blue-400 ring-4 ring-transparent transition-all" />
              <h3 className="text-2xl font-bold text-muted-foreground group-hover:text-foreground transition-colors mb-2">
                Smart Outreach
              </h3>
              <p className="text-muted-foreground/60 group-hover:text-muted-foreground text-sm transition-colors">
                Trigger personalized email sequences to key stakeholders
                immediately when intent signals are detected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
