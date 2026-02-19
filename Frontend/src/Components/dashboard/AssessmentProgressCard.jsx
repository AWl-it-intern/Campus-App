import React from "react";
import { CheckCircle2, Clock3, Gauge } from "lucide-react";

/**
 * Reusable AssessmentProgressCard Component
 * Displays assessment progress with a progress bar and stats
 * 
 * @param {object} assessment - Assessment data with title, completed, total, pending, and color
 */
const AssessmentProgressCard = ({ assessment }) => {
  const percentage = assessment.total > 0
    ? Math.round((assessment.completed / assessment.total) * 100)
    : 0;

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-5 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-gray-800">{assessment.title}</h4>
          <p className="text-sm text-gray-500 mt-1">Assessment completion</p>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
          style={{
            backgroundColor: `${assessment.color}20`,
            color: assessment.color,
          }}
        >
          <Gauge size={14} />
          <span>{percentage}%</span>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold" style={{ color: assessment.color }}>
            {assessment.completed}/{assessment.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: assessment.color,
            }}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-white p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Completed</p>
          <p className="text-xl font-bold flex items-center gap-1" style={{ color: assessment.color }}>
            <CheckCircle2 size={16} />
            {assessment.completed}
          </p>
        </div>
        <div className="rounded-lg bg-white p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Pending</p>
          <p className="text-xl font-bold text-gray-500 flex items-center gap-1">
            <Clock3 size={16} />
            {assessment.pending}
          </p>
        </div>
        <div className="rounded-lg bg-white p-3 border border-gray-100">
          <p className="text-xs text-gray-500 mb-1">Total</p>
          <p className="text-xl font-bold text-gray-800">{assessment.total}</p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentProgressCard;
