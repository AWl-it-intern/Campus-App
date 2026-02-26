// Components/gdpi/GDPIResultsView.jsx

import AssessmentProgressCard from "../dashboard/AssessmentProgressCard.jsx";

const DEFAULT_COLORS = {
  stonewash: "#003329",
  softFlow: "#6AE8D3",
  mossRock: "#66D095",
  goldenHour: "#DEBF6C",
  marigoldFlame: "#FFAD53",
  clayPot: "#E0B9AD",
  rainShadow: "#00988D",
};

const DEFAULT_ASSESSMENT_PROGRESS = [
  {
    title: "Group Discussion",
    completed: 3,
    total: 4,
    pending: 1,
    color: DEFAULT_COLORS.rainShadow,
  },
  {
    title: "Personal Interview",
    completed: 2,
    total: 4,
    pending: 2,
    color: DEFAULT_COLORS.marigoldFlame,
  },
];

/**
 * GDPIResultsView
 *
 * Props:
 * - assessmentProgress: Array<{ title, completed, total, pending, color }>
 * - colors: palette object with keys: stonewash, marigoldFlame, mossRock, rainShadow, etc.
 * - heading: optional heading text (default: "GD & PI Results View")
 * - description: optional description below heading
 * - className: extra wrapper classes
 */
export default function GDPIResultsView({
  assessmentProgress = DEFAULT_ASSESSMENT_PROGRESS,
  colors = DEFAULT_COLORS,
  heading = "GD & PI Results View",
  description = "Track interview progress and completion status by round",
  className = "",
}) {
  const totalAssessments = assessmentProgress.reduce(
    (sum, a) => sum + (Number(a.total) || 0),
    0,
  );
  const completedAssessments = assessmentProgress.reduce(
    (sum, a) => sum + (Number(a.completed) || 0),
    0,
  );
  const pendingAssessments = assessmentProgress.reduce(
    (sum, a) => sum + (Number(a.pending) || 0),
    0,
  );

  return (
    <section className={`mb-8 ${className}`}>
      <div className="mb-6">
        <h3
          className="text-2xl font-bold mb-2"
          style={{ color: colors.stonewash }}
        >
          {heading}
        </h3>
        {description && <p className="text-gray-600">{description}</p>}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Completed</p>
            <p className="text-2xl font-bold" style={{ color: colors.mossRock }}>
              {completedAssessments}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-bold" style={{ color: colors.marigoldFlame }}>
              {pendingAssessments}
            </p>
          </div>
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Total</p>
            <p className="text-2xl font-bold" style={{ color: colors.stonewash }}>
              {totalAssessments}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {assessmentProgress.map((assessment, idx) => (
            <AssessmentProgressCard key={idx} assessment={assessment} />
          ))}
        </div>
      </div>
    </section>
  );
}
