import {
  Award,
  Briefcase,
  Check,
  Link2,
  Lock,
  MapPin,
  MessageSquare,
  UserCheck,
  Users,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

function getStageIndex(drive, jobRows) {
  const normalizedStatus = String(drive?.Status || "").toLowerCase();
  const totalSelected = Number(drive?.Selected) || 0;
  const totalCandidates = Array.isArray(drive?.CandidateIDs)
    ? drive.CandidateIDs.length
    : Number(drive?.NumberOfCandidates) || 0;
  const hasJobs = Array.isArray(jobRows) && jobRows.length > 0;
  const hasPanelists = (jobRows || []).some(
    (row) => Array.isArray(row?.panelists) && row.panelists.length > 0,
  );
  const aptitudeStatus = String(drive?.AptitudeStatus || "").toLowerCase();
  const aptitudeSent =
    Boolean(String(drive?.AptitudeTestLink || drive?.AptitudeLink || "").trim()) ||
    Boolean(drive?.AptitudeSentAt) ||
    Number(drive?.AptitudeSentCount || 0) > 0 ||
    aptitudeStatus.includes("sent");
  const gdStatus = String(drive?.GDStatus || "").toLowerCase();
  const gdStarted = gdStatus.includes("in progress") || gdStatus.includes("completed");
  const piStatus = String(drive?.PIStatus || "").toLowerCase();
  const piStarted = hasPanelists || piStatus.includes("in progress") || piStatus.includes("completed");

  if (totalSelected > 0 || normalizedStatus.includes("closed")) return 6;
  if (piStarted) return 5;
  if (gdStarted) return 4;
  if (aptitudeSent) return 3;
  if (totalCandidates > 0) return 2;
  if (hasJobs) return 1;
  return 0;
}

function StageIcon({ status, colors }) {
  if (status === "completed") {
    return (
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: colors.stonewash }}
      >
        <Check size={18} />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full border-[6px] bg-white"
        style={{ borderColor: colors.rainShadow }}
      >
        <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colors.rainShadow }} />
      </div>
    );
  }

  return (
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E4E7EC] text-[#98A2B3]">
      <Lock size={16} />
    </div>
  );
}

export default function DriveRecruitmentFlow({ drive, jobRows, colors }) {
  const navigate = useNavigate();
  const { driveId } = useParams();

  const currentStageIndex = getStageIndex(drive, jobRows);
  const primaryJobName = String(jobRows?.[0]?.jobName || "").trim();
  const driveObjectId = driveId || String(drive?._id || drive?.id || "");

  const stages = [
    {
      key: "create_drive",
      label: "Create Drive",
      note: "Setup drive details",
      icon: MapPin,
      action: () => navigate("/HR/dashboard/Drives"),
      enabled: true,
    },
    {
      key: "assign_jobs",
      label: "Assign Jobs",
      note: "Map roles to this drive",
      icon: Briefcase,
      action: () => navigate("/HR/dashboard/Create-Job", { state: { fromDrives: true } }),
      enabled: true,
    },
    {
      key: "assign_candidates",
      label: "Assign Candidates",
      note: "Map candidates under this drive-job",
      icon: Users,
      action: () => {
        if (!primaryJobName || !driveObjectId) return;
        navigate(`/HR/dashboard/drive/${driveObjectId}/job/${encodeURIComponent(primaryJobName)}/candidates`, {
          state: {
            JobName: primaryJobName,
            CollegeName: drive?.CollegeName || "",
          },
        });
      },
      enabled: Boolean(primaryJobName && driveObjectId),
    },
    {
      key: "aptitude_test",
      label: "Aptitude Test",
      note: "Send aptitude test link",
      icon: Link2,
      action: () =>
        navigate("/HR/dashboard/Aptitude-Test-Management", {
          state: {
            driveId: driveObjectId,
            jobName: primaryJobName,
          },
        }),
      enabled: Boolean(primaryJobName && driveObjectId),
    },
    {
      key: "gd_round",
      label: "GD Round",
      note: "Run group discussion rounds",
      icon: MessageSquare,
      action: () => navigate("/HR/dashboard/Manage-Panelists"),
      enabled: true,
    },
    {
      key: "pi_round",
      label: "PI Round",
      note: "Assign panelists and schedule PI",
      icon: UserCheck,
      action: () => navigate("/HR/dashboard/Manage-Panelists"),
      enabled: true,
    },
    {
      key: "final_selection",
      label: "Final Selection",
      note: "Complete and close drive",
      icon: Award,
      action: () => navigate("/HR/dashboard/Offer-Approvals"),
      enabled: true,
    },
  ];

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-5 sm:p-6 shadow-lg mb-8">
      <div className="mb-5">
        <h3 className="text-xl font-bold" style={{ color: colors.stonewash }}>
          Recruitment Flow
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Step {currentStageIndex + 1} of {stages.length} in this drive lifecycle.
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px]">
          <div className="flex items-start">
            {stages.map((stage, index) => {
              const status =
                index < currentStageIndex
                  ? "completed"
                  : index === currentStageIndex
                    ? "active"
                    : "locked";
              const Icon = stage.icon;
              const connectorColor =
                index < currentStageIndex ? colors.rainShadow : "#D1D5DB";

              return (
                <div key={stage.key} className="flex items-start flex-1">
                  <button
                    type="button"
                    className={`text-left flex-1 ${stage.enabled ? "cursor-pointer" : "cursor-not-allowed opacity-70"}`}
                    onClick={() => stage.enabled && stage.action()}
                    disabled={!stage.enabled}
                  >
                    <div className="flex items-center gap-3">
                      <StageIcon status={status} colors={colors} />
                      <div>
                        <p
                          className={`text-base font-semibold ${
                            status === "locked" ? "text-[#98A2B3]" : "text-[#001F3F]"
                          }`}
                        >
                          {stage.label}
                        </p>
                        <p className="text-xs text-[#4A5565] flex items-center gap-1">
                          <Icon size={12} />
                          {stage.note}
                        </p>
                      </div>
                    </div>
                  </button>

                  {index < stages.length - 1 ? (
                    <div className="mt-4 mx-2 h-[2px] w-10 lg:w-14" style={{ backgroundColor: connectorColor }} />
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
