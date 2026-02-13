// components/panelists/PanelistFormCard.jsx
import React from 'react';
import { UserPlus, Users, Mail, Building2 } from 'lucide-react';

/**
 * PanelistFormCard Component
 * Form for creating new panelists in the CreatePanelist page
 * 
 * @param {object} newPanelist - Panelist form state object
 * @param {function} setNewPanelist - State setter for panelist form
 * @param {function} createPanelist - Function to create new panelist
 * @param {object} colors - Color palette object
 */
export const PanelistFormCard = ({ 
  newPanelist, 
  setNewPanelist, 
  createPanelist, 
  colors 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.softFlow + "20" }}
        >
          <UserPlus size={24} style={{ color: colors.softFlow }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: colors.stonewash }}>
            Add New Panelist
          </h2>
          <p className="text-sm text-gray-600">Fill in the details below</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <div className="relative">
            <Users size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
              placeholder="Enter panelist name"
              value={newPanelist.name}
              onChange={(e) => setNewPanelist({ ...newPanelist, name: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
              placeholder="Enter email"
              value={newPanelist.email}
              onChange={(e) => setNewPanelist({ ...newPanelist, email: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Designation *
          </label>
          <div className="relative">
            <Building2 size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
              placeholder="e.g., Senior Manager"
              value={newPanelist.designation}
              onChange={(e) => setNewPanelist({ ...newPanelist, designation: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Area of Expertise *
          </label>
          <input
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="e.g., Software Development"
            value={newPanelist.expertise}
            onChange={(e) => setNewPanelist({ ...newPanelist, expertise: e.target.value })}
          />
        </div>
      </div>

      <button
        onClick={createPanelist}
        className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
        style={{ backgroundColor: colors.softFlow }}
      >
        <div className="flex items-center justify-center gap-2">
          <UserPlus size={20} />
          <span>Create Panelist</span>
        </div>
      </button>
    </div>
  );
};

export default PanelistFormCard;
