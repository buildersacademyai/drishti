import { Suspense } from "react";
import {
  getMissionsServer,
  getDetectionsServer,
  getInterventionsServer,
  getAlertsServer,
  getDronesServer,
} from "@/lib/api";
import { DashboardClient } from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [missions, detections, interventions, alerts, drones] = await Promise.allSettled([
    getMissionsServer(),
    getDetectionsServer(),
    getInterventionsServer(),
    getAlertsServer(),
    getDronesServer(),
  ]);

  const missionsData = missions.status === "fulfilled" ? missions.value : [];
  const detectionsData = detections.status === "fulfilled" ? detections.value : [];
  const interventionsData = interventions.status === "fulfilled" ? interventions.value : [];
  const alertsData = alerts.status === "fulfilled" ? alerts.value : [];
  const dronesData = drones.status === "fulfilled" ? drones.value : [];

  return (
    <Suspense fallback={null}>
      <DashboardClient
        missions={missionsData}
        detections={detectionsData}
        interventions={interventionsData}
        alerts={alertsData}
        drones={dronesData}
      />
    </Suspense>
  );
}
