export default function ManufacturingHowItWorks() {
  const steps = [
    {
      id: "01",
      title: "Capture",
      desc: "Install our pixel to identify the companies and people browsing your website in real-time.",
      active: false,
    },
    {
      id: "02",
      title: "Score",
      desc: "AI-driven scoring prioritizes leads based on page views, dwell time, and firmographic fit.",
      active: false,
    },
    {
      id: "03",
      title: "Enrich",
      desc: "Match data points including direct dials and LinkedIn URLs for key decision makers.",
      active: false,
    },
    {
      id: "04",
      title: "Engage",
      desc: "Sync qualified leads to your CRM or launch multi-channel automated campaigns immediately.",
      active: true,
    },
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-4">
            How LeadGenius Works
          </h2>
          <p className="text-lg text-muted-foreground">
            Turn cold traffic into warm conversations in four automated steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`p-8 rounded-3xl border transition-all duration-300 ${
                step.active
                  ? "bg-blue-600 border-blue-600 text-white shadow-xl shadow-blue-500/20"
                  : "bg-card border-border hover:border-blue-200 dark:hover:border-blue-800 hover:shadow-lg"
              }`}
            >
              <div
                className={`text-4xl font-bold mb-6 ${
                  step.active
                    ? "text-blue-200"
                    : "text-slate-200 dark:text-slate-800"
                }`}
              >
                {step.id}
              </div>
              <h3
                className={`text-xl font-bold mb-3 ${
                  step.active ? "text-white" : "text-foreground"
                }`}
              >
                {step.title}
              </h3>
              <p
                className={`text-sm leading-relaxed ${
                  step.active ? "text-blue-50" : "text-muted-foreground"
                }`}
              >
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
