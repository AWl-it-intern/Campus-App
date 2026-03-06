export default function DriveKpiStrip({ drive, jobRows, colors }) {
  const totalCandidates = Array.isArray(drive.CandidateIDs)
    ? drive.CandidateIDs.length
    : Number(drive.NumberOfCandidates) || 0;
  const totalSelected = Number(drive.Selected) || 0;
  const totalJobs = jobRows.length;
  const panelistCount = new Set(
    jobRows.flatMap((job) => job.panelists.map((panelist) => panelist.id)),
  ).size;

  const cards = [
    { label: "Total Jobs", value: totalJobs, bg: `${colors.rainShadow}1A`, text: colors.rainShadow },
    { label: "Total Candidates", value: totalCandidates, bg: `${colors.softFlow}26`, text: colors.stonewash },
    { label: "Selected", value: totalSelected, bg: `${colors.mossRock}26`, text: colors.stonewash },
    { label: "Assigned Panelists", value: panelistCount, bg: `${colors.goldenHour}30`, text: colors.stonewash },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-gray-100 p-4"
          style={{ backgroundColor: card.bg }}
        >
          <p className="text-xs uppercase text-gray-500 tracking-wide mb-2">{card.label}</p>
          <p className="text-2xl font-bold" style={{ color: card.text }}>
            {card.value}
          </p>
        </div>
      ))}
    </section>
  );
}
