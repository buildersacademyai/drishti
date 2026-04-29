import { Nav } from "@/components/Nav";
import { Hero } from "@/components/Hero";
import { Problem } from "@/components/Problem";
import { Solution } from "@/components/Solution";
import { Technology } from "@/components/Technology";
import { Impact } from "@/components/Impact";
import { Team } from "@/components/Team";
import { Roadmap } from "@/components/Roadmap";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Technology />
        <Impact />
        <Team />
        <Roadmap />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
