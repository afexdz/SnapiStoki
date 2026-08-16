import { createClient } from "@/lib/supabase/server";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import TopFreelancers from "@/components/TopFreelancers";
import Marketplace from "@/components/Marketplace";
import HowItWorks from "@/components/HowItWorks";
import GetStarted from "@/components/GetStarted";
import Footer from "@/components/Footer";

export default async function Home() {
  let servicesCount = 0;
  let profilesCount = 0;

  try {
    const supabase = await createClient();
    const [{ count: sc }, { count: pc }] = await Promise.all([
      supabase.from("services").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
    ]);
    servicesCount = sc ?? 0;
    profilesCount = pc ?? 0;
  } catch {
    // fallback to 0 counts
  }

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero servicesCount={servicesCount} profilesCount={profilesCount} />
        <Categories />
        <TopFreelancers />
        <Marketplace />
        <HowItWorks />
        <GetStarted />
      </main>
      <Footer />
    </>
  );
}
