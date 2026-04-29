"use client";
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Detection, Intervention } from "@/lib/api";
import { addSatelliteLayer } from "./SatelliteLayer";
import { addDroneLayer } from "./DroneLayer";
import { addInterventionLayer } from "./InterventionLayer";

interface Props {
  satelliteGeoJSON: GeoJSON.FeatureCollection | null;
  detections: Detection[];
  interventions: Intervention[];
  onDetectionClick?: (detection: Detection) => void;
}

// Chitwan district, Nepal
const INITIAL_CENTER: [number, number] = [84.354, 27.529];
const INITIAL_ZOOM = 10;

export function MapView({ satelliteGeoJSON, detections, interventions, onDetectionClick }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const detectionsRef = useRef(detections);
  detectionsRef.current = detections;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: INITIAL_CENTER,
      zoom: INITIAL_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl(), "bottom-left");

    map.on("load", () => {
      if (satelliteGeoJSON) addSatelliteLayer(map, satelliteGeoJSON);
      addDroneLayer(map, detectionsRef.current);
      addInterventionLayer(map, interventions);
    });

    // Detection click → open detail panel
    map.on("click", "drone-points", (e) => {
      if (!e.features?.length || !onDetectionClick) return;
      const props = e.features[0].properties as { detection_type: string; confidence: number };
      // Find full Detection object by matching coordinates
      const coords = (e.features[0].geometry as GeoJSON.Point).coordinates;
      const det = detectionsRef.current.find(
        (d) => Math.abs(d.lng - coords[0]) < 0.0001 && Math.abs(d.lat - coords[1]) < 0.0001
      );
      if (det) onDetectionClick(det);
    });

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("satellite") as maplibregl.GeoJSONSource | undefined;
    if (src && satelliteGeoJSON) src.setData(satelliteGeoJSON);
  }, [satelliteGeoJSON]);

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

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const src = map.getSource("intervention") as maplibregl.GeoJSONSource | undefined;
    if (src)
      src.setData({
        type: "FeatureCollection",
        features: interventions.map((i) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [i.lng, i.lat] },
          properties: { status: i.status, area_sqm: i.area_sqm },
        })),
      });
  }, [interventions]);

  return <div ref={containerRef} className="absolute inset-0" />;
}
