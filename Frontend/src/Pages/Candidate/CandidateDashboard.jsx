import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  CircleAlert,
  FileText,
  Lock,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import awlLogo from "../Common/Awllogo.svg";
import {
  fetchLoggedInCandidate,
  readSavedCandidateApplication,
} from "../../utils/candidateData";

const defaultNotifications = [
  {
    type: "Under Review",
    message: "Your application is currently under review by the recruitment team.",
    unread: true,
  },
  {
    type: "Shortlisted",
    message: "You will see a shortlisted update here once the screening is complete.",
    unread: false,
  },
  {
    type: "Regret",
    message: "If not selected for the next round, the regret update will appear here.",
    unread: false,
  },
];

const defaultProgressItems = [
  { label: "Application Submitted", status: "completed", note: "" },
  { label: "Resume Screening", status: "completed", note: "" },
  { label: "GD Round", status: "completed", note: "" },
  { label: "PI Round", status: "active", note: "PI Scheduled" },
  { label: "Final Result", status: "locked", note: "" },
];

function formatDate(value) {
  if (!value) return "15 Jan 2024";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return String(value);
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function ProgressIcon({ status }) {
  if (status === "completed") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B8A8C] text-white">
        <Check size={18} />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-[6px] border-[#0B8A8C] bg-white">
        <div className="h-2.5 w-2.5 rounded-full bg-[#0B8A8C]" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4E7EC] text-[#98A2B3]">
      <Lock size={16} />
    </div>
  );
}

export default function CandidateDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationsRef = useRef(null);
  const [dashboardData, setDashboardData] = useState({
    candidateName: "Rahul",
    statusBadge: "PI Scheduled",
    jobTitle: "Management Trainee - Sales",
    gdScore: 27,
    gdMax: 30,
    interviewTitle: "Personal Interview Scheduled",
    interviewDescription:
      "Your Personal Interview is scheduled for 14th Feb, 10:00 AM. Panelist: Ms. Kavita Das.",
    progressItems: defaultProgressItems,
    quickInfo: {
      applicationId: "CAND-001",
      appliedOn: "15 Jan 2024",
      institute: "IIM Bangalore",
    },
    notifications: defaultNotifications,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setLoadError("");

      const savedApplication = readSavedCandidateApplication();
      let candidate = null;
      let apiError = "";

      try {
        candidate = await fetchLoggedInCandidate();
      } catch (error) {
        console.error("Candidate fetch failed:", error);
        apiError = "Live candidate data is unavailable. Showing saved details.";
      }

      const candidateName =
        savedApplication?.personal?.fullName ||
        candidate?.name ||
        localStorage.getItem("candidate_name") ||
        "Rahul";

      const jobTitle =
        savedApplication?.meta?.appliedRole ||
        candidate?.AssignedJob ||
        "Management Trainee - Sales";

      const statusBadge = savedApplication?.interviewDetails
        ? "PI Scheduled"
        : savedApplication?.applicationStatus || "PI Scheduled";

      const gdScore = Number(savedApplication?.gdScore ?? 27) || 27;
      const gdMax = Number(savedApplication?.gdMax ?? 30) || 30;

      const interviewDate = savedApplication?.interviewDetails?.date || "14th Feb";
      const interviewTime = savedApplication?.interviewDetails?.time || "10:00 AM";
      const interviewPanelist =
        savedApplication?.interviewDetails?.panelist || "Ms. Kavita Das";

      const applicationId =
        savedApplication?.meta?.applicationId ||
        (candidate?._id
          ? `CAND-${String(candidate._id).slice(-3).toUpperCase().padStart(3, "0")}`
          : "CAND-001");

      const appliedOn = savedApplication?.meta?.appliedOn || formatDate(candidate?.createdAt);
      const institute = savedApplication?.meta?.institute || candidate?.college || "IIM Bangalore";

      const notifications =
        Array.isArray(savedApplication?.notifications) && savedApplication.notifications.length > 0
          ? savedApplication.notifications
          : defaultNotifications;

      const progressItems = [...defaultProgressItems];
      if (statusBadge === "Shortlisted") {
        progressItems[3] = { label: "PI Round", status: "completed", note: "Completed" };
        progressItems[4] = { label: "Final Result", status: "active", note: "Shortlisted" };
      } else if (statusBadge === "Regret") {
        progressItems[3] = { label: "PI Round", status: "completed", note: "Completed" };
        progressItems[4] = { label: "Final Result", status: "active", note: "Regret" };
      }

      if (isMounted) {
        setDashboardData({
          candidateName,
          statusBadge,
          jobTitle,
          gdScore,
          gdMax,
          interviewTitle: "Personal Interview Scheduled",
          interviewDescription: `Your Personal Interview is scheduled for ${interviewDate}, ${interviewTime}. Panelist: ${interviewPanelist}.`,
          progressItems,
          quickInfo: {
            applicationId,
            appliedOn,
            institute,
          },
          notifications,
        });
        setLoadError(apiError);
        setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      ) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
    };
  }, [isNotificationsOpen]);

  const firstName = useMemo(() => {
    const sourceName = String(dashboardData.candidateName || "").trim();
    if (!sourceName) return "Rahul";
    return sourceName.split(" ")[0];
  }, [dashboardData.candidateName]);

  const gdProgress = useMemo(() => {
    if (!dashboardData.gdMax) return 0;
    return Math.max(0, Math.min(100, (dashboardData.gdScore / dashboardData.gdMax) * 100));
  }, [dashboardData.gdScore, dashboardData.gdMax]);

  const unreadNotificationsCount = useMemo(() => {
    const count = dashboardData.notifications.filter((notification) => notification.unread).length;
    return count > 0 ? count : 1;
  }, [dashboardData.notifications]);

  const handleLogout = () => {
    localStorage.removeItem("candidate_auth");
    localStorage.removeItem("candidate_name");
    localStorage.removeItem("candidate_email");
    localStorage.removeItem("candidate_id");
    navigate("/login");
  };

  const toggleNotifications = () => {
    setIsNotificationsOpen((previous) => !previous);
  };

  const openNotifications = () => {
    setIsNotificationsOpen(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getNotificationAccent = (type) => {
    if (type === "Shortlisted") return "border-[#86EFAC] bg-[#ECFDF3] text-[#166534]";
    if (type === "Regret") return "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]";
    return "border-[#A4C8FF] bg-[#E7F0FF] text-[#1E3A8A]";
  };

  return (
    <div
      className="min-h-screen bg-white text-[#0A0A0A]"
      style={{ fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif' }}
    >
      <header className="border-b border-[#D6D6DC] bg-white">
        <div className="mx-auto flex h-16 max-w-325 items-center justify-between px-4 sm:px-6">
          <img src={awlLogo} alt="AWL logo" className="h-10 w-auto" />

          <div className="flex items-center gap-1 sm:gap-2" ref={notificationsRef}>
            <div className="relative">
              <button
                type="button"
                onClick={toggleNotifications}
                className="relative rounded-full p-2 text-[#111827] transition hover:bg-[#F3F4F6]"
                aria-label="View notifications"
              >
                <Bell size={19} />
                <span className="absolute right-0.5 top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FF3B3B] px-1 text-[11px] font-semibold text-white">
                  {unreadNotificationsCount}
                </span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 z-50 mt-2 w-[310px] rounded-2xl border border-[#D6D6DC] bg-white p-3 shadow-[0_12px_30px_rgba(15,23,42,0.12)] sm:w-90">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-[#001F3F]">Notifications</h4>
                    <button
                      type="button"
                      onClick={() => setIsNotificationsOpen(false)}
                      className="rounded-md px-2 py-1 text-xs font-medium text-[#475467] hover:bg-[#F2F4F7]"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-2">
                    {dashboardData.notifications.map((notification) => (
                      <div
                        key={`${notification.type}-${notification.message}`}
                        className={`rounded-xl border px-3 py-2 ${getNotificationAccent(
                          notification.type,
                        )}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{notification.type}</p>
                          {notification.unread && (
                            <span className="rounded-full bg-[#FF3B3B] px-2 py-0.5 text-[10px] font-semibold text-white">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs leading-5">{notification.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full p-2 text-[#111827] transition hover:bg-[#F3F4F6]"
              aria-label="Logout"
            >
              <LogOut size={19} />
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 pb-10 pt-8 sm:px-6">
        <div className="mx-auto max-w-[500px]">
          <h1 className="text-3xl font-bold text-[#001F3F] sm:text-4xl">
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-base text-[#4A5565] sm:text-[20px]">
            Let&apos;s check your status.
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
              <section className="mt-6 rounded-2xl border-2 border-[#0B8A8C] bg-[#D6E8EC] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-bold text-[#001F3F] sm:text-[32px]">
                    Application Status
                  </h2>
                  <span className="rounded-full border border-[#D8B4FE] bg-[#EBD8FF] px-4 py-1 text-sm font-medium text-[#7E22CE]">
                    {dashboardData.statusBadge}
                  </span>
                </div>

                <p className="mt-8 text-xl text-[#1E3A5F] sm:text-[30px]">
                  Job: {dashboardData.jobTitle}
                </p>

                <div className="mt-8">
                  <div className="mb-2 flex items-center justify-between text-sm sm:text-[24px]">
                    <span className="text-[#334155]">GD Score</span>
                    <span className="font-semibold text-[#0B8A8C]">
                      {dashboardData.gdScore}/{dashboardData.gdMax}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#9FAAB1]">
                    <div
                      className="h-2 rounded-full bg-[#040B2A]"
                      style={{ width: `${gdProgress}%` }}
                    />
                  </div>
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-[#A4C8FF] bg-[#E7F0FF] px-4 py-5 text-[#1E3A8A] sm:px-5">
                <div className="flex items-start gap-3">
                  <CircleAlert size={22} className="mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold sm:text-[28px]">
                      {dashboardData.interviewTitle}
                    </h3>
                    <p className="mt-1 text-sm sm:text-[22px]">
                      {dashboardData.interviewDescription}
                    </p>
                  </div>
                </div>
              </section>

              <section className="mt-6 rounded-2xl border border-[#D6D6DC] bg-white p-5 sm:p-6">
                <h3 className="text-2xl font-bold text-[#001F3F] sm:text-[32px]">
                  Application Progress
                </h3>

                <div className="mt-6">
                  {dashboardData.progressItems.map((item, index) => {
                    const isLast = index === dashboardData.progressItems.length - 1;
                    const nextStatus = !isLast
                      ? dashboardData.progressItems[index + 1].status
                      : "locked";
                    const connectorColor =
                      nextStatus === "locked" ? "border-[#D1D5DB]" : "border-[#0B8A8C]";

                    return (
                      <div key={item.label} className={`relative pl-12 ${isLast ? "" : "pb-8"}`}>
                        {!isLast && (
                          <div
                            className={`absolute left-[15px] top-9 h-[calc(100%-22px)] border-l-2 ${connectorColor}`}
                          />
                        )}

                        <div className="absolute left-0 top-0">
                          <ProgressIcon status={item.status} />
                        </div>

                        <p
                          className={`text-xl font-semibold sm:text-[30px] ${
                            item.status === "locked" ? "text-[#98A2B3]" : "text-[#001F3F]"
                          }`}
                        >
                          {item.label}
                        </p>
                        {item.note && (
                          <p className="mt-0.5 text-sm text-[#0B5E82] sm:text-[22px]">
                            {item.note}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <div className="mt-6 space-y-2">
                <button
                  type="button"
                  onClick={() => navigate("/candidate/application")}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0B8A8C] px-4 text-[16px] font-semibold text-white transition hover:bg-[#087578]"
                >
                  <FileText size={16} />
                  View Application
                </button>

                <button
                  type="button"
                  onClick={openNotifications}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[#0B8A8C] bg-transparent px-4 text-[16px] font-semibold text-[#0B8A8C] transition hover:bg-[#E8F5F5]"
                >
                  <Bell size={16} />
                  View All Notifications
                </button>
              </div>

              <section className="mt-6 rounded-2xl border border-[#D6D6DC] bg-white p-5 sm:p-6">
                <h4 className="text-lg font-semibold text-[#344054] sm:text-[24px]">Quick Info</h4>

                <div className="mt-5 space-y-3 text-sm sm:text-[22px]">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#4B5563]">Application ID:</span>
                    <span className="font-medium text-[#001F3F]">
                      {dashboardData.quickInfo.applicationId}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#4B5563]">Applied On:</span>
                    <span className="font-medium text-[#001F3F]">
                      {dashboardData.quickInfo.appliedOn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-[#4B5563]">Institute:</span>
                    <span className="font-medium text-[#001F3F]">
                      {dashboardData.quickInfo.institute}
                    </span>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
