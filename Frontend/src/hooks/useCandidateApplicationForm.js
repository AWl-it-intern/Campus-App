import { useEffect, useMemo, useState } from "react";
import {
  fetchLoggedInCandidate,
  readSavedCandidateApplication,
  saveCandidateApplication,
} from "../utils/candidateData";
import { APPLICATION_STEPS } from "../features/candidate/application/constants";

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

const getCandidateAssignedRole = (candidate) => {
  const assignedJobs = Array.isArray(candidate?.AssignedJobs)
    ? candidate.AssignedJobs.map((job) => String(job || "").trim()).filter(Boolean)
    : [];
  if (assignedJobs.length > 0) return assignedJobs[0];
  return String(candidate?.AssignedJob || "").trim();
};

export default function useCandidateApplicationForm({ navigate }) {
  const [activeStep, setActiveStep] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(createInitialFormData());

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
              baseForm.personal.fullName ||
              candidate.name ||
              localStorage.getItem("candidate_name") ||
              "";
            baseForm.personal.email =
              baseForm.personal.email ||
              candidate.email ||
              localStorage.getItem("candidate_email") ||
              "";
            baseForm.meta.institute = baseForm.meta.institute || candidate.college || "";
            baseForm.meta.appliedRole =
              baseForm.meta.appliedRole || getCandidateAssignedRole(candidate) || "";
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
      return [fullName, email, contactNumber, dob, hometown].every(
        (value) => String(value).trim() !== "",
      );
    }

    if (activeStep === 1) {
      const {
        tenthGradePercentage,
        twelfthGradePercentage,
        graduationDegree,
        specialization,
        cgpa,
      } = formData.academics;
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
    setActiveStep((prev) => Math.min(prev + 1, APPLICATION_STEPS.length - 1));
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
    if (event?.preventDefault) {
      event.preventDefault();
    }

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

  return {
    activeStep,
    isLoading,
    formData,
    currentStepIsValid,
    updatePersonalField,
    updateAcademicsField,
    updateExperienceField,
    addPgDegree,
    removePgDegree,
    updatePgDegree,
    handleResumeInput,
    handleResumeDrop,
    handleNext,
    handlePrevious,
    handleStepClick,
    handleSubmit,
  };
}
