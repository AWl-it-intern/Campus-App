import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import awlLogo from "../Common/Awllogo.svg";
import useCandidateApplicationForm from "../../hooks/useCandidateApplicationForm";
import StepTabs from "../../features/candidate/application/components/StepTabs";
import PersonalStep from "../../features/candidate/application/components/PersonalStep";
import AcademicsStep from "../../features/candidate/application/components/AcademicsStep";
import ExperienceStep from "../../features/candidate/application/components/ExperienceStep";
import FormActions from "../../features/candidate/application/components/FormActions";
import { APPLICATION_STEPS } from "../../features/candidate/application/constants";

export default function ApplicationForm() {
  const navigate = useNavigate();
  const {
    activeStep,
    isLoading,
    formData,
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
  } = useCandidateApplicationForm({ navigate });

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
        <div className="mx-auto flex h-16 max-w-325 items-center gap-4 px-4 sm:px-6">
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
        <div className="mx-auto max-w-160">
          <h1 className="text-4xl font-bold tracking-tight text-[#001F3F]">Application Form</h1>
          <p className="mt-2 text-[28px] text-[#4A5565]">Complete your profile to proceed</p>

          <form
            onSubmit={handleSubmit}
            className="mt-7 rounded-2xl border border-[#D6D6DC] bg-white p-4 sm:p-6"
          >
            <StepTabs activeStep={activeStep} onStepClick={handleStepClick} />

            <div className="mt-6 space-y-4">
              {activeStep === 0 && (
                <PersonalStep
                  formData={formData}
                  updatePersonalField={updatePersonalField}
                />
              )}

              {activeStep === 1 && (
                <AcademicsStep
                  formData={formData}
                  updateAcademicsField={updateAcademicsField}
                  addPgDegree={addPgDegree}
                  removePgDegree={removePgDegree}
                  updatePgDegree={updatePgDegree}
                />
              )}

              {activeStep === 2 && (
                <ExperienceStep
                  formData={formData}
                  updateExperienceField={updateExperienceField}
                  handleResumeInput={handleResumeInput}
                  handleResumeDrop={handleResumeDrop}
                />
              )}
            </div>

            <FormActions
              activeStep={activeStep}
              stepsCount={APPLICATION_STEPS.length}
              onPrevious={handlePrevious}
              onNext={handleNext}
              onSubmit={handleSubmit}
            />
          </form>
        </div>
      </main>
    </div>
  );
}
