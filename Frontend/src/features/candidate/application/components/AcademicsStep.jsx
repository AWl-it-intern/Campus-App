import { Plus, Trash2 } from "lucide-react";
import FieldLabel from "./FieldLabel";
import TextInput, { inputClassName } from "./TextInput";

export default function AcademicsStep({
  formData,
  updateAcademicsField,
  addPgDegree,
  removePgDegree,
  updatePgDegree,
}) {
  return (
    <>
      <TextInput
        label="10th Grade Percentage"
        required
        type="number"
        min="0"
        max="100"
        value={formData.academics.tenthGradePercentage}
        onChange={(event) => updateAcademicsField("tenthGradePercentage", event.target.value)}
        placeholder="Enter 10th percentage"
      />

      <TextInput
        label="12th Grade Percentage"
        required
        type="number"
        min="0"
        max="100"
        value={formData.academics.twelfthGradePercentage}
        onChange={(event) => updateAcademicsField("twelfthGradePercentage", event.target.value)}
        placeholder="Enter 12th percentage"
      />

      <div>
        <FieldLabel>Graduation Degree *</FieldLabel>
        <select
          value={formData.academics.graduationDegree}
          onChange={(event) => updateAcademicsField("graduationDegree", event.target.value)}
          className={inputClassName}
        >
          <option value="">Select degree</option>
          <option value="B.Tech">B.Tech</option>
          <option value="B.E">B.E</option>
          <option value="B.Sc">B.Sc</option>
          <option value="B.Com">B.Com</option>
          <option value="BBA">BBA</option>
          <option value="MBA">MBA</option>
          <option value="MCA">MCA</option>
        </select>
      </div>

      <TextInput
        label="Specialization"
        required
        type="text"
        value={formData.academics.specialization}
        onChange={(event) => updateAcademicsField("specialization", event.target.value)}
        placeholder="Enter specialization"
      />

      <TextInput
        label="CGPA / Percentage"
        required
        type="text"
        value={formData.academics.cgpa}
        onChange={(event) => updateAcademicsField("cgpa", event.target.value)}
        placeholder="Enter CGPA or percentage"
      />

      <div className="rounded-xl border border-[#D6D6DC] p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-[15px] font-semibold text-[#001F3F]">PG Degree (Optional)</p>
          <button
            type="button"
            onClick={addPgDegree}
            className="inline-flex items-center gap-1 rounded-lg border border-[#0B8A8C] px-3 py-1.5 text-sm font-semibold text-[#0B8A8C] hover:bg-[#E8F5F5]"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {formData.academics.pgDegrees.length === 0 ? (
          <p className="text-sm text-[#6A7282]">No PG degree added.</p>
        ) : (
          <div className="space-y-3">
            {formData.academics.pgDegrees.map((pgDegree, index) => (
              <div
                key={`pg-${index}`}
                className="rounded-xl border border-[#E2E8F0] bg-[#FAFAFB] p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#001F3F]">PG #{index + 1}</p>
                  <button
                    type="button"
                    onClick={() => removePgDegree(index)}
                    className="rounded-md p-1 text-[#B42318] hover:bg-[#FEE4E2]"
                    aria-label={`Remove PG degree ${index + 1}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <input
                    type="text"
                    value={pgDegree.degree}
                    onChange={(event) => updatePgDegree(index, "degree", event.target.value)}
                    placeholder="PG Degree"
                    className={inputClassName}
                  />
                  <input
                    type="text"
                    value={pgDegree.specialization}
                    onChange={(event) =>
                      updatePgDegree(index, "specialization", event.target.value)
                    }
                    placeholder="Specialization"
                    className={inputClassName}
                  />
                  <input
                    type="text"
                    value={pgDegree.cgpa}
                    onChange={(event) => updatePgDegree(index, "cgpa", event.target.value)}
                    placeholder="CGPA / %"
                    className={inputClassName}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
