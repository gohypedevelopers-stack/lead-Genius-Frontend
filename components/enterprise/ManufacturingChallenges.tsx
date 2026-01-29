import { X, Check, AlertTriangle } from "lucide-react";

export default function ManufacturingChallenges() {
  const challenges = [
    "Fragmented data across global distributor networks.",
    "Zero visibility into which prospects are researching parts.",
    "Slow follow-up times leading to lost contracts.",
    "Manual data entry for thousands of SKUs and leads.",
  ];

  const solutions = [
    "Unified dashboard for corporate and dealer channels.",
    "Real-time intent data captured at the SKU level.",
    "Instant AI-driven sequences for new prospects.",
    "Automated CRM sync with Microsoft Dynamics & Salesforce.",
  ];

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Challenges Card */}
          <div className="p-10 rounded-3xl border border-orange-200 bg-orange-50/50 dark:bg-orange-900/10 dark:border-orange-900/50">
            <div className="flex items-center gap-3 mb-8">
              <AlertTriangle className="w-6 h-6 text-orange-600 fill-orange-100 dark:fill-orange-900/20" />
              <h3 className="text-2xl font-bold text-foreground">
                The Challenges in Manufacturing
              </h3>
            </div>
            <div className="space-y-6">
              {challenges.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                    <X className="w-3 h-3" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Solutions Card */}
          <div className="p-10 rounded-3xl border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900/50 relative overflow-hidden">
            <div className="absolute top-6 right-6">
              <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider dark:bg-blue-900 dark:text-blue-300">
                The Solution
              </span>
            </div>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </div>
              <h3 className="text-2xl font-bold text-foreground">
                How LeadGenius Solves It
              </h3>
            </div>
            <div className="space-y-6">
              {solutions.map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="mt-1 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
