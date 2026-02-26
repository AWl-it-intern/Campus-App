import { useNavigate } from "react-router-dom";

import awlLogo from "../Common/Awllogo.svg";
import useCandidateDashboard from "../../hooks/useCandidateDashboard";
import DashboardHeader from "../../features/candidate/dashboard/components/DashboardHeader";
import StatusCard from "../../features/candidate/dashboard/components/StatusCard";
import InterviewCard from "../../features/candidate/dashboard/components/InterviewCard";
import ProgressTimeline from "../../features/candidate/dashboard/components/ProgressTimeline";
import ActionButtons from "../../features/candidate/dashboard/components/ActionButtons";
import QuickInfoCard from "../../features/candidate/dashboard/components/QuickInfoCard";

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const {
    isLoading,
    loadError,
    dashboardData,
    notificationsRef,
    isNotificationsOpen,
    firstName,
    gdProgress,
    unreadNotificationsCount,
    handleLogout,
    toggleNotifications,
    openNotifications,
    closeNotifications,
    getNotificationAccent,
  } = useCandidateDashboard({ navigate });

  return (
    <div
      className="min-h-screen bg-white text-[#0A0A0A]"
      style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
    >
      <DashboardHeader
        logoSrc={awlLogo}
        unreadCount={unreadNotificationsCount}
        notifications={dashboardData.notifications}
        isNotificationsOpen={isNotificationsOpen}
        notificationsRef={notificationsRef}
        onToggleNotifications={toggleNotifications}
        onCloseNotifications={closeNotifications}
        onLogout={handleLogout}
        getNotificationAccent={getNotificationAccent}
      />

      <main className="px-4 pb-10 pt-8 sm:px-6">
        <div className="mx-auto max-w-[500px]">
          <h1 className="text-3xl font-bold text-[#001F3F] sm:text-4xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-base text-[#4A5565] sm:text-[20px]">
            Let's check your status.
          </p>

          {loadError && (
            <div className="mt-4 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">
              {loadError}
            </div>
          )}

          {isLoading ? (
            <div className="mt-6 rounded-2xl border border-[#D6D6DC] bg-white p-8 text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-b-2 border-[#0B8A8C]" />
              <p className="text-[#4A5565]">Loading dashboard...</p>
            </div>
          ) : (
            <>
              <StatusCard
                statusBadge={dashboardData.statusBadge}
                jobTitle={dashboardData.jobTitle}
                gdScore={dashboardData.gdScore}
                gdMax={dashboardData.gdMax}
                gdProgress={gdProgress}
              />

              <InterviewCard
                title={dashboardData.interviewTitle}
                description={dashboardData.interviewDescription}
              />

              <ProgressTimeline items={dashboardData.progressItems} />

              <ActionButtons
                onViewApplication={() => navigate("/candidate/application")}
                onViewNotifications={openNotifications}
              />

              <QuickInfoCard
                applicationId={dashboardData.quickInfo.applicationId}
                appliedOn={dashboardData.quickInfo.appliedOn}
                institute={dashboardData.quickInfo.institute}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
}
