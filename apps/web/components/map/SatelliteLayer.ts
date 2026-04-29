import maplibregl, { type Map } from "maplibre-gl";

export function addSatelliteLayer(
  map: Map,
  data: GeoJSON.FeatureCollection
) {
  map.addSource("satellite", { type: "geojson", data });

  // Water-risk polygons — filled + outline
  map.addLayer({
    id: "satellite-fill",
    type: "fill",
    source: "satellite",
    paint: {
      "fill-color": "#3b82f6",
      "fill-opacity": 0.25,
    },
  });

  map.addLayer({
    id: "satellite-outline",
    type: "line",
    source: "satellite",
    paint: {
      "line-color": "#1d4ed8",
      "line-width": 1.5,
    },
  });

  // Click popup
  map.on("click", "satellite-fill", (e) => {
    if (!e.features?.length) return;
    const props = e.features[0].properties as Record<string, unknown>;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(
        `<strong>Satellite water patch</strong><br/>
         NDWI: ${(props.ndwi_score as number | undefined)?.toFixed(3) ?? "—"}`
      )
      .addTo(map);
  });

  map.on("mouseenter", "satellite-fill", () => {
    map.getCanvas().style.cursor = "pointer";
  });
  map.on("mouseleave", "satellite-fill", () => {
    map.getCanvas().style.cursor = "";
  });
}
