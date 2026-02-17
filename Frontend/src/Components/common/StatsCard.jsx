// import React from 'react'; 

/**
 * Reusable StatsCard Component
 * Displays a statistic with an icon and background color
 * 
 * @param {string} title - The title of the stat
 * @param {number} count - The count/value to display
 * @param {Component} icon - Lucide icon component
 * @param {string} bgColor - Background color for the icon
 * @param {string} lightBg - Light background color for the card
 */
const StatsCard = ({ title, count , bgColor, lightBg ,icon: Icon  }) => {
  return (
    <div 
      className="card bg-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      <div className="card-body p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm mb-1">{title}</p>
            <h3 className="text-3xl font-bold" style={{ color: bgColor }}>
              {count}
            </h3>
          </div>
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: lightBg }}
          >
            <Icon size={32} color={bgColor} />  
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
