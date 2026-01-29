import Image from "next/image";
import { TrendingUp, Users } from "lucide-react";

export default function EnterpriseVerticals() {
  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          {/* Left Column (Sticky) */}
          <div className="lg:col-span-1 lg:sticky lg:top-32 h-fit">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl mb-6">
              Tailored for Every <br />
              <span className="text-blue-600">Logistics Vertical</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
              Our intelligence layer adapts to the specific needs of each
              sector, ensuring the most relevant data is captured for every
              shipment type.
            </p>

            <div className="flex items-center gap-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 px-6 py-4 rounded-2xl border border-blue-100 dark:border-blue-800 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  +60%
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Booking Speed
                </div>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 px-6 py-4 rounded-2xl border border-purple-100 dark:border-purple-800 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                  2x
                </div>
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Qualified Leads
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Scrollable Cards) */}
          <div className="lg:col-span-2 pl-40 flex flex-col items-start space-y-24">
            <VerticalCard
              imageSrc="/assets/vertical_freight.png"
              title="Freight Forwarders"
              desc="Scale ocean and air freight bookings with automated RFQ follow-ups that never sleep."
            />
            <VerticalCard
              imageSrc="/assets/vertical_3pl.png"
              title="3PL Providers"
              desc="Bridge the gap between warehousing and distribution sales teams with unified data."
            />
            <VerticalCard
              imageSrc="/assets/vertical_courier.png"
              title="Courier & Last-Mile"
              desc="Capture and convert hyper-local delivery inquiries instantly for peak season scaling."
            />
            <VerticalCard
              imageSrc="/assets/vertical_warehouse.png"
              title="Warehousing"
              desc="Maximize storage utilization by identifying shippers in need of space before they look elsewhere."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function VerticalCard({
  imageSrc,
  title,
  desc,
}: {
  imageSrc: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="group w-full max-w-[400px] rounded-3xl overflow-hidden border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="h-48 relative overflow-hidden bg-muted/20">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="p-8">
        <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
        <p className="text-base text-muted-foreground leading-relaxed">
          {desc}
        </p>
      </div>
    </div>
  );
}
