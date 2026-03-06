import { Users, UsersRound, BriefcaseBusinessIcon, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatsCard from "../../Components/common/StatsCard";
import QuickActionCard from "../../Components/dashboard/QuickActionCard";
import HrShell from "../../Components/common/HrShell.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useHrDashboard from "../../hooks/useHrDashboard";

const HRDashboard = () => {
  const navigate = useNavigate();
  const showQuickActions = false;

  const { candidateCount, panelistCount, totalDriveCount } = useHrDashboard();

  const colors = {
    primary: {
      stonewash: HR_COLORS.stonewash,
      softFlow: HR_COLORS.softFlow,
      mossRock: HR_COLORS.mossRock,
      rainShadow: HR_COLORS.rainShadow,
    },
    secondary: {
      goldenHour: HR_COLORS.goldenHour,
      marigoldFlame: HR_COLORS.marigoldFlame,
      clayPot: HR_COLORS.clayPot,
    },
  };

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

  return (
    <HrShell
      title="HR Dashboard"
      subtitle="Monitor hiring activity and move quickly across recruitment operations."
    >
      <section className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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

      {showQuickActions ? (
        <section className="mb-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold mb-2" style={{ color: colors.primary.stonewash }}>
              Quick Actions
            </h3>
            <p className="text-gray-600">Manage your recruitment process efficiently</p>
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
      ) : null}

      <footer className="text-center text-gray-600 text-sm py-4">
        Copyright 2026 Campus Recruit. All rights reserved.
      </footer>
    </HrShell>
  );
};

export default HRDashboard;
