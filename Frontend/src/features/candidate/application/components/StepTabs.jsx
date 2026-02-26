import { APPLICATION_STEPS } from "../constants";

export default function StepTabs({ activeStep, onStepClick }) {
  return (
    <div className="grid grid-cols-3 rounded-2xl bg-[#D6D6DC] p-1">
      {APPLICATION_STEPS.map((stepLabel, index) => (
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
