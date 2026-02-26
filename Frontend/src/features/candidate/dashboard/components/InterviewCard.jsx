import { CircleAlert } from "lucide-react";

export default function InterviewCard({ title, description }) {
  return (
    <section className="mt-6 rounded-2xl border border-[#A4C8FF] bg-[#E7F0FF] px-4 py-5 text-[#1E3A8A] sm:px-5">
      <div className="flex items-start gap-3">
        <CircleAlert size={22} className="mt-0.5 shrink-0" />
        <div>
          <h3 className="text-lg font-semibold sm:text-[28px]">{title}</h3>
          <p className="mt-1 text-sm sm:text-[22px]">{description}</p>
        </div>
      </div>
    </section>
  );
}
