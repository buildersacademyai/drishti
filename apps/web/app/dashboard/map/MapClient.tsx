"use client";
import { useEffect, useState } from "react";
import { MapView } from "@/components/map/MapView";
import { DetectionPanel } from "@/components/map/DetectionPanel";
import { DistrictPanel, type SelectedDistrict } from "@/components/map/DistrictPanel";
import type { Detection, Intervention } from "@/lib/api";
import {
  createManualWaterSource,
  getAdminUnits,
  getSatelliteDetectionsGeoJSON,
  type AdminUnitRef,
} from "@/lib/client-api";

interface Props {
  satelliteGeoJSON: GeoJSON.FeatureCollection | null;
  detections: Detection[];
  interventions: Intervention[];
}

export function MapClient({ satelliteGeoJSON, detections, interventions }: Props) {
  const [localDetections, setLocalDetections] = useState(detections);
  const [localSatelliteGeoJSON, setLocalSatelliteGeoJSON] = useState(satelliteGeoJSON);
  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SelectedDistrict | null>(null);
  const [adminUnits, setAdminUnits] = useState<AdminUnitRef[]>([]);
  const [pinning, setPinning] = useState(false);
  const [savingPin, setSavingPin] = useState(false);

  useEffect(() => {
    getAdminUnits().then(setAdminUnits).catch(() => setAdminUnits([]));
  }, []);

  const selectedAdminUnitId = selectedDistrict
    ? adminUnits.find((u) => u.name.toUpperCase() === selectedDistrict.name.toUpperCase())?.id ?? null
    : null;

  function handleDistrictClick(d: SelectedDistrict) {
    setSelectedDetection(null);
    setSelectedDistrict(d);
    setPinning(false);
  }

  function handleDetectionClick(d: Detection) {
    setSelectedDistrict(null);
    setSelectedDetection(d);
  }

  function handleStatusChange(id: string, status: string) {
    setLocalDetections((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));
    setSelectedDetection((prev) => (prev && prev.id === id ? { ...prev, status } : prev));
  }

  async function handlePinPlaced(lat: number, lng: number) {
    if (!selectedAdminUnitId) { setPinning(false); return; }
    const notes = window.prompt("Note for this water source (optional):") ?? undefined;
    setSavingPin(true);
    try {
      await createManualWaterSource({ admin_unit_id: selectedAdminUnitId, lat, lng, notes: notes || undefined });
      const refreshed = await getSatelliteDetectionsGeoJSON();
      setLocalSatelliteGeoJSON(refreshed);
    } catch {
      window.alert("Failed to save water source. Try again.");
    } finally {
      setSavingPin(false);
      setPinning(false);
    }
  }

  return (
    <div className="absolute inset-0">
      <MapView
        satelliteGeoJSON={localSatelliteGeoJSON}
        detections={localDetections}
        interventions={interventions}
        selectedDistrictBounds={selectedDistrict?.bounds ?? null}
        pinning={pinning}
        onDetectionClick={handleDetectionClick}
        onDistrictClick={handleDistrictClick}
        onMapClickForPin={handlePinPlaced}
      />
      {pinning && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-[#0f172a] text-white text-sm px-4 py-2 rounded-lg shadow-lg">
          Click the map to place a water source pin
        </div>
      )}
      {selectedDistrict && (
        <DistrictPanel
          district={selectedDistrict}
          detections={localDetections}
          interventions={interventions}
          satelliteGeoJSON={localSatelliteGeoJSON}
          adminUnitId={selectedAdminUnitId}
          pinning={pinning}
          savingPin={savingPin}
          onStartPinning={() => setPinning(true)}
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
