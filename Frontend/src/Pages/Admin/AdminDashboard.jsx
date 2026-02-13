// pages/AdminDashboard.jsx
// Updated with Panelist Integration and using modular components

import { useState } from "react";
import { Users, UsersRound, LogOut, BriefcaseBusinessIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateUsers from "./CreateUsers";
import CreateJob from "./CreateJob";
import CreatePanelist from "./CreatePanelist";

// Import reusable components
import StatsCard from "../../components/common/StatsCard";
import QuickActionCard from "../../components/dashboard/QuickActionCard";
import StatusBar from "../../components/dashboard/StatusBar";
import RecentApplicationCard from "../../components/dashboard/RecentApplicationCard";
import AssessmentProgressCard from "../../components/dashboard/AssessmentProgressCard";

const HRDashboard = () => {
  const navigate = useNavigate();

  // State for managing candidates, jobs, and panelists
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [panelists, setPanelists] = useState([]); // New state for panelists
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard', 'users', 'jobs', 'panelists'

  // Color palette
  const colors = {
    primary: {
      stonewash: "#003329",
      softFlow: "#6AE8D3",
      mossRock: "#66D095",
      rainShadow: "#00988D",
    },
    secondary: {
      goldenHour: "#DEBF6C",
      marigoldFlame: "#FFAD53",
      clayPot: "#E0B9AD",
    },
  };

  // Handle candidates update from CreateUsers component
  const handleCandidatesUpdate = (updatedCandidates) => {
    setCandidates(updatedCandidates);
  };

  // Handle jobs update from CreateJob component
  const handleJobsUpdate = (updatedJobs) => {
    setJobs(updatedJobs);
  };

  // Handle panelists update from CreatePanelist component
  const handlePanelistsUpdate = (updatedPanelists) => {
    setPanelists(updatedPanelists);
  };

  // Handle job assignments from CreateJob component
  const handleJobAssignment = (candidateJobMap) => {
    const updatedCandidates = candidates.map((candidate) => {
      const jobs = candidateJobMap[candidate.id] || [];
      return {
        ...candidate,
        AssignedJob: jobs.join(", "),
      };
    });

    setCandidates(updatedCandidates);
  };

  // Get recent users (last 5)
  const getRecentUsers = () => {
    return candidates.slice(-5).reverse();
  };

  // Stats data - now using real data including panelists
  const statsData = [
    {
      title: "Total jobs",
      count: jobs.length,
      icon: BriefcaseBusinessIcon,
      bgColor: colors.primary.rainShadow,
      lightBg: "#E8F9F0",
    },
    {
      title: "Panelists",
      count: panelists.length, // Dynamic count from CreatePanelist
      icon: UsersRound,
      bgColor: colors.secondary.goldenHour,
      lightBg: "#FFF9E6",
    },
  ];

  // Quick actions data - updated with dynamic counts
  const quickActions = [
    {
      title: "View All jobs",
      subtitle: `${jobs.length} jobs`,
      icon: BriefcaseBusinessIcon,
      color: colors.primary.rainShadow,
      action: () => setActiveView("jobs"),
    },
    {
      title: "Manage Users",
      subtitle: `${candidates.length} candidates`,
      icon: Users,
      color: colors.primary.mossRock,
      action: () => setActiveView("users"),
    },
    {
      title: "Manage Panelists",
      subtitle: `${panelists.length} active panelists`, // Dynamic count
      icon: UsersRound,
      color: colors.secondary.goldenHour,
      action: () => setActiveView("panelists"), // Updated to use state
    },
  ];

  // Application status data
  const applicationStatus = [
    { label: "Submitted", count: 0, color: "#94A3B8" },
    { label: "Shortlisted", count: 4, color: colors.primary.mossRock },
    { label: "GD Pending", count: 1, color: colors.secondary.marigoldFlame },
    { label: "PI Pending", count: 0, color: "#94A3B8" },
    { label: "Selected", count: 1, color: colors.primary.rainShadow },
    { label: "Rejected", count: 1, color: "#EF4444" },
  ];

  // Recent applications data
  const recentApplications = getRecentUsers().map((user) => ({
    name: user.name,
    college: user.college,
    email: user.email,
    date: new Date().toLocaleDateString("en-GB"),
    status: user.AssignedJob ? "Assigned" : "Pending",
    statusColor: user.AssignedJob ? colors.primary.mossRock : "#94A3B8",
  }));

  // Default applications if no users
  const displayApplications =
    recentApplications.length > 0
      ? recentApplications
      : [
          {
            name: "Rahul Sharma",
            college: "Indian Institute of Technology, Delhi",
            date: "15/1/2026",
            status: "Shortlisted",
            statusColor: colors.primary.mossRock,
          },
          {
            name: "Priya Patel",
            college: "National Institute of Technology, Trichy",
            date: "16/1/2026",
            status: "Shortlisted",
            statusColor: colors.primary.mossRock,
          },
          {
            name: "Arjun Reddy",
            college: "BITS Pilani",
            date: "18/1/2026",
            status: "GD Pending",
            statusColor: colors.secondary.marigoldFlame,
          },
          {
            name: "Sneha Iyer",
            college: "Delhi Technological University",
            date: "12/1/2026",
            status: "Selected",
            statusColor: colors.primary.rainShadow,
          },
          {
            name: "Karthik Menon",
            college: "Anna University",
            date: "20/1/2026",
            status: "Rejected",
            statusColor: "#EF4444",
          },
        ];

  // Assessment progress data
  const assessmentProgress = [
    {
      title: "Group Discussion",
      completed: 3,
      total: 4,
      pending: 1,
      color: colors.primary.rainShadow,
    },
    {
      title: "Personal Interview",
      completed: 2,
      total: 4,
      pending: 2,
      color: colors.secondary.marigoldFlame,
    },
  ];

  const handleLogout = () => {
    navigate("/");
  };

  // Render based on active view
  if (activeView === "users") {
    return (
      <div className="min-h-screen bg-gray-50">
        <CreateUsers onCandidatesUpdate={handleCandidatesUpdate} />
        <button
          onClick={() => setActiveView("dashboard")}
          className="fixed top-8 left-8 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.primary.stonewash }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (activeView === "jobs") {
    return (
      <div className="min-h-screen bg-gray-50">
        <CreateJob
          candidates={candidates}
          onJobAssignment={handleJobAssignment}
          onJobsUpdate={handleJobsUpdate}
        />
        <button
          onClick={() => setActiveView("dashboard")}
          className="fixed top-8 left-8 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.primary.stonewash }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (activeView === "panelists") {
    return (
      <div className="min-h-screen bg-gray-50">
        <CreatePanelist
          candidates={candidates}
          onPanelistsUpdate={handlePanelistsUpdate}
        />
        <button
          onClick={() => setActiveView("dashboard")}
          className="fixed top-8 left-8 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg"
          style={{ backgroundColor: colors.primary.stonewash }}
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav
        className="shadow-md sticky top-0 z-40"
        style={{ backgroundColor: colors.primary.stonewash }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.primary.softFlow }}
              >
                <Users size={28} color={colors.primary.stonewash} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Campus Recruit
                </h1>
                <p className="text-sm text-white opacity-80">Admin Dashboard</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white hover:bg-opacity-20 text-white transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div>
          {/* Welcome Section */}
          <section className="mb-8">
            <h2
              className="text-3xl font-bold mb-2"
              style={{ color: colors.primary.stonewash }}
            >
              Welcome back, Admin! 👋
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your recruitment today.
            </p>
          </section>

          {/* Stats Cards */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
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

          {/* Quick Actions */}
          <section className="mb-8">
            <div className="mb-6">
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: colors.primary.stonewash }}
              >
                Quick Actions
              </h3>
              <p className="text-gray-600">
                Manage your recruitment process efficiently
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickActions.map((action, index) => (
                <QuickActionCard
                  key={index}
                  title={action.title}
                  subtitle={action.subtitle}
                  icon={action.icon}
                  color={action.color}
                  action={action.action}
                  path={action.path}
                />
              ))}
            </div>
          </section>

          {/* Application Status + Recent Applications */}
          <section className="mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Application Status */}
              <StatusBar
                statusData={applicationStatus}
                primaryColor={colors.primary.stonewash}
              />

              {/* Recent Applications */}
              <div className="card bg-white shadow-lg">
                <div className="card-body p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3
                      className="text-xl font-bold"
                      style={{ color: colors.primary.stonewash }}
                    >
                      Recent Users
                    </h3>
                    {candidates.length > 0 && (
                      <button
                        onClick={() => setActiveView("users")}
                        className="text-sm font-medium hover:underline"
                        style={{ color: colors.primary.mossRock }}
                      >
                        View All →
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {displayApplications.map((application, index) => (
                      <RecentApplicationCard
                        key={index}
                        application={application}
                        onClick={(app) => console.log("Clicked:", app.name)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Assessment Progress Section */}
          <section className="mb-8">
            <div className="card bg-white shadow-lg">
              <div className="card-body p-6">
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.primary.stonewash }}
                >
                  Assessment Progress
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Track GD and PI assessments
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {assessmentProgress.map((assessment, index) => (
                    <AssessmentProgressCard
                      key={index}
                      assessment={assessment}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center text-gray-600 text-sm py-4">
            © 2026 Campus Recruit. All rights reserved.
          </footer>
        </div>
      </main>
    </div>
  );
};

export default HRDashboard;
