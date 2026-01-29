import {
  Users,
  MapPin,
  LineChart,
  Layers,
  RefreshCw,
  Shield,
} from "lucide-react";

export default function ManufacturingTools() {
  const tools = [
    {
      icon: <Users className="w-6 h-6 text-orange-600" />,
      title: "Distributor Management",
      desc: "Assign and track leads across regional dealers and distributors effortlessly.",
      badge: "ENTERPRISE",
      badgeColor:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    {
      icon: <MapPin className="w-6 h-6 text-purple-600" />,
      title: "Field Sales Tracking",
      desc: "Log visit reports and sync notes to CRM directly from the manufacturing floor.",
      badge: "AI POWERED",
      badgeColor:
        "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
    },
    {
      icon: <LineChart className="w-6 h-6 text-blue-600" />,
      title: "Competitive Intelligence",
      desc: "See which competitors your prospects are researching alongside your products.",
      badge: "PREMIUM",
      badgeColor:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    },
    {
      icon: <Layers className="w-6 h-6 text-orange-600" />,
      title: "SKU-Level Targeting",
      desc: "Identify interest down to specific part numbers or product categories.",
      badge: "ENTERPRISE",
      badgeColor:
        "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
    },
    {
      icon: <RefreshCw className="w-6 h-6 text-green-600" />,
      title: "ERP Integration",
      desc: "Connect your sales data with backend production and inventory systems.",
      badge: "AI POWERED",
      badgeColor:
        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    },
    {
      icon: <Shield className="w-6 h-6 text-red-600" />,
      title: "Global Compliance",
      desc: "GDPR, SOC2 Type II, and local privacy regulation compliance built-in.",
      badge: "SECURITY",
      badgeColor:
        "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">
            Built for Manufacturing Scale
          </h2>
          <p className="text-lg text-muted-foreground">
            Enterprise-grade tools for global operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-card border border-border p-8 rounded-3xl hover:shadow-lg transition-shadow duration-300 relative group"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10 transition-colors duration-300">
                  {tool.icon}
                </div>
                {tool.badge && (
                  <span
                    className={`${tool.badgeColor} text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider`}
                  >
                    {tool.badge}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                {tool.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {tool.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
