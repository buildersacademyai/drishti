"use client";
import { useState } from "react";
import { MapView } from "@/components/map/MapView";
import { LayerLegend } from "@/components/map/LayerLegend";
import { DetectionPanel } from "@/components/map/DetectionPanel";
import type { Detection, Intervention } from "@/lib/api";

interface Props {
  satelliteGeoJSON: GeoJSON.FeatureCollection | null;
  detections: Detection[];
  interventions: Intervention[];
}

export function MapClient({ satelliteGeoJSON, detections, interventions }: Props) {
  const [selected, setSelected] = useState<Detection | null>(null);

  return (
    <div className="absolute inset-0">
      <MapView
        satelliteGeoJSON={satelliteGeoJSON}
        detections={detections}
        interventions={interventions}
        onDetectionClick={setSelected}
      />
      {selected && (
        <DetectionPanel
          detection={selected}
          interventions={interventions}
          onClose={() => setSelected(null)}
        />
      )}
      <LayerLegend />
    </div>
  );
}
