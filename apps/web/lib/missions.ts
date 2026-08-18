export type PipelineStep = {
  icon: string;
  title: string;
  desc: string;
};

export type Metric = {
  value: string;
  label: string;
};

export type Mission = {
  slug: string;
  icon: string;
  title: string;
  status: "active" | "vision";
  tagline: string;
  summary: string;
  pipeline: PipelineStep[];
  phaseLabels?: { label: string; sub: string; color: string }[];
  metrics?: Metric[];
};

export const missions: Mission[] = [
  {
    slug: "disease-control",
    icon: "🔬",
    title: "Disease Control",
    status: "active",
    tagline:
      "Satellite screens for standing water, drones confirm breeding sites, precision spray response.",
    summary:
      "Our most mature, furthest-along implementation. Nepal's Terai districts carry the highest malaria and dengue burden in the country, and manual surveillance takes 2–4 weeks to find a breeding site — by which point an outbreak is already underway. Drishti closes that gap: satellite screening flags candidate water bodies weekly at zero marginal cost, autonomous drones verify only the flagged zones, and confirmed sites get a precision larvicide response — all with a full georeferenced audit trail from pixel to intervention.",
    pipeline: [
      {
        icon: "🌍",
        title: "Sentinel-2 acquisition",
        desc: "ESA Copernicus satellite passes over target districts weekly. Cloud-masked Sentinel-2 L2A tiles are ingested automatically via Google Earth Engine at zero cost.",
      },
      {
        icon: "📡",
        title: "NDWI water detection",
        desc: "Normalized Difference Water Index isolates standing water. Week-over-week change detection flags new or growing water bodies. Permanent rivers and reservoirs are excluded via historical mask.",
      },
      {
        icon: "🗺️",
        title: "Mission planning",
        desc: "Flagged candidate zones are ranked by area, proximity to settlements, and historical case burden. Top N zones are queued for drone validation. Operator approves the mission in ~15 minutes.",
      },
      {
        icon: "🚁",
        title: "Survey drone flight",
        desc: "Autonomous drone flies only to flagged zones at 30m altitude, capturing 5–10cm GSD imagery. YOLOv8 detects standing water, containers, blocked drains, and tire piles across the full zone.",
      },
      {
        icon: "🔬",
        title: "Nano-shot confirmation",
        desc: "For each high-confidence water surface, the drone descends to 2–5m. EfficientNet-B0 classifier analyzes macro close-ups for larval signatures — turbidity, organic film, container type, visible larvae.",
      },
      {
        icon: "💧",
        title: "Intervention dispatch",
        desc: "larvae_confirmed detections trigger an intervention mission. Drone returns to base — camera payload swapped for larvicide tank in <5 minutes. Precision spray applied at exact confirmed coordinates.",
      },
      {
        icon: "📊",
        title: "Risk prediction",
        desc: "XGBoost model fuses satellite trends, confirmed habitat density, IoT sensor readings, and historical case data to generate ward-level outbreak risk scores 4–6 weeks ahead.",
      },
      {
        icon: "✅",
        title: "Closed-loop audit",
        desc: "Every intervention traces back through detection → flight → mission → satellite pixel. Full georeferenced audit trail with timestamp. FCHVs receive alerts in Nepali. Risk scores updated.",
      },
    ],
    phaseLabels: [
      { label: "VERIFY", sub: "Steps 1–3 · Satellite", color: "text-[#0284c7]" },
      { label: "VALIDATE", sub: "Steps 4–5 · Drone", color: "text-[#475569]" },
      { label: "EXECUTE", sub: "Steps 6–8 · Intervention + Predict", color: "text-[#059669]" },
    ],
    metrics: [
      { value: "72h", label: "End-to-end cycle vs. 2–4 weeks manually" },
      { value: "70–80%", label: "Reduction in drone flight hours vs. blanket survey" },
      { value: "60–80%", label: "Less larvicide use vs. blanket spraying" },
      { value: "4–6 weeks", label: "Outbreak prediction horizon" },
    ],
  },
  {
    slug: "fire-control",
    icon: "🔥",
    title: "Fire Control",
    status: "vision",
    tagline:
      "Satellite thermal anomalies flag ignition risk, drones verify spread, retardant response.",
    summary:
      "Not yet built — this is roadmap vision, not a shipping capability. The same satellite-to-drone architecture powering Disease Control is designed to extend here: satellite thermal-anomaly detection would flag ignition risk across a district, autonomous drones would verify fire spread and perimeter at close range, and a retardant-payload response could target the confirmed fire line directly instead of blanket aerial drops.",
    pipeline: [
      {
        icon: "🌍",
        title: "Thermal anomaly screening",
        desc: "Satellite thermal bands scan target regions for heat signatures consistent with ignition, flagging candidate zones for verification.",
      },
      {
        icon: "🚁",
        title: "Drone spread verification",
        desc: "Autonomous drones fly to flagged coordinates to confirm active fire, assess spread direction, and map the current perimeter at close range.",
      },
      {
        icon: "🧯",
        title: "Retardant response",
        desc: "Confirmed fire lines trigger a response mission — payload swapped for retardant, targeting the verified perimeter rather than a blanket drop zone.",
      },
    ],
  },
  {
    slug: "animal-surveillance",
    icon: "🐾",
    title: "Animal Surveillance",
    status: "vision",
    tagline:
      "Satellite habitat change detection, drones track and count wildlife, anti-poaching response.",
    summary:
      "Not yet built — this is roadmap vision, not a shipping capability. The concept: satellite imagery would detect habitat change (deforestation, encroachment, water-source shifts) across a protected area, drones would verify and count wildlife presence in flagged zones, and confirmed anti-poaching risk would route directly to ranger response teams with exact coordinates.",
    pipeline: [
      {
        icon: "🌍",
        title: "Habitat change detection",
        desc: "Satellite imagery flags change in vegetation cover, water sources, or human encroachment patterns within a protected area.",
      },
      {
        icon: "🚁",
        title: "Wildlife tracking & count",
        desc: "Drones survey flagged zones to track and count wildlife presence, and to identify signs of poaching activity.",
      },
      {
        icon: "🛡️",
        title: "Anti-poaching response",
        desc: "Confirmed risk zones are routed to ranger teams with exact coordinates for a targeted, rather than area-wide, patrol response.",
      },
    ],
  },
  {
    slug: "flood-monitoring",
    icon: "🌊",
    title: "Flood Monitoring",
    status: "vision",
    tagline:
      "Satellite water-level trends flag rising risk, drones verify inundation, evacuation alerts.",
    summary:
      "Not yet built — this is roadmap vision, not a shipping capability. The concept: satellite water-level trend analysis would flag rising flood risk across river systems and low-lying districts, drones would verify actual inundation extent at flagged sites, and confirmed risk would trigger targeted evacuation alerts to the specific communities in the water's path.",
    pipeline: [
      {
        icon: "🌍",
        title: "Water-level trend screening",
        desc: "Satellite imagery tracks water-level trends across river systems and low-lying districts, flagging zones with rising flood risk.",
      },
      {
        icon: "🚁",
        title: "Inundation verification",
        desc: "Drones fly to flagged zones to verify actual inundation extent and map the current water boundary at ground truth resolution.",
      },
      {
        icon: "📢",
        title: "Evacuation alerts",
        desc: "Confirmed flood extent triggers targeted evacuation alerts to the specific communities in the water's path, not a district-wide broadcast.",
      },
    ],
  },
  {
    slug: "emergency-delivery",
    icon: "📦",
    title: "Emergency Delivery",
    status: "vision",
    tagline:
      "Satellite routing around hazards, drones verify landing zones, autonomous supply drop.",
    summary:
      "Not yet built — this is roadmap vision, not a shipping capability. The concept: satellite imagery would plan delivery routing around active hazards (flooding, fire, terrain damage), drones would verify a safe landing or drop zone at the destination, and the same autonomous airframe would complete a supply drop — medical kits, food, or emergency equipment — without waiting for ground access to clear.",
    pipeline: [
      {
        icon: "🌍",
        title: "Hazard-aware routing",
        desc: "Satellite imagery identifies active hazards along the direct path to a destination, and plans a route around them.",
      },
      {
        icon: "🚁",
        title: "Landing zone verification",
        desc: "Drone flies the planned route and verifies a safe landing or drop zone at the destination before committing to delivery.",
      },
      {
        icon: "📦",
        title: "Autonomous supply drop",
        desc: "Confirmed safe zone triggers the supply drop — medical kits, food, or emergency equipment — without waiting for ground access to clear.",
      },
    ],
  },
];

export function getMission(slug: string): Mission | undefined {
  return missions.find((m) => m.slug === slug);
}
