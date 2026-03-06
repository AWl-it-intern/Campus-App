/**
 * File Type: UI/UX Component
 * Business Logic File Used: ./useRecruitmentPipeline.js
 * Fields Used: savedTemplates, handleDeleteFlowTemplate
 * Input Type: { savedTemplates: FlowTemplate[], handleDeleteFlowTemplate: (template) => void, colors: HrPalette }
 * Output Type: ReactElement
 */
import { Link2, Trash2 } from "lucide-react";

import EmptyState from "../../../Components/common/EmptyState.jsx";

export default function RecruitmentPipelineListView({
  savedTemplates,
  handleDeleteFlowTemplate,
  colors,
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-0 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-semibold" style={{ color: colors.stonewash }}>
          Assigned Flow Templates
        </h3>
        <span className="text-sm text-gray-600">{savedTemplates.length} total</span>
      </div>

      {savedTemplates.length === 0 ? (
        <div className="p-8">
          <EmptyState
            icon={Link2}
            title="No flow assignments found"
            message="Create a flow template from the Custom Flow Builder tab."
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Drive</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Job ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Job Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Stages</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Updated</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {savedTemplates.map((template) => (
                <tr
                  key={`${template.driveRef}-${template.jobName}-${template.updatedAt}`}
                  className="border-t border-gray-100"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">{template.driveLabel || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{template.jobId || "-"}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-700">{template.jobName || "-"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(template.stages || []).join(" -> ") || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {template.updatedAt ? new Date(template.updatedAt).toLocaleString("en-IN") : "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    <button
                      type="button"
                      onClick={() => handleDeleteFlowTemplate(template)}
                      className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-90"
                      style={{ backgroundColor: "#DC2626" }}
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
