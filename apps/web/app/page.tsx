import { Nav } from "@/components/landing/Nav";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Solution } from "@/components/landing/Solution";
import { Process } from "@/components/landing/Process";
import { Technology } from "@/components/landing/Technology";
import { Impact } from "@/components/landing/Impact";
import { Team } from "@/components/landing/Team";
import { Roadmap } from "@/components/landing/Roadmap";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Problem />
        <Solution />
        <Process />
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
