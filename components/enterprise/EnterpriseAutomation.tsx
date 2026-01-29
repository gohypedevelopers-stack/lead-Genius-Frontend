import { Globe, UserCheck, Mail, Calendar } from "lucide-react";

export default function EnterpriseAutomation() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
            Seamless End-to-End Automation
          </h2>
        </div>

        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-[28%] left-[12%] right-[12%] h-0.5 bg-border -z-10" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <AutomationCard
              step="01"
              icon={<Globe className="w-6 h-6 text-blue-600" />}
              title="Capture"
              desc="Lead capture from verified sources."
            />

            <AutomationCard
              step="02"
              icon={<UserCheck className="w-6 h-6 text-blue-600" />}
              title="Score & Assign"
              desc="Prioritizing best fit accounts to sales."
            />

            <AutomationCard
              step="03"
              icon={<Mail className="w-6 h-6 text-blue-600" />}
              title="Engage"
              desc="Automated personalized Email sequences."
            />

            <ConversionCard
              step="04"
              icon={<Calendar className="w-6 h-6 text-white" />}
              title="Conversion"
              desc="Meaningful conversations & deal closing cycle starts."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function AutomationCard({
  step,
  icon,
  title,
  desc,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-card border border-border rounded-3xl p-8 text-center shadow-lg shadow-black/5 flex flex-col items-center hover:-translate-y-1 transition-transform duration-300">
      <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 mb-6 flex items-center justify-center">
        {icon}
      </div>
      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
        Step {step}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function ConversionCard({
  step,
  icon,
  title,
  desc,
}: {
  step: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="bg-blue-600 rounded-3xl p-8 text-center shadow-xl shadow-blue-600/30 flex flex-col items-center hover:-translate-y-1 transition-transform duration-300 transform scale-105">
      <div className="w-14 h-14 rounded-2xl bg-white/20 mb-6 flex items-center justify-center backdrop-blur-sm">
        {icon}
      </div>
      <div className="text-xs font-bold text-blue-100 uppercase tracking-widest mb-1">
        Step {step}
      </div>
      <h3 className="text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-sm text-blue-100 leading-relaxed">{desc}</p>
    </div>
  );
}
