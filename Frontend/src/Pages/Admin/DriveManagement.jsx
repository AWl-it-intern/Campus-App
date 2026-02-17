// pages/DriveManagement.jsx
// Campus Drive Management Page with React Router navigation

import { useState, useEffect, useMemo } from "react";
import { MapPin, TrendingUp, UserCheck, Award, Briefcase, Users as UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Import drive management components
import {
  DriveFormCard,
  DrivesTableHeader,
  DriveTableRow,
  EditDriveModal,
  JobSelector,
  CreateJobModal, 
  DriveQuickActionCard,
} from "../../Components/drivemanagement/index.js";

// Import common components
import StatsCard from "../../Components/common/StatsCard";
import EmptyState from "../../Components/common/EmptyState.jsx";

export default function DriveManagement({ onDrivesUpdate }) {
  const navigate = useNavigate();

  // Color Palette
  const colors = {
    stonewash: "#003329",
    softFlow: "#6AE8D3",
    mossRock: "#66D095",
    goldenHour: "#DEBF6C",
    marigoldFlame: "#FFAD53",
    clayPot: "#E0B9AD",
    rainShadow: "#00988D",
  };

  // Jobs state - manage jobs locally
  const [jobs, setJobs] = useState([
    {
      JobID: "JOB001",
      JobName: "Software Engineer",
      assignedCandidates: [],
    },
    {
      JobID: "JOB002",
      JobName: "Data Analyst",
      assignedCandidates: [],
    },
    {
      JobID: "JOB003",
      JobName: "Product Manager",
      assignedCandidates: [],
    },
    {
      JobID: "JOB004",
      JobName: "UI/UX Designer",
      assignedCandidates: [],
    },
  ]);

  // Initial drives data
  const [drives, setDrives] = useState([
    {
      id: 1,
      driveId: "DRV001",
      jobId: "JOB001",
      collegeName: "IIT Bombay",
      driveDate: "2026-03-15",
      status: "Live",
      location: "Mumbai, Maharashtra",
      registrations: 250,
      shortlisted: 80,
      selected: 25,
    },
    {
      id: 2,
      driveId: "DRV002",
      jobId: "JOB001",
      collegeName: "NIT Trichy",
      driveDate: "2026-03-20",
      status: "Draft",
      location: "Tiruchirappalli, Tamil Nadu",
      registrations: 0,
      shortlisted: 0,
      selected: 0,
    },
    {
      id: 3,
      driveId: "DRV003",
      jobId: "JOB002",
      collegeName: "BITS Pilani",
      driveDate: "2026-03-10",
      status: "GD Completed",
      location: "Pilani, Rajasthan",
      registrations: 180,
      shortlisted: 60,
      selected: 0,
    },
    {
      id: 4,
      driveId: "DRV004",
      jobId: "JOB003",
      collegeName: "IIT Delhi",
      driveDate: "2026-02-28",
      status: "Results Released",
      location: "New Delhi",
      registrations: 300,
      shortlisted: 100,
      selected: 40,
    },
    {
      id: 5,
      driveId: "DRV005",
      jobId: "JOB001",
      collegeName: "VIT Vellore",
      driveDate: "2026-04-05",
      status: "Live",
      location: "Vellore, Tamil Nadu",
      registrations: 200,
      shortlisted: 65,
      selected: 18,
    },
    {
      id: 6,
      driveId: "DRV006",
      jobId: "JOB002",
      collegeName: "Anna University",
      driveDate: "2026-03-08",
      status: "PI Completed",
      location: "Chennai, Tamil Nadu",
      registrations: 220,
      shortlisted: 75,
      selected: 30,
    },
    {
      id: 7,
      driveId: "DRV007",
      jobId: "JOB003",
      collegeName: "IIIT Hyderabad",
      driveDate: "2026-02-20",
      status: "Closed",
      location: "Hyderabad, Telangana",
      registrations: 150,
      shortlisted: 50,
      selected: 20,
    },
    {
      id: 8,
      driveId: "DRV008",
      jobId: "JOB004",
      collegeName: "NIT Warangal",
      driveDate: "2026-02-15",
      status: "Closed",
      location: "Warangal, Telangana",
      registrations: 180,
      shortlisted: 60,
      selected: 22,
    },
    {
      id: 9,
      driveId: "DRV009",
      jobId: "JOB002",
      collegeName: "DTU Delhi",
      driveDate: "2026-03-25",
      status: "PI Completed",
      location: "New Delhi",
      registrations: 190,
      shortlisted: 70,
      selected: 28,
    },
  ]);

  const [newDrive, setNewDrive] = useState({
    driveId: "",
    jobId: "",
    collegeName: "",
    driveDate: "",
    status: "Draft",
    location: "",
  });

  // Filter states
  const [selectedJob, setSelectedJob] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [collegeFilter, setCollegeFilter] = useState("");

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);
  const [editData, setEditData] = useState({});

  // Job creation modal states
  const [showCreateJobModal, setShowCreateJobModal] = useState(false); 
  const [newJobData, setNewJobData] = useState({
    JobID: "",
    JobName: "",
    description: "",
  });

  // Notify parent component when drives change
  useEffect(() => {
    if (onDrivesUpdate) {
      onDrivesUpdate(drives);
    }
  }, [drives, onDrivesUpdate]);

  // Create Drive Function
  const createDrive = () => {
    if (!newDrive.driveId || !newDrive.jobId || !newDrive.collegeName || !newDrive.driveDate) {
      alert("Please fill in all required fields (Drive ID, Job, College Name, Drive Date)");
      return;
    }

    if (drives.some((drive) => drive.driveId === newDrive.driveId)) {
      alert("Drive ID already exists!");
      return;
    }

    const nextId = drives.length > 0 ? Math.max(...drives.map((d) => d.id)) + 1 : 1;
    
    setDrives([
      ...drives,
      {
        id: nextId,
        ...newDrive,
        registrations: 0,
        shortlisted: 0,
        selected: 0,
      },
    ]);
    
    setNewDrive({
      driveId: "",
      jobId: "",
      collegeName: "",
      driveDate: "",
      status: "Draft",
      location: "",
    });
    
    alert("Campus Drive Created Successfully!");
  };

  // Open Edit Modal
  const openEditModal = (drive) => {
    setSelectedDrive(drive);
    setEditData({ ...drive });
    setShowEditModal(true);
  };

  // Save Drive Changes
  const saveDrive = () => {
    if (!editData.collegeName || !editData.driveDate) {
      alert("Please fill in all required fields");
      return;
    }

    setDrives(
      drives.map((drive) =>
        drive.id === selectedDrive.id ? { ...editData } : drive
      )
    );
    
    setShowEditModal(false);
    setSelectedDrive(null);
    setEditData({});
    alert("Drive updated successfully!");
  };

  // Close Drive Function
  const closeDrive = (driveToClose) => {
    if (
      window.confirm(
        `Are you sure you want to close "${driveToClose.driveId}" at ${driveToClose.collegeName}?`
      )
    ) {
      setDrives(
        drives.map((drive) =>
          drive.id === driveToClose.id ? { ...drive, status: "Closed" } : drive
        )
      );
      alert("Drive closed successfully!");
    }
  };

  // Create Job Function
  const createJob = () => {
    if (!newJobData.JobID || !newJobData.JobName) {
      alert("Please fill in all required fields (Job ID and Job Name)");
      return;
    }

    if (jobs.some((job) => job.JobID === newJobData.JobID)) {
      alert("Job ID already exists!");
      return;
    }

    setJobs([
      ...jobs,
      {
        JobID: newJobData.JobID,
        JobName: newJobData.JobName,
        description: newJobData.description || "",
        assignedCandidates: [],
      },
    ]);

    setNewJobData({
      JobID: "",
      JobName: "",
      description: "",
    });
    
    setShowCreateJobModal(false);
    alert("Job created successfully!");
  };

  // Open Create Job Modal 
  const openCreateJobModal = () => {
    setShowCreateJobModal(true);
  };

  // Get job name by ID
  const getJobName = (jobId) => {
    const job = jobs.find((j) => j.JobID === jobId);
    return job ? `${job.JobID} - ${job.JobName}` : "Unknown Job";
  };

  // Get unique colleges for filter
  const uniqueColleges = [...new Set(drives.map((d) => d.collegeName))].sort();

  // Filter drives
  const filteredDrives = useMemo(() => {
    return drives.filter((drive) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        drive.driveId.toLowerCase().includes(searchLower) ||
        drive.collegeName.toLowerCase().includes(searchLower) ||
        drive.location?.toLowerCase().includes(searchLower);

      const matchesJob = selectedJob === "" || drive.jobId === selectedJob;
      const matchesStatus = statusFilter === "" || drive.status === statusFilter;
      const matchesCollege = collegeFilter === "" || drive.collegeName === collegeFilter;

      return matchesSearch && matchesJob && matchesStatus && matchesCollege;
    });
  }, [drives, searchTerm, selectedJob, statusFilter, collegeFilter]);

  // Calculate statistics based on filtered drives
  const stats = useMemo(() => {
    const totalRegistrations = filteredDrives.reduce((sum, d) => sum + (d.registrations || 0), 0);
    const totalShortlisted = filteredDrives.reduce((sum, d) => sum + (d.shortlisted || 0), 0);
    const totalSelected = filteredDrives.reduce((sum, d) => sum + (d.selected || 0), 0);
    const liveDrives = filteredDrives.filter((d) => d.status === "Live").length;

    return {
      totalRegistrations,
      totalShortlisted,
      totalSelected,
      liveDrives,
    };
  }, [filteredDrives]);

  // Stats data for cards
  const statsData = [
    {
      title: "Total Registrations",
      count: stats.totalRegistrations,
      icon: TrendingUp,
      bgColor: colors.rainShadow,
      lightBg: "#E8F9F0",
    },
    {
      title: "Shortlisted",
      count: stats.totalShortlisted,
      icon: UserCheck,
      bgColor: colors.softFlow,
      lightBg: "#E6F9F5",
    },
    {
      title: "Selected",
      count: stats.totalSelected,
      icon: Award,
      bgColor: colors.mossRock,
      lightBg: "#E8F9E8",
    },
    {
      title: "Live Drives",
      count: stats.liveDrives,
      icon: MapPin,
      bgColor: colors.marigoldFlame,
      lightBg: "#FFF9E6",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/Admin/dashboard")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.stonewash }}
        >
          ← Back to Dashboard
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1
            className="text-3xl font-bold mb-2"
            style={{ color: colors.stonewash }}
          >
            Drive Management
          </h1>
          <p className="text-gray-600">
            Manage campus recruitment drives across different colleges
          </p>
        </div>

        {/* Job Selector */}
        <JobSelector
          selectedJob={selectedJob}
          setSelectedJob={setSelectedJob}
          jobs={jobs}
          onCreateJob={openCreateJobModal}  
          colors={colors}
        />

        {/* Quick Actions Section */}
        <section className="mb-8">
          <div className="mb-4">
            <h3
              className="text-2xl font-bold mb-2"
              style={{ color: colors.stonewash }}
            >
              Quick Actions
            </h3>
            <p className="text-gray-600">
              Manage jobs and view candidates for this drive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DriveQuickActionCard
              title="Job Management"
              subtitle={`Manage ${jobs.length} job openings and assign to drives`}
              icon={Briefcase}
              color={colors.rainShadow}
              onClick={() => navigate("/Admin/dashboard/Create-Job", { state: { fromDrives: true } })}
            />
            <DriveQuickActionCard
              title="Candidate Management"
              subtitle="View and manage all candidates across drives"
              icon={UsersIcon}
              color={colors.mossRock}
              onClick={() => navigate("/Admin/dashboard/Create-Users", { state: { fromDrives: true } })}
            />
          </div>
        </section>

        {/* Stats Cards */}
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

        {/* Create Drive Form */}
        <DriveFormCard
          newDrive={newDrive}
          setNewDrive={setNewDrive}
          createDrive={createDrive}
          jobs={jobs}
          colors={colors}
        />

        {/* Drives Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <DrivesTableHeader
            filteredDrivesCount={filteredDrives.length}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            collegeFilter={collegeFilter}
            setCollegeFilter={setCollegeFilter}
            uniqueColleges={uniqueColleges}
            colors={colors}
          />

          {/* Table */}
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
                    Drive Date
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Job Opening
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Registrations
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
                    Shortlisted
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
                {filteredDrives.length === 0 ? (
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
                      key={drive.id}
                      drive={drive}
                      getJobName={getJobName}
                      openEditModal={openEditModal}
                      closeDrive={closeDrive}
                      colors={colors}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditDriveModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        selectedDrive={selectedDrive}
        editData={editData}
        setEditData={setEditData}
        saveDrive={saveDrive}
        jobs={jobs}
        colors={colors}
      />

      {/* Create Job Modal */}
      <CreateJobModal
        isOpen={showCreateJobModal}
        onClose={() => setShowCreateJobModal(false)}
        newJobData={newJobData}
        setNewJobData={setNewJobData}
        createJob={createJob}
        colors={colors}
      />
    </div>
  );
}
