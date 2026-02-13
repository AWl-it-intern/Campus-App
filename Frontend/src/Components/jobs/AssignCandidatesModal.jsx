// components/jobs/AssignCandidatesModal.jsx
import React from 'react';
import { X, Users, CheckCircle2 } from 'lucide-react';

/**
 * AssignCandidatesModal Component
 * Modal for assigning candidates to jobs
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close modal function
 * @param {object} selectedJob - Currently selected job
 * @param {array} candidates - List of all candidates
 * @param {array} selectedCandidates - List of selected candidate IDs
 * @param {function} toggleCandidateSelection - Toggle candidate selection
 * @param {function} saveAssignments - Save assignments function
 * @param {function} getJobsForCandidate - Get jobs for a candidate
 * @param {function} getAvatarColor - Get avatar color by ID
 * @param {object} colors - Color palette object
 */
export const AssignCandidatesModal = ({
  isOpen,
  onClose,
  selectedJob,
  candidates,
  selectedCandidates,
  toggleCandidateSelection,
  saveAssignments,
  getJobsForCandidate,
  getAvatarColor,
  colors
}) => {
  if (!isOpen || !selectedJob) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div 
          className="p-6 text-white"
          style={{ backgroundColor: colors.stonewash }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Assign Candidates</h3>
              <p className="text-sm opacity-90 mt-1">
                {selectedJob.JobName} ({selectedJob.JobID})
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="space-y-3">
            {candidates.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users size={48} className="mx-auto mb-3 text-gray-300" />
                <p>No candidates available. Please create candidates first.</p>
              </div>
            ) : (
              candidates.map(candidate => {
                const isSelected = selectedCandidates.includes(candidate.id);
                const candidateJobs = getJobsForCandidate(candidate.id);
                
                return (
                  <label
                    key={candidate.id}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      isSelected ? 'border-opacity-100 shadow-md' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                    style={{ 
                      borderColor: isSelected ? colors.mossRock : undefined,
                      backgroundColor: isSelected ? colors.mossRock + '10' : undefined
                    }}
                  >
                    <input
                      type="checkbox"
                      className="w-5 h-5 rounded accent-green-600"
                      checked={isSelected}
                      onChange={() => toggleCandidateSelection(candidate.id)}
                    />
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                      style={{ backgroundColor: getAvatarColor(candidate.id) }}
                    >
                      {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{candidate.name}</p>
                      <p className="text-sm text-gray-600">{candidate.college}</p>
                      {candidateJobs.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {candidateJobs.map(job => (
                            <span
                              key={job.JobID}
                              className="text-xs px-2 py-0.5 rounded-full"
                              style={{ 
                                backgroundColor: colors.goldenHour + '30',
                                color: colors.stonewash
                              }}
                            >
                              {job.JobName}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={24} style={{ color: colors.mossRock }} />
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>

        <div 
          className="p-6 border-t border-gray-200 flex items-center justify-between"
          style={{ backgroundColor: colors.softFlow + '10' }}
        >
          <p className="text-gray-700">
            <span className="font-semibold">{selectedCandidates.length}</span> candidate(s) selected
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={saveAssignments}
              className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
              style={{ backgroundColor: colors.mossRock }}
            >
              Save Assignments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignCandidatesModal;
