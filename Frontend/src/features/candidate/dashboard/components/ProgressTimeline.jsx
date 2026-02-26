import { Check, Lock } from "lucide-react";

const ProgressIcon = ({ status }) => {
  if (status === "completed") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0B8A8C] text-white">
        <Check size={18} />
      </div>
    );
  }

  if (status === "active") {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded-full border-[6px] border-[#0B8A8C] bg-white">
        <div className="h-2.5 w-2.5 rounded-full bg-[#0B8A8C]" />
      </div>
    );
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E4E7EC] text-[#98A2B3]">
      <Lock size={16} />
    </div>
  );
};

export default function ProgressTimeline({ items }) {
  return (
    <section className="mt-6 rounded-2xl border border-[#D6D6DC] bg-white p-5 sm:p-6">
      <h3 className="text-2xl font-bold text-[#001F3F] sm:text-[32px]">
        Application Progress
      </h3>

      <div className="mt-6">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const nextStatus = !isLast ? items[index + 1].status : "locked";
          const connectorColor =
            nextStatus === "locked" ? "border-[#D1D5DB]" : "border-[#0B8A8C]";

          return (
            <div key={item.label} className={`relative pl-12 ${isLast ? "" : "pb-8"}`}>
              {!isLast && (
                <div
                  className={`absolute left-[15px] top-9 h-[calc(100%-22px)] border-l-2 ${connectorColor}`}
                />
              )}

              <div className="absolute left-0 top-0">
                <ProgressIcon status={item.status} />
              </div>

              <p
                className={`text-xl font-semibold sm:text-[30px] ${
                  item.status === "locked" ? "text-[#98A2B3]" : "text-[#001F3F]"
                }`}
              >
                {item.label}
              </p>
              {item.note && (
                <p className="mt-0.5 text-sm text-[#0B5E82] sm:text-[22px]">
                  {item.note}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
