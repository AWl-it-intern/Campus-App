import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {
  DriveOverviewCard,
  DriveKpiStrip,
  DriveJobBreakdown,
} from "../../Components/drivemanagement/drivecomponents";

const API_BASE = "http://localhost:5000";

const splitAssignedJobs = (value) =>
  String(value || "")
    .split(",")
    .map((job) => job.trim())
    .filter(Boolean);

const safeLower = (value) => String(value || "").toLowerCase();

export default function DrivePage() {
  const navigate = useNavigate();
  const { driveId } = useParams();

  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
    rainShadow: "#00988D",
  };

  const [drive, setDrive] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [panelists, setPanelists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDrivePageData = async () => {
      try {
        setLoading(true);
        const [driveRes, candidatesRes, panelistsRes] = await Promise.all([
          axios.get(`${API_BASE}/drive/${driveId}`),
          axios.get(`${API_BASE}/print-candidates?limit=5000`),
          axios.get(`${API_BASE}/print-panelists?limit=5000`),
        ]);

        setDrive(driveRes.data.data || null);
        setCandidates(candidatesRes.data.data || []);
        setPanelists(panelistsRes.data.data || []);
        setError(null);
      } catch (fetchError) {
        console.error("Error loading drive page:", fetchError);
        setError(
          fetchError?.response?.data?.error ||
            "Unable to load drive details. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDrivePageData();
  }, [driveId]);

  const driveScopedCandidates = useMemo(() => {
    if (!drive) return [];

    const driveKeySet = new Set(
      [
        driveId,
        drive._id,
        drive.id,
        drive.DriveID,
        String(drive.DriveID || "").toLowerCase(),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase()),
    );

    return candidates.filter((candidate) => {
      const candidateKeys = [
        candidate.driveId,
        candidate.DriveID,
        candidate.assignedDriveId,
        candidate.AssignedDriveId,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());

      const hasDirectDriveMatch = candidateKeys.some((key) => driveKeySet.has(key));
      const hasCollegeMatch =
        safeLower(candidate.college) === safeLower(drive.CollegeName);

      return hasDirectDriveMatch || hasCollegeMatch;
    });
  }, [candidates, drive, driveId]);

  const jobRows = useMemo(() => {
    if (!drive) return [];

    const driveJobs = Array.isArray(drive.JobsOpening) ? drive.JobsOpening : [];

    return driveJobs.map((jobName) => {
      const lowerJob = safeLower(jobName);
      const candidateCount = driveScopedCandidates.filter((candidate) =>
        splitAssignedJobs(candidate.AssignedJob).some(
          (candidateJob) => safeLower(candidateJob) === lowerJob,
        ),
      ).length;

      const mappedPanelists = panelists
        .filter((panelist) => {
          const expertise = safeLower(panelist.expertise);
          const designation = safeLower(panelist.designation);
          const assignedJobs = Array.isArray(panelist.assignedJobs)
            ? panelist.assignedJobs.map((item) => safeLower(item))
            : [];

          return (
            assignedJobs.includes(lowerJob) ||
            expertise.includes(lowerJob) ||
            designation.includes(lowerJob)
          );
        })
        .map((panelist) => ({
          id: panelist._id || panelist.id || panelist.email || panelist.name,
          name: panelist.name || "Unnamed Panelist",
          designation: panelist.designation || "",
          expertise: panelist.expertise || "",
        }));

      return {
        jobName,
        candidateCount,
        panelists: mappedPanelists,
      };
    });
  }, [drive, driveScopedCandidates, panelists]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-gray-500" size={36} />
          <p className="text-gray-600 font-medium">Loading drive details...</p>
        </div>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => navigate("/HR/dashboard/Drives")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg inline-flex items-center gap-2"
          style={{ backgroundColor: colors.stonewash }}
        >
          <ArrowLeft size={18} />
          Back to Drive Management
        </button>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={36} />
          <h2 className="text-xl font-bold text-red-600 mb-2">Unable to open drive</h2>
          <p className="text-gray-600">{error || "Drive not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/HR/dashboard/Drives")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg inline-flex items-center gap-2"
          style={{ backgroundColor: colors.stonewash }}
        >
          <ArrowLeft size={18} />
          Back to Drive Management
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.stonewash }}>
            Drive Details
          </h1>
          <p className="text-gray-600">
            Job-wise candidate count and assigned panelists for this campus drive
          </p>
        </div>

        <DriveOverviewCard drive={drive} colors={colors} />
        <DriveKpiStrip drive={drive} jobRows={jobRows} colors={colors} />
        <DriveJobBreakdown jobRows={jobRows} colors={colors} />
      </div>
    </div>
  );
}
