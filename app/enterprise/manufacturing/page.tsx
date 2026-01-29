import LandingNavbar from "@/components/LandingNavbar";
import Footer from "@/components/Footer";
import ManufacturingHero from "@/components/enterprise/ManufacturingHero";
import ManufacturingFeatures from "@/components/enterprise/ManufacturingFeatures";
import ManufacturingHowItWorks from "@/components/enterprise/ManufacturingHowItWorks";
import ManufacturingChallenges from "@/components/enterprise/ManufacturingChallenges";
import ManufacturingTools from "@/components/enterprise/ManufacturingTools";
import ManufacturingStats from "@/components/enterprise/ManufacturingStats";
import ManufacturingCTA from "@/components/enterprise/ManufacturingCTA";
import EnterpriseFeatures from "@/components/enterprise/EnterpriseFeatures";
import EnterpriseSolutions from "@/components/enterprise/EnterpriseSolutions";
import EnterpriseAutomation from "@/components/enterprise/EnterpriseAutomation";
import EnterpriseVerticals from "@/components/enterprise/EnterpriseVerticals";
import EnterpriseTools from "@/components/enterprise/EnterpriseTools";
import LogoCloud from "@/components/enterprise/LogoCloud";

export default function ManufacturingPage() {
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-blue-500/30">
      <LandingNavbar />

      <main>
        <ManufacturingHero />
        <ManufacturingFeatures />
        <ManufacturingHowItWorks />
        <ManufacturingChallenges />
        <ManufacturingTools />
        <ManufacturingStats />
        <EnterpriseAutomation />
        <ManufacturingCTA />
      </main>

      <Footer />
    </div>
  );
}
