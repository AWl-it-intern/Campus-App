// components/panelists/ScheduleRoundModal.jsx
import React from 'react';
import { X, UserCheck, Calendar, MessageSquare, Video } from 'lucide-react';

/**
 * ScheduleRoundModal Component
 * Modal for scheduling interview rounds
 * 
 * @param {boolean} isOpen - Modal open state
 * @param {function} onClose - Close modal function
 * @param {object} selectedPanelist - Currently selected panelist
 * @param {object} scheduleData - Schedule form data
 * @param {function} setScheduleData - Schedule data setter
 * @param {function} scheduleRound - Schedule round function
 * @param {function} getCandidateName - Get candidate name by ID
 * @param {object} colors - Color palette object
 */
export const ScheduleRoundModal = ({
  isOpen,
  onClose,
  selectedPanelist,
  scheduleData,
  setScheduleData,
  scheduleRound,
  getCandidateName,
  colors
}) => {
  if (!isOpen || !selectedPanelist) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div 
          className="p-6 text-white" 
          style={{ backgroundColor: colors.stonewash }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Schedule Interview Round</h3>
              <p className="text-sm opacity-90 mt-1">{selectedPanelist.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-white hover:bg-opacity-20 flex items-center justify-center transition-all"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {selectedPanelist.assignedCandidates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <UserCheck size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No candidates assigned</p>
              <p className="text-sm">Please assign candidates first</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Candidate *</label>
                <select
                  className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                  value={scheduleData.candidateId}
                  onChange={(e) => setScheduleData({ ...scheduleData, candidateId: e.target.value })}
                >
                  <option value="">Choose a candidate</option>
                  {selectedPanelist.assignedCandidates.map((candidateId) => (
                    <option key={candidateId} value={candidateId}>
                      {getCandidateName(candidateId)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Round Type *</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="roundType"
                      value="GD"
                      checked={scheduleData.type === "GD"}
                      onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                      className="w-4 h-4"
                    />
                    <MessageSquare size={18} style={{ color: colors.mossRock }} />
                    <span className="text-gray-700">Group Discussion</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="roundType"
                      value="PI"
                      checked={scheduleData.type === "PI"}
                      onChange={(e) => setScheduleData({ ...scheduleData, type: e.target.value })}
                      className="w-4 h-4"
                    />
                    <Video size={18} style={{ color: colors.marigoldFlame }} />
                    <span className="text-gray-700">Personal Interview</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date *</label>
                  <input
                    type="date"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-opacity-100 transition-all"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData({ ...scheduleData, time: e.target.value })}
                  />
                </div>
              </div>

              {selectedPanelist.scheduledRounds.length > 0 && (
                <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: colors.clayPot + "30" }}>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Existing Schedules:</p>
                  <div className="space-y-2">
                    {selectedPanelist.scheduledRounds.map((round, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <span
                          className="px-2 py-0.5 rounded text-xs font-medium text-white"
                          style={{ backgroundColor: round.type === 'GD' ? colors.mossRock : colors.marigoldFlame }}
                        >
                          {round.type}
                        </span>
                        <span>{getCandidateName(round.candidateId)}</span>
                        <span className="text-gray-400">•</span>
                        <span>{round.date}</span>
                        <span>{round.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div 
          className="p-6 border-t border-gray-200 flex items-center justify-end gap-3" 
          style={{ backgroundColor: colors.marigoldFlame + "10" }}
        >
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={scheduleRound}
            className="px-6 py-2 rounded-xl text-white font-semibold hover:opacity-90 transition-all transform hover:scale-105"
            style={{ backgroundColor: colors.marigoldFlame }}
            disabled={selectedPanelist.assignedCandidates.length === 0}
          >
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              Schedule Round
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleRoundModal;
