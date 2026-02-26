// components/drivemanagement/DriveQuickActionCard.jsx

import { ChevronRight } from 'lucide-react';

/**
 * DriveQuickActionCard Component
 * Quick action cards for drive-specific actions
 * 
 * @param {string} title - Card title
 * @param {string} subtitle - Card subtitle
 * @param {Component} icon - Lucide icon component
 * @param {string} color - Card accent color
 * @param {function} onClick - Click handler
 */
export const DriveQuickActionCard = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  color,
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className="card bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer w-full text-left group"
    >
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div 
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
              style={{ backgroundColor: color + '20' }}
            >
              <Icon size={28} color={color} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-gray-800 mb-1 text-lg">
                {title}
              </h4>
              <p className="text-sm text-gray-600">
                {subtitle}
              </p>
            </div>
          </div>
          <ChevronRight 
            size={24} 
            className="text-gray-400 group-hover:text-gray-600 transition-all group-hover:translate-x-1" 
          />
        </div>
      </div>
    </button>
  );
};

export default DriveQuickActionCard;
