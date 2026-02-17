// components/drivemanagement/DriveTableRow.jsx
import React from 'react';
import { MapPin, Edit, UserCheck, XCircle, Calendar } from 'lucide-react';

/**
 * DriveTableRow Component
 * Single row in the drives table
 * 
 * @param {object} drive - Drive data object
 * @param {function} getJobName - Get job name by ID
 * @param {function} openEditModal - Open edit modal
 * @param {function} closeDrive - Close drive function
 * @param {object} colors - Color palette object
 */
export const DriveTableRow = ({ 
  drive, 
  getJobName,
  openEditModal,
  closeDrive,
  colors 
}) => {
  // Status badge configuration
  const getStatusBadge = (status) => {
    const statusConfig = {
      'Draft': { bg: colors.clayPot + '40', text: colors.stonewash },
      'Live': { bg: colors.mossRock + '40', text: colors.stonewash },
      'GD Completed': { bg: colors.softFlow + '40', text: colors.stonewash },
      'PI Completed': { bg: colors.goldenHour + '40', text: colors.stonewash },
      'Results Released': { bg: colors.rainShadow + '40', text: colors.stonewash },
      'Closed': { bg: '#E5E7EB', text: '#6B7280' }
    };

    const config = statusConfig[status] || statusConfig['Draft'];
    
    return (
      <span 
        className="px-3 py-1 rounded-lg text-xs font-medium"
        style={{ backgroundColor: config.bg, color: config.text }}
      >
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <span 
          className="px-3 py-1 rounded-lg text-sm font-semibold"
          style={{ 
            backgroundColor: colors.rainShadow + '20',
            color: colors.rainShadow
          }}
        >
          {drive.driveId}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <MapPin size={18} style={{ color: colors.mossRock }} />
          <span className="font-semibold text-gray-800">{drive.collegeName}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 text-gray-700">
          <Calendar size={16} className="text-gray-400" />
          {formatDate(drive.driveDate)}
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm text-gray-600">{getJobName(drive.jobId)}</span>
      </td>
      <td className="px-6 py-4">
        {getStatusBadge(drive.status)}
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-semibold text-gray-800">{drive.registrations || 0}</span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-semibold" style={{ color: colors.rainShadow }}>
          {drive.shortlisted || 0}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        <span className="font-semibold" style={{ color: colors.mossRock }}>
          {drive.selected || 0}
        </span>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(drive)}
            className="px-3 py-1.5 rounded-lg font-medium text-white text-sm hover:opacity-90 transition-all"
            style={{ backgroundColor: colors.softFlow }}
          >
            <div className="flex items-center gap-1">
              <Edit size={14} />
              <span>Edit</span>
            </div>
          </button>
          {drive.status !== 'Closed' && (
            <button
              onClick={() => closeDrive(drive)}
              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-all"
              title="Close Drive"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
};

export default DriveTableRow;
