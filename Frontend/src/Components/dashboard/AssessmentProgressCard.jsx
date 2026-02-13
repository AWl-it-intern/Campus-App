import React from 'react';

/**
 * Reusable AssessmentProgressCard Component
 * Displays assessment progress with a progress bar and stats
 * 
 * @param {object} assessment - Assessment data with title, completed, total, pending, and color
 */
const AssessmentProgressCard = ({ assessment }) => {
  const percentage = (assessment.completed / assessment.total) * 100;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h4 className="font-semibold text-gray-800 mb-4">
        {assessment.title}
      </h4>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold" style={{ color: assessment.color }}>
            {assessment.completed}/{assessment.total}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full transition-all duration-500 rounded-full"
            style={{
              width: `${percentage}%`,
              backgroundColor: assessment.color
            }}
          ></div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600 mb-1">Completed</p>
          <p className="text-2xl font-bold" style={{ color: assessment.color }}>
            {assessment.completed}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-400">
            {assessment.pending}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssessmentProgressCard;
