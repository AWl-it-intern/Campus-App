import { UploadCloud } from "lucide-react";
import FieldLabel from "./FieldLabel";
import TextInput, { inputClassName } from "./TextInput";

export default function ExperienceStep({
  formData,
  updateExperienceField,
  handleResumeInput,
  handleResumeDrop,
}) {
  return (
    <>
      <TextInput
        label="Internship Company"
        required
        type="text"
        value={formData.experience.internshipCompany}
        onChange={(event) => updateExperienceField("internshipCompany", event.target.value)}
        placeholder="Enter internship company"
      />

      <TextInput
        label="Project Title"
        required
        type="text"
        value={formData.experience.projectTitle}
        onChange={(event) => updateExperienceField("projectTitle", event.target.value)}
        placeholder="Enter project title"
      />

      <TextInput
        label="Work Experience (in months)"
        required
        type="number"
        min="0"
        value={formData.experience.workExperienceMonths}
        onChange={(event) => updateExperienceField("workExperienceMonths", event.target.value)}
        placeholder="Enter months of work experience"
      />

      <div>
        <FieldLabel>Resume Upload *</FieldLabel>
        <label
          className="flex min-h-[130px] w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#B6BDC9] bg-[#F8FAFC] p-4 text-center"
          onDrop={handleResumeDrop}
          onDragOver={(event) => event.preventDefault()}
        >
          <UploadCloud size={32} className="text-[#98A2B3]" />
          <p className="mt-3 text-[16px] text-[#334155]">Click to upload or drag and drop</p>
          <p className="mt-1 text-sm text-[#64748B]">PDF, DOC (max 2MB)</p>
          {formData.resume.name && (
            <p className="mt-2 text-sm font-semibold text-[#0B8A8C]">
              {formData.resume.name}
            </p>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={handleResumeInput}
          />
        </label>
      </div>
    </>
  );
}
