import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { missions, getMission } from "@/lib/missions";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";
import { MissionDetail } from "./MissionDetail";

export function generateStaticParams() {
  return missions.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const mission = getMission(params.slug);
  if (!mission) return { title: "Mission not found — Drishti" };
  return {
    title: `${mission.title} — Drishti`,
    description: mission.tagline,
    openGraph: {
      title: `${mission.title} — Drishti`,
      description: mission.tagline,
      images: ["/logo.png"],
    },
  };
}

export default function MissionPage({ params }: { params: { slug: string } }) {
  const mission = getMission(params.slug);
  if (!mission) notFound();

  return (
    <>
      <Nav />
      <main className="pt-32">
        <MissionDetail mission={mission} />
      </main>
      <Footer />
    </>
  );
}
