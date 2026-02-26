// pages/DriveManagement.jsx
// DB-backed Drive Management aligned to MongoDB drive schema

import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  TrendingUp,
  UserCheck,
  Award,
  Briefcase,
  Users as UsersIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  DriveFormCard,
  DrivesTableHeader,
  DriveTableRow,
  DriveQuickActionCard,
} from "../../Components/drivemanagement/index.js";

import StatsCard from "../../Components/common/StatsCard.jsx";
import EmptyState from "../../Components/common/EmptyState.jsx";

// const API_BASE = "http://localhost:5000"; // add api baase here 

const EMPTY_DRIVE_FORM = {
  DriveID: "",
  CollegeName: "",
  StartDate: "",
  EndDate: "",
  JobsOpening: [],
  Status: "Draft",
  NumberOfCandidates: "",
};

export default function DriveManagement({ onDrivesUpdate }) {
  const navigate = useNavigate();

  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
    rainShadow: "#00988D",
  };

  const [jobs, setJobs] = useState([]);
  const [jobCount, setJobCount] = useState(0);

  const [drives, setDrives] = useState([]);
  const [drivesLoading, setDrivesLoading] = useState(true);
  const [drivesError, setDrivesError] = useState(null);

  const [newDrive, setNewDrive] = useState(EMPTY_DRIVE_FORM);

  const [selectedJob, setSelectedJob] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");

  const fetchJobs = async () => {
    try {
      const jobsRes = await axios.get(`/print-jobs`);    // add api baase here 
      const jobsData = (jobsRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
      }));

      setJobs(jobsData);
      setJobCount(
        typeof jobsRes.data.count === "number"
          ? jobsRes.data.count
          : jobsData.length,
      );
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setJobs([]);
      setJobCount(0);
    }
  };

  const fetchDrives = async () => {
    try {
      setDrivesLoading(true);
      const drivesRes = await axios.get(`/print-drives`); // add api baase here 
      const drivesData = (drivesRes.data.data || []).map((doc) => ({
        ...doc,
        id: doc._id,
        JobsOpening: Array.isArray(doc.JobsOpening) ? doc.JobsOpening : [],
        NumberOfCandidates: Number(doc.NumberOfCandidates) || 0,
        Selected: Number(doc.Selected) || 0,
        Status: doc.Status || "Draft",
      }));

      setDrives(drivesData);
      setDrivesError(null);
    } catch (err) {
      console.error("Error fetching drives:", err);
      setDrives([]);
      setDrivesError("Failed to fetch drives from database. Please try again.");
    } finally {
      setDrivesLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchDrives();
  }, []);

  useEffect(() => {
    if (onDrivesUpdate) {
      onDrivesUpdate(drives);
    }
  }, [drives, onDrivesUpdate]);

  const createDrive = async () => {
    const payload = {
      DriveID: newDrive.DriveID.trim(),
      CollegeName: newDrive.CollegeName.trim(),
      StartDate: newDrive.StartDate,
      EndDate: newDrive.EndDate,
      JobsOpening: Array.isArray(newDrive.JobsOpening) ? newDrive.JobsOpening : [],
      Status: newDrive.Status || "Draft",
      NumberOfCandidates: Number(newDrive.NumberOfCandidates) || 0,
      Selected: 0,
    };

    if (!payload.DriveID || !payload.CollegeName || !payload.StartDate || !payload.EndDate) {
      alert("Please fill Drive ID, College Name, Start Date and End Date.");
      return;
    }

    if (payload.JobsOpening.length === 0) {
      alert("Please select at least one job in Jobs Opening.");
      return;
    }

    if (new Date(payload.EndDate) < new Date(payload.StartDate)) {
      alert("End Date cannot be before Start Date.");
      return;
    }

    if (
      drives.some(
        (drive) =>
          String(drive.DriveID || "").toLowerCase() === payload.DriveID.toLowerCase(),
      )
    ) {
      alert("Drive ID already exists.");
      return;
    }

    try {
      const response = await axios.post(`/drive`, payload); // add api baase here 
      if (response.data.success) {
        setNewDrive(EMPTY_DRIVE_FORM);
        await fetchDrives();
        alert("Campus Drive created successfully.");
      } else {
        alert("Failed to create drive: " + (response.data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error creating drive:", error);
      alert("Failed to create drive. Please check your connection and try again.");
    }
  };

  const deleteDrive = async (driveToDelete) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${driveToDelete.DriveID}" (${driveToDelete.CollegeName})?`,
      )
    ) {
      const driveId = driveToDelete.id || driveToDelete._id;
      if (!driveId) {
        alert("Unable to delete drive: missing drive id.");
        return;
      }

      try {
        const response = await axios.delete(`/drive/${driveId}`); // add api baase here 
        if (response.data.success) {
          await fetchDrives();
          alert("Drive deleted successfully.");
        } else {
          alert("Failed to delete drive: " + (response.data.error || "Unknown error"));
        }
      } catch (error) {
        console.error("Error deleting drive:", error);
        alert("Failed to delete drive. Please check your connection and try again.");
      }
    }
  };

  const openDriveDetails = (drive) => {
    const driveObjectId = drive.id || drive._id;
    if (!driveObjectId) return;
    navigate(`/HR/dashboard/Drives/${driveObjectId}`);
  };

  const uniqueColleges = useMemo(() => {
    return [...new Set(drives.map((d) => d.CollegeName).filter(Boolean))].sort();
  }, [drives]);

  const availableJobNames = useMemo(() => {
    return [...new Set(jobs.map((job) => job.JobName).filter(Boolean))].sort();
  }, [jobs]);

  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const searchLower = searchTerm.toLowerCase();
      const jobsOpening = Array.isArray(drive.JobsOpening) ? drive.JobsOpening : [];

      const matchesSearch =
        String(drive.DriveID || "").toLowerCase().includes(searchLower) ||
        String(drive.CollegeName || "").toLowerCase().includes(searchLower) ||
        jobsOpening.join(", ").toLowerCase().includes(searchLower);

      const matchesJob =
        selectedJob === "" ||
        jobsOpening.some(
          (jobName) => String(jobName).toLowerCase() === selectedJob.toLowerCase(),
        );

      const matchesStatus =
        statusFilter === "" ||
        String(drive.Status || "").toLowerCase() === statusFilter.toLowerCase();

      const matchesCollege =
        collegeFilter === "" || String(drive.CollegeName || "") === collegeFilter;

      return matchesSearch && matchesJob && matchesStatus && matchesCollege;
    });
  }, [drives, searchTerm, selectedJob, statusFilter, collegeFilter]);

  const stats = useMemo(() => {
    const totalCandidates = filteredDrives.reduce(
      (sum, d) => sum + (Number(d.NumberOfCandidates) || 0),
      0,
    );
    const totalSelected = filteredDrives.reduce(
      (sum, d) => sum + (Number(d.Selected) || 0),
      0,
    );
    const liveDrives = filteredDrives.filter(
      (d) => String(d.Status || "").toLowerCase() === "live",
    ).length;

    return {
      totalCandidates,
      totalSelected,
      liveDrives,
      totalDrives: filteredDrives.length,
    };
  }, [filteredDrives]);

  const statsData = [
    {
      title: "Candidates",
      count: stats.totalCandidates,
      icon: TrendingUp,
      bgColor: colors.rainShadow,
      lightBg: "#E8F9F0",
    },
    {
      title: "Selected",
      count: stats.totalSelected,
      icon: UserCheck,
      bgColor: colors.softFlow,
      lightBg: "#E6F9F5",
    },
    {
      title: "Active Drives",
      count: stats.liveDrives,
      icon: MapPin,
      bgColor: colors.marigoldFlame,
      lightBg: "#FFF9E6",
    },
    {
      title: "Total Drives",
      count: stats.totalDrives,
      icon: Award,
      bgColor: colors.mossRock,
      lightBg: "#E8F9E8",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/HR/dashboard")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
          {"<-"} Back to Dashboard
        </button>

        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.stonewash }}
          >
            Drive Management
          </h1>
          <p className="text-gray-600">
            Manage your Campus Drives
          </p>
        </div>

        {drivesError && (
          <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg">
            <strong>Warning:</strong> {drivesError}
          </div>
        )}

        <section className="mb-8">
          <div className="mb-4">
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: colors.stonewash }}
            >
              Quick Actions
            </h3>
            <p className="text-gray-600">
              Manage jobs and candidates related to drives
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DriveQuickActionCard
              title="Job Management"
              subtitle={`${jobCount} ${jobCount === 1 ? "job" : "jobs"} available`}
              icon={Briefcase}
              color={colors.rainShadow}
              onClick={() =>
                navigate("/HR/dashboard/Create-Job", { state: { fromDrives: true } })
              }
            />
            <DriveQuickActionCard
              title="Candidate Management"
              subtitle="View and manage all candidates across drives"
              icon={UsersIcon}
              color={colors.mossRock}
              onClick={() =>
                navigate("/HR/dashboard/Create-Users", { state: { fromDrives: true } })
              }
            />
          </div>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                count={stat.count}
                icon={stat.icon}
                bgColor={stat.bgColor}
                lightBg={stat.lightBg}
              />
            ))}
          </div>
        </section>

        <DriveFormCard
          newDrive={newDrive}
          setNewDrive={setNewDrive}
          createDrive={createDrive}
          jobs={jobs}
          colors={colors}
        />

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <DrivesTableHeader
            filteredDrivesCount={filteredDrives.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedJob={selectedJob}
            setSelectedJob={setSelectedJob}
            availableJobNames={availableJobNames}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            collegeFilter={collegeFilter}
            setCollegeFilter={setCollegeFilter}
            uniqueColleges={uniqueColleges}
            colors={colors}
          />

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead style={{ backgroundColor: colors.softFlow + "20" }}>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Drive ID
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    College Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Start Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    End Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Jobs Opening
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Number of Candidates
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Selected
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {drivesLoading ? (
                  <tr>
                    <td colSpan="9" className="py-12">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300 mx-auto mb-3"></div>
                        <p className="font-medium text-gray-500">Loading drives...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredDrives.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12">
                      <EmptyState
                        icon={MapPin}
                        title="No drives found"
                        message="Try adjusting your filters or create a new drive"
                      />
                    </td>
                  </tr>
                ) : (
                  filteredDrives.map((drive) => (
                    <DriveTableRow
                      key={drive.id || drive._id || drive.DriveID}
                      drive={drive}
                      deleteDrive={deleteDrive}
                      colors={colors}
                      onRowClick={openDriveDetails}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}