import maplibregl, { type Map } from "maplibre-gl";
import type { Detection } from "@/lib/api";

export function addDroneLayer(map: Map, detections: Detection[]) {
  const data: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: detections.map((d) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [d.lng, d.lat] },
      properties: { detection_type: d.detection_type, confidence: d.confidence },
    })),
  };

  map.addSource("drone", { type: "geojson", data });

  // Circle radius driven by confidence (0–1 → 4–12 px)
  map.addLayer({
    id: "drone-points",
    type: "circle",
    source: "drone",
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["get", "confidence"], 0, 4, 1, 12],
      "circle-color": [
        "match",
        ["get", "detection_type"],
        "larvae_confirmed",
        "#ef4444",
        "water_body",
        "#f59e0b",
        "#6b7280",
      ],
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.5,
      "circle-opacity": 0.9,
    },
  });

  map.on("click", "drone-points", (e) => {
    if (!e.features?.length) return;
    const props = e.features[0].properties as Record<string, unknown>;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<strong>${props.detection_type as string}</strong><br/>
         Confidence: ${((props.confidence as number) * 100).toFixed(1)}%`
      )
      .addTo(map);
  });

  map.on("mouseenter", "drone-points", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "drone-points", () => {
    map.getCanvas().style.cursor = "";
  });
}
