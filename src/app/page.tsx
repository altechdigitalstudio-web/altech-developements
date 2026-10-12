import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Hero } from "@/components/home/Hero";
import { Features, FinalCta, HowItWorks, Marquee, Testimonials, TypesShowcase } from "@/components/home/Sections";
import { LiveAnalytics } from "@/components/home/LiveAnalytics";
import { Pricing } from "@/components/home/Pricing";
import { Faq } from "@/components/home/Faq";
import { getCurrentUser } from "@/lib/auth";
import { getPublicStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, stats] = await Promise.all([getCurrentUser(), getPublicStats()]);

  return (
    <>
      <SiteHeader user={user ? { name: user.name, email: user.email } : null} />
      <main>
        <Hero stats={stats} />
        <Marquee />
        <TypesShowcase />
        <Features />
        <LiveAnalytics />
        <HowItWorks />
        <Pricing />
        <Testimonials />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
