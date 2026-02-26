export default function QuickInfoCard({ applicationId, appliedOn, institute }) {
  return (
    <section className="mt-6 rounded-2xl border border-[#D6D6DC] bg-white p-5 sm:p-6">
      <h4 className="text-lg font-semibold text-[#344054] sm:text-[24px]">Quick Info</h4>

      <div className="mt-5 space-y-3 text-sm sm:text-[22px]">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#4B5563]">Application ID:</span>
          <span className="font-medium text-[#001F3F]">{applicationId}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#4B5563]">Applied On:</span>
          <span className="font-medium text-[#001F3F]">{appliedOn}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span className="text-[#4B5563]">Institute:</span>
          <span className="font-medium text-[#001F3F]">{institute}</span>
        </div>
      </div>
    </section>
  );
}
