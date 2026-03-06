import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchLoggedInCandidate,
  readSavedCandidateApplication,
} from "../utils/candidateData";
import { resolveRecruitmentFlowTemplate } from "../utils/recruitmentFlowTemplates";

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
  { label: "Aptitude Test", status: "completed", note: "" },
  { label: "GD Round", status: "completed", note: "" },
  { label: "PI Round", status: "active", note: "PI Scheduled" },
  { label: "Final Selection", status: "locked", note: "" },
];

const formatDate = (value) => {
  if (!value) return "15 Jan 2024";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return String(value);
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCandidateAssignedRoles = (candidate) => {
  const assignedJobs = Array.isArray(candidate?.AssignedJobs)
    ? candidate.AssignedJobs.map((job) => String(job || "").trim()).filter(Boolean)
    : [];
  if (assignedJobs.length > 0) return assignedJobs;

  const fallback = String(candidate?.AssignedJob || "").trim();
  return fallback ? [fallback] : [];
};

const getCandidateDriveReferences = (candidate) =>
  [
    candidate?.driveId,
    candidate?.assignedDriveId,
    candidate?.DriveID,
    candidate?.AssignedDriveId,
  ]
    .filter(Boolean)
    .map((value) => String(value));

const normalizeFlowStages = (rawStages = []) => {
  const cleaned = Array.from(
    new Set(
      (rawStages || [])
        .map((stage) => String(stage || "").trim())
        .filter(Boolean),
    ),
  );

  if (cleaned.length === 0) {
    return defaultProgressItems.map((item) => item.label);
  }

  if (!cleaned.some((stage) => stage.toLowerCase().includes("application"))) {
    return ["Application Submitted", ...cleaned];
  }

  return cleaned;
};

const findStageIndex = (stages, matcher) =>
  stages.findIndex((stage) => matcher(String(stage || "").toLowerCase()));

const resolveActiveIndex = (stages, statusBadge) => {
  const normalizedStatus = String(statusBadge || "").toLowerCase();

  if (normalizedStatus.includes("shortlisted") || normalizedStatus.includes("regret")) {
    return Math.max(0, stages.length - 1);
  }

  const piIndex = findStageIndex(stages, (stage) => stage.includes("pi") || stage.includes("interview"));
  if (normalizedStatus.includes("pi") && piIndex >= 0) return piIndex;

  const gdIndex = findStageIndex(stages, (stage) => stage.includes("gd") || stage.includes("group"));
  if (normalizedStatus.includes("gd") && gdIndex >= 0) return gdIndex;

  const aptitudeIndex = findStageIndex(stages, (stage) => stage.includes("aptitude"));
  if (normalizedStatus.includes("aptitude") && aptitudeIndex >= 0) return aptitudeIndex;

  return Math.min(1, Math.max(0, stages.length - 1));
};

const buildProgressItems = ({ stages, statusBadge }) => {
  const flowStages = normalizeFlowStages(stages);
  const activeIndex = resolveActiveIndex(flowStages, statusBadge);
  const normalizedStatus = String(statusBadge || "").toLowerCase();

  return flowStages.map((label, index) => {
    const status =
      index < activeIndex ? "completed" : index === activeIndex ? "active" : "locked";

    let note = "";
    if (status === "active") {
      if (normalizedStatus.includes("shortlisted")) note = "Shortlisted";
      else if (normalizedStatus.includes("regret")) note = "Regret";
      else note = statusBadge || "";
    }

    return { label, status, note };
  });
};

export default function useCandidateDashboard({ navigate }) {
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
        getCandidateAssignedRoles(candidate)[0] ||
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

      const assignedRoles = getCandidateAssignedRoles(candidate);
      const flowTemplate =
        assignedRoles
          .map((roleName) =>
            resolveRecruitmentFlowTemplate({
              driveRefs: getCandidateDriveReferences(candidate),
              jobName: roleName,
            }),
          )
          .find(Boolean) ||
        resolveRecruitmentFlowTemplate({
          driveRefs: getCandidateDriveReferences(candidate),
          jobName: jobTitle,
        });
      const progressItems = buildProgressItems({
        statusBadge,
        stages: flowTemplate?.stages,
      });

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
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
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

  const closeNotifications = () => {
    setIsNotificationsOpen(false);
  };

  const getNotificationAccent = (type) => {
    if (type === "Shortlisted") return "border-[#86EFAC] bg-[#ECFDF3] text-[#166534]";
    if (type === "Regret") return "border-[#FECACA] bg-[#FEF2F2] text-[#991B1B]";
    return "border-[#A4C8FF] bg-[#E7F0FF] text-[#1E3A8A]";
  };

  return {
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
  };
}
