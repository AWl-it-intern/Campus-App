export default function FormActions({
  activeStep,
  stepsCount,
  onPrevious,
  onNext,
  onSubmit,
}) {
  return (
    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {activeStep > 0 ? (
        <button
          type="button"
          onClick={onPrevious}
          className="h-11 rounded-xl border border-[#D0D5DD] bg-white text-[16px] font-semibold text-[#0A0A0A] transition hover:bg-[#F8FAFC]"
        >
          Previous
        </button>
      ) : (
        <div className="hidden sm:block" />
      )}

      {activeStep < stepsCount - 1 ? (
        <button
          type="button"
          onClick={onNext}
          className="h-11 rounded-xl bg-[#0B8A8C] text-[16px] font-semibold text-white transition hover:bg-[#087578]"
        >
          {activeStep === 0 ? "Next: Academics" : "Next: Experience"}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSubmit}
          className="h-11 rounded-xl bg-[#0B8A8C] text-[16px] font-semibold text-white transition hover:bg-[#087578]"
        >
          Submit Application
        </button>
      )}
    </div>
  );
}
