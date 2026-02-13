import React from 'react';

/**
 * Reusable StatusBar Component
 * Displays application status with individual status items and a visual progress bar
 * 
 * @param {Array} statusData - Array of status objects with label, count, and color
 * @param {string} primaryColor - Primary color from the color palette
 */
const StatusBar = ({ statusData, primaryColor }) => {
  return (
    <div className="card bg-white shadow-lg">
      <div className="card-body p-6">
        <h3 className="text-xl font-bold mb-4" style={{ color: primaryColor }}>
          Application Status
        </h3>
        
        <div className="space-y-3">
          {statusData.map((status, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: status.color }}
                ></div>
                <span className="text-gray-700">{status.label}</span>
              </div>
              <span 
                className="badge badge-lg font-semibold"
                style={{ 
                  backgroundColor: status.color + '20',
                  color: status.color,
                  border: 'none'
                }}
              >
                {status.count}
              </span>
            </div>
          ))}
        </div>

        {/* Visual Progress Bar */}
        <div className="mt-6">
          <div className="flex h-3 rounded-full overflow-hidden bg-gray-200">
            {statusData.map((status, index) => {
              const total = statusData.reduce((sum, s) => sum + s.count, 0);
              const percentage = total > 0 ? (status.count / total) * 100 : 0;
              return percentage > 0 ? (
                <div
                  key={index}
                  className="transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: status.color
                  }}
                ></div>
              ) : null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;
