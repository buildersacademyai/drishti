"use client";
import { MapView } from "@/components/map/MapView";
import { LayerLegend } from "@/components/map/LayerLegend";
import type { Detection, Intervention } from "@/lib/api";

interface Props {
  satelliteGeoJSON: GeoJSON.FeatureCollection | null;
  detections: Detection[];
  interventions: Intervention[];
}

export function MapClient({ satelliteGeoJSON, detections, interventions }: Props) {
  return (
    <div className="absolute inset-0">
      <MapView
        satelliteGeoJSON={satelliteGeoJSON}
        detections={detections}
        interventions={interventions}
      />
      <LayerLegend />
    </div>
  );
}
