// pages/HRDashboard.jsx
// Updated with React Router navigation

import { useState, useEffect } from "react";
import { Users, UsersRound, LogOut, BriefcaseBusinessIcon, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// Import reusable components
import StatsCard from "../../Components/common/StatsCard";
import QuickActionCard from "../../Components/dashboard/QuickActionCard";

const HRDashboard = () => {
  const navigate = useNavigate();

  // State for managing candidates, panelists, and drives
  const [candidateCount, setCandidateCount] = useState(0);
  const [panelistCount, setPanelistCount] = useState(0);
  const [totalDriveCount, setTotalDriveCount] = useState(0);

  const API_BASE = "http://localhost:5000";

  // Fetch on mount
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const candidateRes = await axios.get(`${API_BASE}/print-candidates`);
        setCandidateCount(candidateRes.data.count || 0);

        const panelistRes = await axios.get(`${API_BASE}/print-panelists`);
        setPanelistCount(panelistRes.data.count || 0);

        const drivesRes = await axios.get(`${API_BASE}/print-drives`);
        const totalDrives =
          typeof drivesRes.data.count === "number"
            ? drivesRes.data.count
            : (drivesRes.data.data || []).length;
        setTotalDriveCount(totalDrives);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, []);


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

  // Stats data - now using real data including panelists
  const statsData = [
    {
      title: "Total Applications",
      count: candidateCount,
      icon: BriefcaseBusinessIcon,
      bgColor: colors.primary.rainShadow,
      lightBg: "#E8F9F0",
    },
    {
      title: "Panelists",
      count: panelistCount,
      icon: UsersRound,
      bgColor: colors.secondary.goldenHour,
      lightBg: "#FFF9E6",
    },
    {
      title: "Total Drives",
      count: totalDriveCount,
      icon: MapPin,
      bgColor: colors.primary.mossRock,
      lightBg: "#E8F9E8",
    },
  ];

  // Quick actions data - updated with dynamic counts and navigation
  const quickActions = [
    {
      title: "Drive Management",
      subtitle: `${totalDriveCount} ${totalDriveCount === 1 ? "drive" : "drives"} available`,
      icon: BriefcaseBusinessIcon,
      color: colors.primary.rainShadow,
      action: () => navigate("/HR/dashboard/Drives"),
    },
    {
      title: "View All Candidates",
      subtitle: `${candidateCount} ${candidateCount === 1 ? "Candidate" : "Candidates"}`,
      icon: Users,
      color: colors.primary.mossRock,
      action: () => navigate("/HR/dashboard/Create-Users"),
    },
    {
      title: "Manage Panelists",
      subtitle: `${panelistCount} active panelists`,
      icon: UsersRound,
      color: colors.secondary.goldenHour,
      action: () => navigate("/HR/dashboard/Manage-Panelists"),
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("hr_auth");
    localStorage.removeItem("hr_email");
    navigate("/login");
  };

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
                  AWL Recruit
                </h1>
                <p className="text-sm text-white opacity-80">HR Dashboard</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-[#FFAD53] hover:bg-opacity-20 text-white transition-all border-2 cursor-pointer"
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
              Welcome HR!
            </h2>
            <p className="text-gray-600">
              Here's what's happening with your recruitment today.
            </p>
          </section>

          {/* Stats Cards */}
          <section className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                />
              ))}
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
