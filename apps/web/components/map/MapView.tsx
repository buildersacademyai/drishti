"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Detection, Intervention } from "@/lib/api";
import type { SelectedDistrict } from "./DistrictPanel";
import { addDroneLayer } from "./DroneLayer";
import { addInterventionLayer } from "./InterventionLayer";

interface Props {
  satelliteGeoJSON: GeoJSON.FeatureCollection | null;
  detections: Detection[];
  interventions: Intervention[];
  riskDistricts?: Record<string, number>;
  onDetectionClick?: (detection: Detection) => void;
  onDistrictClick?: (district: SelectedDistrict) => void;
}

const CENTER: [number, number] = [84.124, 28.394];
const ZOOM = 6.5;
const NEPAL_BOUNDS: [[number, number], [number, number]] = [[79.8, 26.2], [88.3, 30.5]];

const DEFAULT_RISK: Record<string, number> = {
  CHITWAN: 0.87, KAILALI: 0.82, KANCHANPUR: 0.79, BARDIYA: 0.76, BANKE: 0.71,
  DANG: 0.65, SAPTARI: 0.62, SUNSARI: 0.58, MORANG: 0.55, JHAPA: 0.52,
  MAHOTTARI: 0.61, SARLAHI: 0.58, RAUTAHAT: 0.54, BARA: 0.50, PARSA: 0.48,
  RUPANDEHI: 0.45, NAWALPARASI: 0.43,
};

function riskColor(r: number): string {
  if (r >= 0.75) return "#ef4444";
  if (r >= 0.50) return "#f59e0b";
  if (r >= 0.25) return "#84cc16";
  return "#e2e8f0";
}

function districtFillExpression(risk: Record<string, number>) {
  const pairs: unknown[] = [];
  for (const [name, score] of Object.entries(risk)) pairs.push(name, riskColor(score));
  return ["match", ["get", "DISTRICT"], ...pairs, "#e2e8f0"] as unknown as maplibregl.ExpressionSpecification;
}

// Legend as a custom MapLibre control
class LegendControl implements maplibregl.IControl {
  private _container!: HTMLElement;

  onAdd(_map: maplibregl.Map) {
    this._container = document.createElement("div");
    this._container.className = "maplibregl-ctrl maplibregl-ctrl-group";
    this._container.style.cssText = "font-family:sans-serif;";

    const btn = document.createElement("button");
    btn.title = "Toggle legend";
    btn.style.cssText =
      "width:29px;height:29px;display:flex;align-items:center;justify-content:center;font-size:14px;cursor:pointer;background:white;border:none;";
    btn.textContent = "⬤";

    const panel = document.createElement("div");
    panel.style.cssText =
      "display:none;position:absolute;right:0;top:32px;background:white;border-radius:8px;" +
      "box-shadow:0 2px 8px rgba(0,0,0,.15);padding:12px 14px;min-width:200px;z-index:10;";

    const items = [
      { color: "#ef4444", label: "High risk (≥75%)" },
      { color: "#f59e0b", label: "Medium risk (50–74%)" },
      { color: "#84cc16", label: "Low risk (25–49%)" },
      { color: "#e2e8f0", label: "Negligible risk" },
      { color: "#3b82f6", label: "Satellite water patch" },
      { color: "#f97316", label: "Drone detection" },
      { color: "#22c55e", label: "Intervention site" },
    ];

    const title = document.createElement("div");
    title.style.cssText = "font-size:11px;font-weight:700;color:#0f172a;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;";
    title.textContent = "Legend";
    panel.appendChild(title);

    for (const item of items) {
      const row = document.createElement("div");
      row.style.cssText = "display:flex;align-items:center;gap:8px;margin-bottom:6px;";
      const dot = document.createElement("span");
      dot.style.cssText = `width:11px;height:11px;border-radius:2px;flex-shrink:0;background:${item.color};border:1px solid rgba(0,0,0,.1);`;
      const lbl = document.createElement("span");
      lbl.style.cssText = "font-size:11px;color:#64748b;";
      lbl.textContent = item.label;
      row.appendChild(dot);
      row.appendChild(lbl);
      panel.appendChild(row);
    }

    let open = false;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      open = !open;
      panel.style.display = open ? "block" : "none";
      btn.style.background = open ? "#f0f4ff" : "white";
    });

    this._container.style.position = "relative";
    this._container.appendChild(btn);
    this._container.appendChild(panel);
    return this._container;
  }

  onRemove() {
    this._container.parentNode?.removeChild(this._container);
  }
}

export function MapView({
  satelliteGeoJSON, detections, interventions,
  riskDistricts, onDetectionClick, onDistrictClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const detectionsRef = useRef(detections);
  detectionsRef.current = detections;

  const risk = riskDistricts ?? DEFAULT_RISK;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        glyphs: "https://fonts.openmaptiles.org/{fontstack}/{range}.pbf",
        sources: {
          // OSM street map — fallback base layer where Esri has no deep-zoom coverage
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
            attribution: "© OpenStreetMap contributors",
          },
          // ESRI satellite imagery — real coverage in rural Nepal often tops out well
          // below z19; layer maxzoom below caps where we stop drawing it so OSM
          // shows through instead of Esri's "map data not currently available" tile.
          satellite: {
            type: "raster",
            tiles: ["https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            maxzoom: 16,
            attribution: "© Esri, Maxar, Earthstar Geographics",
          },
          // ESRI road + label overlay
          "esri-labels": {
            type: "raster",
            tiles: ["https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"],
            tileSize: 256,
            maxzoom: 16,
          },
        },
        layers: [
          { id: "osm", type: "raster", source: "osm" },
          { id: "satellite", type: "raster", source: "satellite", maxzoom: 16 },
          { id: "esri-labels", type: "raster", source: "esri-labels", maxzoom: 16, paint: { "raster-opacity": 0.85 } },
        ],
      },
      center: CENTER,
      zoom: ZOOM,
      maxBounds: NEPAL_BOUNDS,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new LegendControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl(), "bottom-left");

    map.on("load", () => {
      map.addSource("nepal-districts", { type: "geojson", data: "/nepal-districts.geojson" });

      // District risk fill (fades out on zoom-in — border takes over as the indicator)
      map.addLayer({
        id: "district-fill",
        type: "fill",
        source: "nepal-districts",
        paint: {
          "fill-color": districtFillExpression(risk),
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0.45, 9, 0.45, 11, 0],
        },
      });

      // Internal district borders: white overview, risk-colored + thicker once zoomed in
      map.addLayer({
        id: "district-line",
        type: "line",
        source: "nepal-districts",
        paint: {
          "line-color": ["step", ["zoom"], "#ffffff", 9, districtFillExpression(risk)],
          "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.8, 9, 0.8, 11, 3],
          "line-opacity": 0.9,
        },
      });

      // Outer Nepal border
      map.addLayer({
        id: "nepal-border",
        type: "line",
        source: "nepal-districts",
        paint: { "line-color": "#0f172a", "line-width": 2.5 },
      });

      // District labels (above zoom 7)
      map.addLayer({
        id: "district-label",
        type: "symbol",
        source: "nepal-districts",
        minzoom: 7,
        layout: {
          "text-field": ["get", "DISTRICT"],
          "text-font": ["Open Sans Regular"],
          "text-size": ["interpolate", ["linear"], ["zoom"], 7, 8, 10, 12],
        },
        paint: {
          "text-color": "#0f172a",
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.5,
        },
      });

      // Satellite patches
      if (satelliteGeoJSON) {
        map.addSource("satellite-patches", { type: "geojson", data: satelliteGeoJSON });
        map.addLayer({ id: "satellite-fill", type: "fill", source: "satellite-patches", paint: { "fill-color": "#3b82f6", "fill-opacity": 0.4 } });
        map.addLayer({ id: "satellite-line", type: "line", source: "satellite-patches", paint: { "line-color": "#1d4ed8", "line-width": 1 } });
      }

      addDroneLayer(map, detectionsRef.current);
      addInterventionLayer(map, interventions);
    });

    // Detection click
    map.on("click", "drone-points", (e) => {
      if (!e.features?.length || !onDetectionClick) return;
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
      const det = detectionsRef.current.find(
        (d) => Math.abs(d.lng - coords[0]) < 0.0001 && Math.abs(d.lat - coords[1]) < 0.0001
      );
      if (det) onDetectionClick(det);
    });

    // District click → zoom + panel
    map.on("click", "district-fill", (e) => {
      if (!e.features?.length) return;
      if (map.queryRenderedFeatures(e.point, { layers: ["drone-points"] }).length) return;

      const geom = e.features[0].geometry;
      if (geom.type !== "Polygon" && geom.type !== "MultiPolygon") return;

      let minLng = Infinity, minLat = Infinity, maxLng = -Infinity, maxLat = -Infinity;
      const rings: number[][][] =
        geom.type === "Polygon"
          ? geom.coordinates as number[][][]
          : (geom.coordinates as number[][][][]).flat();
      for (const ring of rings)
        for (const [lng, lat] of ring) {
          if (lng < minLng) minLng = lng;
          if (lat < minLat) minLat = lat;
          if (lng > maxLng) maxLng = lng;
          if (lat > maxLat) maxLat = lat;
        }

      const bounds: [[number, number], [number, number]] = [[minLng, minLat], [maxLng, maxLat]];
      map.fitBounds(bounds, { padding: 60, maxZoom: 11, duration: 600 });

      if (onDistrictClick) {
        const name = e.features[0].properties?.DISTRICT as string;
        onDistrictClick({ name, risk: risk[name] ?? null, bounds });
      }
    });

    // Hover tooltip
    const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8 });
    map.on("mousemove", "district-fill", (e) => {
      if (!e.features?.length) return;
      map.getCanvas().style.cursor = "pointer";
      const name = e.features[0].properties?.DISTRICT as string;
      const score = risk[name];
      const riskHtml = score != null
        ? `<div style="font-size:11px;color:#64748b;margin-top:2px;">Risk: <strong style="color:${riskColor(score)}">${(score * 100).toFixed(0)}%</strong></div>`
        : "";
      popup.setLngLat(e.lngLat)
        .setHTML(`<div style="font-family:sans-serif;font-size:12px;font-weight:600;color:#0f172a;">${name}</div>${riskHtml}`)
        .addTo(map);
    });
    map.on("mouseleave", "district-fill", () => {
      map.getCanvas().style.cursor = "";
      popup.remove();
    });

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("drone") as maplibregl.GeoJSONSource | undefined;
    if (src)
      src.setData({
        type: "FeatureCollection",
        features: detections.map((d) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [d.lng, d.lat] },
          properties: { detection_type: d.detection_type, confidence: d.confidence },
        })),
      });
  }, [detections]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
