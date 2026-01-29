import { AlertTriangle, CheckCircle2 } from "lucide-react";

export default function EnterpriseSolutions() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">
            Bridging the Gap
          </h2>
          <p className="text-muted-foreground text-lg">
            From industry friction to automated efficiency
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden border border-border shadow-xl">
          {/* Left: Challenges */}
          <div className="bg-orange-50/50 dark:bg-orange-950/10 p-10 lg:p-16 border-b lg:border-b-0 lg:border-r border-border/60">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500 text-white shadow-lg shadow-orange-500/30">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                Challenges in Logistics
              </h3>
            </div>

            <div className="space-y-10">
              <ChallengeItem
                title="Missed RFQs"
                desc="High-value shipping inquiries lost in crowded inboxes, never reaching the right agent."
              />
              <ChallengeItem
                title="Slow Response Times"
                desc="Prospects choose competitors while your team manually quotes and processes data."
              />
              <ChallengeItem
                title="Fragmented Load Data"
                desc="Incomplete shipper profiles make personalization impossible and slow down the funnel."
              />
            </div>
          </div>

          {/* Right: Solutions */}
          <div className="bg-blue-50/50 dark:bg-blue-950/10 p-10 lg:p-16">
            <div className="flex items-center gap-3 mb-10">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                LeadGenius Solutions
              </h3>
            </div>

            <div className="space-y-10">
              <SolutionItem
                title="Automated Load Capture"
                desc="Every web visit from a logistics company is identified, logged, and routed instantly."
              />
              <SolutionItem
                title="Instant AI Quotes"
                desc="Automatically respond to inquiries with personalized rate estimates using your own logic."
              />
              <SolutionItem
                title="Rich Lane Data"
                desc="Identify which shipping lanes your prospects are most interested in for targeted outreach."
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ChallengeItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1.5 w-4 h-4 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
      </div>
      <div>
        <h4 className="text-base font-bold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function SolutionItem({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex gap-4">
      <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
        <CheckCircle2 className="w-3.5 h-3.5" />
      </div>
      <div>
        <h4 className="text-base font-bold text-foreground mb-1">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}
