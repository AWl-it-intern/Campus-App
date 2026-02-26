export default function StatusCard({ statusBadge, jobTitle, gdScore, gdMax, gdProgress }) {
  return (
    <section className="mt-6 rounded-2xl border-2 border-[#0B8A8C] bg-[#D6E8EC] p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-[#001F3F] sm:text-[32px]">
          Application Status
        </h2>
        <span className="rounded-full border border-[#D8B4FE] bg-[#EBD8FF] px-4 py-1 text-sm font-medium text-[#7E22CE]">
          {statusBadge}
        </span>
      </div>

      <p className="mt-8 text-xl text-[#1E3A5F] sm:text-[30px]">Job: {jobTitle}</p>

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-sm sm:text-[24px]">
          <span className="text-[#334155]">GD Score</span>
          <span className="font-semibold text-[#0B8A8C]">
            {gdScore}/{gdMax}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-[#9FAAB1]">
          <div
            className="h-2 rounded-full bg-[#040B2A]"
            style={{ width: `${gdProgress}%` }}
          />
        </div>
      </div>
    </section>
  );
}
