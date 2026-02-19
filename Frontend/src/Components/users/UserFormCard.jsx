// components/users/UserFormCard.jsx
import { UserPlus, Upload } from 'lucide-react';

/**
 * UserFormCard Component
 * Form for creating new candidates in the CreateUsers page
 * 
 * @param {object} newUser - User form state object
 * @param {function} setNewUser - State setter for user form
 * @param {function} createCandidate - Function to create new candidate
 * @param {function} onImportClick - Handler to open import dialog
 * @param {boolean} importing - Import loading state
 * @param {object} colors - Color palette object
 */
export const UserFormCard = ({ 
  newUser, 
  setNewUser, 
  createCandidate, 
  onImportClick,
  importing = false,
  colors 
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colors.mossRock + "20" }}
        >
          <UserPlus size={24} style={{ color: colors.mossRock }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: colors.stonewash }}>
            Create New Candidate
          </h2>
          <p className="text-sm text-gray-600">Add a new candidate to the system</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="Enter candidate name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="Enter email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            College/University *
          </label>
          <input
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="Enter college name"
            value={newUser.college}
            onChange={(e) => setNewUser({ ...newUser, college: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Assigned Job (Optional)
          </label>
          <input
            className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
            placeholder="Job title"
            value={newUser.AssignedJob}
            onChange={(e) => setNewUser({ ...newUser, AssignedJob: e.target.value })}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={createCandidate}
          className="w-full md:w-auto px-8 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
          style={{ backgroundColor: colors.mossRock }}
        >
          <div className="flex items-center justify-center gap-2">
            <UserPlus size={20} />
            <span>Create Candidate</span>
          </div>
        </button>

        <button
          onClick={onImportClick}
          disabled={importing}
          className="w-full md:w-auto px-8  py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105 shadow-md"
           style={{ backgroundColor: colors.mossRock, opacity: importing ? 0.6 : 1 }}
        >
          <div className="flex items-center justify-center gap-2">
            <Upload size={20} />
            <span>{importing ? "Importing..." : "Import CSV"}</span>
          </div>
        </button>
      </div>

      <p className="text-xs text-gray-500 mt-3">
        Import CSV format: Name, Email, College, AssignedJob, DriveID
      </p>
    </div>
  );
};

export default UserFormCard;
