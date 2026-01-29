import { BarChart3, List, Send, Asterisk } from "lucide-react";

export default function ManufacturingFeatures() {
  const features = [
    {
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      title: "Intent Scoring",
      desc: "Identify prospects visiting your site and score them based on high-intent actions.",
    },
    {
      icon: <List className="w-6 h-6 text-purple-600" />,
      bg: "bg-purple-50 dark:bg-purple-900/20",
      title: "Auto-Enrichment",
      desc: "Automatically find verified emails and LinkedIn profiles for every anonymous visitor.",
    },
    {
      icon: <Send className="w-6 h-6 text-pink-600" />,
      bg: "bg-pink-50 dark:bg-pink-900/20",
      title: "Smart Sequences",
      desc: "Trigger multi-step sequences across email and LinkedIn based on real-time behavior.",
    },
    {
      icon: <Asterisk className="w-6 h-6 text-orange-600" />,
      bg: "bg-orange-50 dark:bg-orange-900/20",
      title: "Enterprise Outreach",
      desc: "Coordinate sales efforts across global manufacturing territories and distributors.",
    },
  ];

  return (
    <section className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border border-border p-8 rounded-3xl hover:shadow-lg transition-shadow duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center mb-6`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
