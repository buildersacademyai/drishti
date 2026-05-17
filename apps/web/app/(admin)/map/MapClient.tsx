"use client";
import { useState } from "react";
import { MapView } from "@/components/map/MapView";
import { DetectionPanel } from "@/components/map/DetectionPanel";
import { DistrictPanel, type SelectedDistrict } from "@/components/map/DistrictPanel";
import type { Detection, Intervention } from "@/lib/api";

interface Props {
  satelliteGeoJSON: GeoJSON.FeatureCollection | null;
  detections: Detection[];
  interventions: Intervention[];
}

export function MapClient({ satelliteGeoJSON, detections, interventions }: Props) {
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectedDistrict | null>(null);

  function handleDistrictClick(d: SelectedDistrict) {
    setSelectedDetection(null);
    setSelectedDistrict(d);
  }

  function handleDetectionClick(d: Detection) {
    setSelectedDistrict(null);
    setSelectedDetection(d);
  }

  return (
    <div className="absolute inset-0">
      <MapView
        satelliteGeoJSON={satelliteGeoJSON}
        detections={detections}
        interventions={interventions}
        onDetectionClick={handleDetectionClick}
        onDistrictClick={handleDistrictClick}
      />
      {selectedDistrict && (
        <DistrictPanel
          district={selectedDistrict}
          detections={detections}
          interventions={interventions}
          onClose={() => setSelectedDistrict(null)}
        />
      )}
      {selectedDetection && (
        <DetectionPanel
          detection={selectedDetection}
          interventions={interventions}
          onClose={() => setSelectedDetection(null)}
        />
      )}
    </div>
  );
}
