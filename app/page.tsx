import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Categories from "@/components/Categories";
import TopFreelancers from "@/components/TopFreelancers";
import Marketplace from "@/components/Marketplace";
import HowItWorks from "@/components/HowItWorks";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Categories />
        <TopFreelancers />
        <Marketplace />
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
