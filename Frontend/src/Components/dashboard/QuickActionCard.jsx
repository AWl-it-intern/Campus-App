import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Reusable QuickActionCard Component
 * Displays an action card with icon, title, subtitle and handles click actions
 * 
 * @param {string} title - The title of the action
 * @param {string} subtitle - Subtitle text (e.g., count info)
 * @param {Component} icon - Lucide icon component
 * @param {string} color - Color for the icon background
 * @param {function} action - Optional click handler function
 * @param {string} path - Optional navigation path
 */
const QuickActionCard = ({ title, subtitle, icon: Icon, color, action, path }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (action) {
      action();
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="card bg-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer w-full text-left"
    >
      <div className="card-body p-6">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0"
            style={{ backgroundColor: color + '20' }}
          >
            <Icon size={24} color={color} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-800 mb-1">
              {title}
            </h4>
            <p className="text-sm text-gray-600 line-clamp-2">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
};

export default QuickActionCard;
