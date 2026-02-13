// import React from 'react'; 

/**
 * Reusable EmptyState Component
 * Displays an empty state with icon and message
 * 
 * @param {Component} icon - Lucide icon component
 * @param {string} title - Empty state title
 * @param {string} message - Empty state message
 */
const EmptyState = ({ title, message }) => {
  return (
    <div className="text-center py-8 text-gray-500">
      <Icon size={48} className="mx-auto mb-3 text-gray-300" />
      <p className="text-lg font-medium">{title}</p>
      {message && <p className="text-sm">{message}</p>}
    </div>
  );
};

export default EmptyState;
