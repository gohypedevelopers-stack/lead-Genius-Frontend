import { Share2, Database, Box, BarChart, Cloud } from "lucide-react";

export default function ManufacturingStats() {
  return (
    <section>
      {/* Integrations Section */}
      <div className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">
              Integrates with your tech stack
            </h3>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Using Lucide icons as placeholders for generic tech logos */}
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <Database className="w-8 h-8 text-gray-500" />
            </div>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <Box className="w-8 h-8 text-gray-500" />
            </div>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <Cloud className="w-8 h-8 text-gray-500" />
            </div>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <Share2 className="w-8 h-8 text-gray-500" />
            </div>
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
              <BarChart className="w-8 h-8 text-gray-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-24 bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="flex flex-col items-center p-4">
              <div className="text-5xl font-extrabold text-blue-500 mb-2">
                +50%
              </div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Qualified Leads
              </div>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="text-5xl font-extrabold text-purple-500 mb-2">
                2x
              </div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Meeting Conversion
              </div>
            </div>

            <div className="flex flex-col items-center p-4">
              <div className="text-5xl font-extrabold text-orange-500 mb-2">
                -35%
              </div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                Sales Cycle Duration
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
