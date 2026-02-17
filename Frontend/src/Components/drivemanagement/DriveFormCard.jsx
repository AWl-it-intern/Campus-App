// components/drivemanagement/DriveFormCard.jsx
import React from 'react';
import { Plus, MapPin, Calendar, Briefcase } from 'lucide-react';

/**
 * DriveFormCard Component
 * Form for creating new campus drives
 * 
 * @param {object} newDrive - Drive form state object
 * @param {function} setNewDrive - State setter for drive form
 * @param {function} createDrive - Function to create new drive
 * @param {array} jobs - List of available jobs
 * @param {object} colors - Color palette object
 */
export const DriveFormCard = ({ 
  newDrive, 
  setNewDrive, 
  createDrive,
  jobs,
  colors 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.rainShadow + "20" }}
        >
          <Plus size={24} style={{ color: colors.rainShadow }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: colors.stonewash }}>
            Create New Campus Drive
          </h2>
          <p className="text-sm text-gray-600">Schedule a new campus recruitment drive</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drive ID *
          </label>
          <input
            type="text"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="e.g., DRV001"
            value={newDrive.driveId}
            onChange={(e) => setNewDrive({ ...newDrive, driveId: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Job *
          </label>
          <div className="relative">
            <Briefcase size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <select
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all appearance-none bg-white"
              value={newDrive.jobId}
              onChange={(e) => setNewDrive({ ...newDrive, jobId: e.target.value })}
            >
              <option value="">Choose a job</option>
              {jobs.map(job => (
                <option key={job.JobID} value={job.JobID}>
                  {job.JobID} - {job.JobName}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            College Name *
          </label>
          <div className="relative">
            <MapPin size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
              placeholder="e.g., IIT Bombay"
              value={newDrive.collegeName}
              onChange={(e) => setNewDrive({ ...newDrive, collegeName: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drive Date *
          </label>
          <div className="relative">
            <Calendar size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="date"
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
              value={newDrive.driveDate}
              onChange={(e) => setNewDrive({ ...newDrive, driveDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all appearance-none bg-white"
            value={newDrive.status}
            onChange={(e) => setNewDrive({ ...newDrive, status: e.target.value })}
          >
            <option value="Draft">Draft</option>
            <option value="Live">Live</option>
            <option value="GD Completed">GD Completed</option>
            <option value="PI Completed">PI Completed</option>
            <option value="Results Released">Results Released</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="e.g., Mumbai, Maharashtra"
            value={newDrive.location}
            onChange={(e) => setNewDrive({ ...newDrive, location: e.target.value })}
          />
        </div>
      </div>

      <button
        onClick={createDrive}
        className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
        style={{ backgroundColor: colors.rainShadow }}
      >
        <div className="flex items-center justify-center gap-2">
          <Plus size={20} />
          <span>Create Drive</span>
        </div>
      </button>
    </div>
  );
};

export default DriveFormCard;
