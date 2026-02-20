import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Trash2, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

import awlLogo from "../Common/Awllogo.svg";
import {
  fetchLoggedInCandidate,
  readSavedCandidateApplication,
  saveCandidateApplication,
} from "../../utils/candidateData";

const STEPS = ["Personal", "Academics", "Experience"];
const MAX_RESUME_SIZE_BYTES = 2 * 1024 * 1024;

const createInitialFormData = () => ({
  personal: {
    fullName: "",
    email: "",
    contactNumber: "",
    dob: "",
    hometown: "",
  },
  academics: {
    tenthGradePercentage: "",
    twelfthGradePercentage: "",
    graduationDegree: "",
    specialization: "",
    cgpa: "",
    pgDegrees: [],
  },
  experience: {
    internshipCompany: "",
    projectTitle: "",
    workExperienceMonths: "",
  },
  resume: {
    name: "",
    size: 0,
    type: "",
  },
  meta: {
    applicationId: "",
    appliedOn: "",
    institute: "",
    appliedRole: "",
  },
});

const createEmptyPgDegree = () => ({
  degree: "",
  specialization: "",
  cgpa: "",
});

const inputClassName =
  "h-11 w-full rounded-xl border border-transparent bg-[#E6E6EA] px-3 text-[16px] text-[#0A0A0A] outline-none transition focus:border-[#0B8A8C] focus:bg-white";

function StepTabs({ activeStep, onStepClick }) {
  return (
    <div className="grid grid-cols-3 rounded-2xl bg-[#D6D6DC] p-1">
      {STEPS.map((stepLabel, index) => (
        <button
          key={stepLabel}
          type="button"
          onClick={() => onStepClick(index)}
          className={`h-9 rounded-xl text-sm font-semibold transition ${
            activeStep === index
              ? "bg-[#EFEFF2] text-[#001F3F]"
              : "text-[#0A0A0A] hover:text-[#001F3F]"
          }`}
        >
          {stepLabel}
        </button>
      ))}
    </div>
  );
}

function FieldLabel({ children }) {
  return <label className="mb-2 block text-[15px] font-semibold text-[#0A0A0A]">{children}</label>;
}

function TextInput({ label, required = false, ...props }) {
  return (
    <div>
      <FieldLabel>
        {label}
        {required ? " *" : ""}
      </FieldLabel>
      <input {...props} className={inputClassName} />
    </div>
  );
}

export default function ApplicationForm() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(createInitialFormData);

  useEffect(() => {
    let isMounted = true;

    const hydrateForm = async () => {
      try {
        const savedApplication = readSavedCandidateApplication();
        const baseForm = createInitialFormData();

        if (savedApplication) {
          baseForm.personal = {
            ...baseForm.personal,
            ...(savedApplication.personal || {}),
          };
          baseForm.academics = {
            ...baseForm.academics,
            ...(savedApplication.academics || {}),
            pgDegrees: Array.isArray(savedApplication.academics?.pgDegrees)
              ? savedApplication.academics.pgDegrees
              : [],
          };
          baseForm.experience = {
            ...baseForm.experience,
            ...(savedApplication.experience || {}),
          };
          baseForm.resume = {
            ...baseForm.resume,
            ...(savedApplication.resume || {}),
          };
          baseForm.meta = {
            ...baseForm.meta,
            ...(savedApplication.meta || {}),
          };
        }

        try {
          const candidate = await fetchLoggedInCandidate();
          if (candidate) {
            const candidateIdSuffix = String(candidate._id || "")
              .slice(-4)
              .toUpperCase()
              .padStart(4, "0");

            baseForm.personal.fullName =
              baseForm.personal.fullName || candidate.name || localStorage.getItem("candidate_name") || "";
            baseForm.personal.email =
              baseForm.personal.email || candidate.email || localStorage.getItem("candidate_email") || "";
            baseForm.meta.institute = baseForm.meta.institute || candidate.college || "";
            baseForm.meta.appliedRole = baseForm.meta.appliedRole || candidate.AssignedJob || "";
            baseForm.meta.applicationId =
              baseForm.meta.applicationId || `CAND-${candidateIdSuffix || "0001"}`;
          }
        } catch (error) {
          console.error("Candidate prefill failed:", error);
        }

        if (!baseForm.meta.appliedOn) {
          baseForm.meta.appliedOn = new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        }

        if (isMounted) {
          setFormData(baseForm);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error preparing application form:", error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    hydrateForm();
    return () => {
      isMounted = false;
    };
  }, []);

  const currentStepIsValid = useMemo(() => {
    if (activeStep === 0) {
      const { fullName, email, contactNumber, dob, hometown } = formData.personal;
      return [fullName, email, contactNumber, dob, hometown].every((value) => String(value).trim() !== "");
    }

    if (activeStep === 1) {
      const { tenthGradePercentage, twelfthGradePercentage, graduationDegree, specialization, cgpa } =
        formData.academics;
      return [tenthGradePercentage, twelfthGradePercentage, graduationDegree, specialization, cgpa].every(
        (value) => String(value).trim() !== "",
      );
    }

    const { internshipCompany, projectTitle, workExperienceMonths } = formData.experience;
    return (
      [internshipCompany, projectTitle, workExperienceMonths].every(
        (value) => String(value).trim() !== "",
      ) && Boolean(formData.resume.name)
    );
  }, [activeStep, formData]);

  const updatePersonalField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      personal: {
        ...prev.personal,
        [field]: value,
      },
    }));
  };

  const updateAcademicsField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      academics: {
        ...prev.academics,
        [field]: value,
      },
    }));
  };

  const updateExperienceField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      experience: {
        ...prev.experience,
        [field]: value,
      },
    }));
  };

  const addPgDegree = () => {
    setFormData((prev) => ({
      ...prev,
      academics: {
        ...prev.academics,
        pgDegrees: [...prev.academics.pgDegrees, createEmptyPgDegree()],
      },
    }));
  };

  const removePgDegree = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      academics: {
        ...prev.academics,
        pgDegrees: prev.academics.pgDegrees.filter((_, index) => index !== indexToRemove),
      },
    }));
  };

  const updatePgDegree = (indexToUpdate, field, value) => {
    setFormData((prev) => ({
      ...prev,
      academics: {
        ...prev.academics,
        pgDegrees: prev.academics.pgDegrees.map((pg, index) =>
          index === indexToUpdate
            ? {
                ...pg,
                [field]: value,
              }
            : pg,
        ),
      },
    }));
  };

  const attachResume = (file) => {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF and DOC files are allowed.");
      return;
    }

    if (file.size > MAX_RESUME_SIZE_BYTES) {
      alert("Resume size must be less than 2MB.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      resume: {
        name: file.name,
        size: file.size,
        type: file.type,
      },
    }));
  };

  const handleResumeInput = (event) => {
    attachResume(event.target.files?.[0]);
  };

  const handleResumeDrop = (event) => {
    event.preventDefault();
    attachResume(event.dataTransfer?.files?.[0]);
  };

  const handleNext = () => {
    if (!currentStepIsValid) {
      alert("Please fill all required fields before moving ahead.");
      return;
    }
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1));
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleStepClick = (stepIndex) => {
    if (stepIndex <= activeStep) {
      setActiveStep(stepIndex);
      return;
    }

    if (!currentStepIsValid) {
      alert("Please complete current section first.");
      return;
    }

    setActiveStep(stepIndex);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!currentStepIsValid) {
      alert("Please complete all required fields.");
      return;
    }

    const savedPayload = {
      ...formData,
      applicationStatus: "Under Review",
      gdScore: 27,
      gdMax: 30,
      interviewDetails: {
        date: "14 Feb 2026",
        time: "10:00 AM",
        panelist: "Ms. Kavita Das",
      },
      notifications: [
        {
          type: "Under Review",
          message: "Your application is under review by the recruitment team.",
          createdAt: new Date().toISOString(),
          unread: true,
        },
        {
          type: "Shortlisted",
          message: "If shortlisted, details will be shown here.",
          createdAt: "",
          unread: false,
        },
        {
          type: "Regret",
          message: "If not selected, a regret notification will appear here.",
          createdAt: "",
          unread: false,
        },
      ],
      updatedAt: new Date().toISOString(),
    };

    saveCandidateApplication(savedPayload);
    alert("Application submitted successfully.");
    navigate("/candidate-dashboard");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F2F2F4] p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-[#D6D6DC] bg-white p-8 text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[#0B8A8C]" />
          <p className="text-[#4A5565]">Loading application form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F2F2F4]">
      <header className="border-b border-[#D6D6DC] bg-white">
        <div className="mx-auto flex h-16 max-w-[1300px] items-center gap-4 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => navigate("/candidate-dashboard")}
            className="rounded-full p-2 text-[#1B1B1B] transition hover:bg-[#F2F2F4]"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <img src={awlLogo} alt="AWL logo" className="h-10 w-auto" />
        </div>
      </header>

      <main className="px-4 pb-10 pt-8 sm:px-6">
        <div className="mx-auto max-w-[640px]">
          <h1 className="text-4xl font-bold tracking-tight text-[#001F3F]">Application Form</h1>
          <p className="mt-2 text-[28px] text-[#4A5565]">Complete your profile to proceed</p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 rounded-2xl border border-[#D6D6DC] bg-white p-4 sm:p-6"
          >
            <StepTabs activeStep={activeStep} onStepClick={handleStepClick} />

            <div className="mt-6 space-y-4">
              {activeStep === 0 && (
                <>
                  <TextInput
                    label="Full Name"
                    required
                    type="text"
                    value={formData.personal.fullName}
                    onChange={(event) => updatePersonalField("fullName", event.target.value)}
                    placeholder="Enter your full name"
                  />

                  <TextInput
                    label="Email"
                    required
                    type="email"
                    value={formData.personal.email}
                    onChange={(event) => updatePersonalField("email", event.target.value)}
                    placeholder="Enter your email"
                  />

                  <TextInput
                    label="Contact Number"
                    required
                    type="text"
                    value={formData.personal.contactNumber}
                    onChange={(event) => updatePersonalField("contactNumber", event.target.value)}
                    placeholder="Enter contact number"
                  />

                  <TextInput
                    label="Date of Birth"
                    required
                    type="date"
                    value={formData.personal.dob}
                    onChange={(event) => updatePersonalField("dob", event.target.value)}
                  />

                  <TextInput
                    label="Hometown"
                    required
                    type="text"
                    value={formData.personal.hometown}
                    onChange={(event) => updatePersonalField("hometown", event.target.value)}
                    placeholder="Enter your hometown"
                  />
                </>
              )}

              {activeStep === 1 && (
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
                      <p className="text-[15px] font-semibold text-[#001F3F]">
                        PG Degree (Optional)
                      </p>
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
                                onChange={(event) =>
                                  updatePgDegree(index, "degree", event.target.value)
                                }
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
                                onChange={(event) =>
                                  updatePgDegree(index, "cgpa", event.target.value)
                                }
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
              )}

              {activeStep === 2 && (
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
                      <p className="mt-3 text-[16px] text-[#334155]">
                        Click to upload or drag and drop
                      </p>
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
              )}
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {activeStep > 0 ? (
                <button
                  type="button"
                  onClick={handlePrevious}
                  className="h-11 rounded-xl border border-[#D0D5DD] bg-white text-[16px] font-semibold text-[#0A0A0A] transition hover:bg-[#F8FAFC]"
                >
                  Previous
                </button>
              ) : (
                <div className="hidden sm:block" />
              )}

              {activeStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="h-11 rounded-xl bg-[#0B8A8C] text-[16px] font-semibold text-white transition hover:bg-[#087578]"
                >
                  {activeStep === 0 ? "Next: Academics" : "Next: Experience"}
                </button>
              ) : (
                <button
                  type="submit"
                  className="h-11 rounded-xl bg-[#0B8A8C] text-[16px] font-semibold text-white transition hover:bg-[#087578]"
                >
                  Submit Application
                </button>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

