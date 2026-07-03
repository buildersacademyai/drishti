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
  const [localDetections, setLocalDetections] = useState(detections);
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

  function handleStatusChange(id: string, status: string) {
    setLocalDetections((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    setSelectedDetection((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  return (
    <div className="absolute inset-0">
      <MapView
        satelliteGeoJSON={satelliteGeoJSON}
        detections={localDetections}
        interventions={interventions}
        onDetectionClick={handleDetectionClick}
        onDistrictClick={handleDistrictClick}
      />
      {selectedDistrict && (
        <DistrictPanel
          district={selectedDistrict}
          detections={localDetections}
          interventions={interventions}
          onClose={() => setSelectedDistrict(null)}
        />
      )}
      {selectedDetection && (
        <DetectionPanel
          detection={selectedDetection}
          interventions={interventions}
          onClose={() => setSelectedDetection(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
