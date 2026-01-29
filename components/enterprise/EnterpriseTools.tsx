import {
  FileText,
  GitFork,
  Globe,
  Layers,
  Gauge,
  ShieldCheck,
} from "lucide-react";

export default function EnterpriseTools() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">
            Enterprise-Grade Logistics Tools
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ToolCard
            icon={<FileText className="w-6 h-6" />}
            title="RFQ & Quote Automation"
            desc="Turn unstructured email RFQs into structured quotes using AI parsing and automated routing."
          />

          <ToolCard
            icon={<GitFork className="w-6 h-6" />}
            title="Route-Based Lead Routing"
            desc="Route leads to import managers based on ports of lading expertise and geographical territory."
            badge="AI POWERED"
          />

          <ToolCard
            icon={<Globe className="w-6 h-6" />}
            title="Global Lane Intelligence"
            desc="Analyze market trends and shipper behavior across 500+ global trade lanes in real-time."
          />

          <ToolCard
            icon={<Layers className="w-6 h-6" />}
            title="3PL Integration Suite"
            desc="Native connectors for major Warehouse and Transportation Management Systems like Oracle and SAP."
          />

          <ToolCard
            icon={<Gauge className="w-6 h-6" />}
            title="Priority Sales Coaching"
            desc="In-app coaching for logistics sales reps during high-stakes negotiations to maximize margins."
          />

          <ToolCard
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Data Security & Compliance"
            desc="SOC2 Type II compliant platform designed specifically for global logistics giants and armies."
          />
        </div>
      </div>
    </section>
  );
}

function ToolCard({
  icon,
  title,
  desc,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  badge?: string;
}) {
  return (
    <div className="bg-card border border-border p-8 rounded-3xl hover:shadow-lg transition-shadow duration-300 relative group">
      <div className="flex justify-between items-start mb-6">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
          {icon}
        </div>
        {badge && (
          <span className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
            {badge}
          </span>
        )}
      </div>

      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
