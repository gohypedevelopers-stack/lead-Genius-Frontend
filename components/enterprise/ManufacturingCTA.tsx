import Link from "next/link";

export default function ManufacturingCTA() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-linear-to-r from-blue-600 to-purple-600 px-6 py-20 text-center shadow-2xl sm:px-12 sm:py-28">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-cover" />

          <div className="relative z-10 max-w-4xl mx-auto">
            <h2 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl mb-6 leading-tight">
              Ready to accelerate your <br className="hidden sm:block" />
              manufacturing growth?
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-blue-100 mb-10 leading-relaxed">
              Join hundreds of global manufacturers who use LeadGenius to scale
              their operations and close more deals with AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/demo"
                className="h-12 px-8 rounded-xl bg-white text-blue-600 hover:bg-blue-50 text-sm font-bold transition-all flex items-center justify-center shadow-xl shadow-blue-900/20 hover:-translate-y-0.5"
              >
                Schedule Your Demo
              </Link>

              <Link
                href="/contact"
                className="h-12 px-8 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-sm font-bold transition-all flex items-center justify-center backdrop-blur-sm"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
