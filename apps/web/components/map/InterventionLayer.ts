import maplibregl, { type Map } from "maplibre-gl";
import type { Intervention } from "@/lib/api";

const STATUS_COLOR: Record<string, string> = {
  planned: "#a78bfa",
  in_progress: "#f59e0b",
  completed: "#22c55e",
  cancelled: "#9ca3af",
};

export function addInterventionLayer(map: Map, interventions: Intervention[]) {
  const data: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: interventions.map((i) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [i.lng, i.lat] },
      properties: { status: i.status, area_sqm: i.area_sqm },
    })),
  };

  map.addSource("intervention", { type: "geojson", data });

  map.addLayer({
    id: "intervention-points",
    type: "circle",
    source: "intervention",
    paint: {
      "circle-radius": 10,
      "circle-color": [
        "match",
        ["get", "status"],
        "planned", STATUS_COLOR.planned,
        "in_progress", STATUS_COLOR.in_progress,
        "completed", STATUS_COLOR.completed,
        STATUS_COLOR.cancelled,
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 2,
      "circle-opacity": 0.85,
    },
  });

  map.on("click", "intervention-points", (e) => {
    if (!e.features?.length) return;
    const props = e.features[0].properties as Record<string, unknown>;
    const area = props.area_sqm ? `${props.area_sqm as number} m²` : "—";
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<strong>Intervention</strong><br/>
         Status: ${props.status as string}<br/>
         Area: ${area}`
      )
      .addTo(map);
  });

  map.on("mouseenter", "intervention-points", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "intervention-points", () => {
    map.getCanvas().style.cursor = "";
  });
}
