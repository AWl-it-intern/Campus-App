import { useEffect, useState } from "react";
import { fetchCandidates } from "../services/candidatesService";
import { fetchPanelists } from "../services/panelistsService";
import { fetchDrives } from "../services/drivesService";

export default function useHrDashboard() {
  const [candidateCount, setCandidateCount] = useState(0);
  const [panelistCount, setPanelistCount] = useState(0);
  const [totalDriveCount, setTotalDriveCount] = useState(0);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const [candidates, panelists, drives] = await Promise.all([
          fetchCandidates({ limit: 5000 }),
          fetchPanelists({ limit: 5000 }),
          fetchDrives({ limit: 5000 }),
        ]);

        setCandidateCount(Array.isArray(candidates) ? candidates.length : 0);
        setPanelistCount(Array.isArray(panelists) ? panelists.length : 0);
        setTotalDriveCount(Array.isArray(drives) ? drives.length : 0);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchDashboardStats();
  }, []);

  return {
    candidateCount,
    panelistCount,
    totalDriveCount,
  };
}
