import React from 'react';

/**
 * Reusable RecentApplicationCard Component
 * Displays a single recent application with details
 * 
 * @param {object} application - Application data object
 * @param {function} onClick - Click handler function
 */
const RecentApplicationCard = ({ application, onClick }) => {
  return (
    <div
      className="card bg-gray-50 hover:bg-gray-100 cursor-pointer transition-all duration-300 hover:shadow-md"
      onClick={() => onClick(application)}
    >
      <div className="card-body p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-800 truncate">
                {application.name}
              </h4>
              <span 
                className="badge badge-sm font-medium shrink-0"
                style={{ 
                  backgroundColor: application.statusColor + '20',
                  color: application.statusColor,
                  border: 'none'
                }}
              >
                {application.status}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-1 mb-1">
              {application.college}
            </p>
            <p className="text-xs text-gray-500">
              {application.email ? `Email: ${application.email}` : `Applied: ${application.date}`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecentApplicationCard;
