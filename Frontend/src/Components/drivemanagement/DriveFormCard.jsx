// components/drivemanagement/DriveFormCard.jsx
import { Plus, MapPin, Calendar } from "lucide-react";
import MultiSelectDropdown from "../common/MultiSelectDropdown.jsx";

/**
 * DriveFormCard Component
 * Form for creating new campus drives (MongoDB schema aligned)
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
  colors,
}) => {
  const jobOptions = [...new Set(jobs.map((job) => job.JobName).filter(Boolean))].sort();

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
          <p className="text-sm text-gray-600">
            Add drive details based on your MongoDB schema
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Drive ID *
          </label>
          <input
            type="text"
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition-all"
            placeholder="e.g., DRV001"
            value={newDrive.DriveID}
            onChange={(e) => setNewDrive({ ...newDrive, DriveID: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            College Name *
          </label>
          <div className="relative">
            <MapPin
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-all"
              placeholder="e.g., IIT Bombay"
              value={newDrive.CollegeName}
              onChange={(e) =>
                setNewDrive({ ...newDrive, CollegeName: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none transition-all bg-white"
            value={newDrive.Status}
            onChange={(e) => setNewDrive({ ...newDrive, Status: e.target.value })}
          >
            <option value="Draft">Draft</option>
            <option value="Live">Live</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Start Date *
          </label>
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-all"
              value={newDrive.StartDate}
              onChange={(e) => setNewDrive({ ...newDrive, StartDate: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            End Date *
          </label>
          <div className="relative">
            <Calendar
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              type="date"
              className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-4 py-2.5 focus:outline-none transition-all"
              value={newDrive.EndDate}
              min={newDrive.StartDate || undefined}
              onChange={(e) => setNewDrive({ ...newDrive, EndDate: e.target.value })}
            />
          </div>
        </div>

      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Jobs Opening *
        </label>
        <MultiSelectDropdown
          options={jobOptions}
          selectedValues={Array.isArray(newDrive.JobsOpening) ? newDrive.JobsOpening : []}
          onChange={(values) => setNewDrive({ ...newDrive, JobsOpening: values })}
          placeholder="Select one or more job openings"
          emptyMessage="No jobs available in Job table."
          accentColor={colors.rainShadow}
        />
        {jobOptions.length === 0 ? (
          <p className="text-xs text-red-500 mt-2">
            No jobs available in Job table.
          </p>
        ) : (
          <p className="text-xs text-gray-500 mt-2">
            Choose multiple jobs from the dropdown list.
          </p>
        )}
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
