/**
 * File Type: UI/UX Component
 * Business Logic File Used: ./useAptitudeTestManagement.js
 * Fields Used: statsData, colors
 * Input Type: { statsData: StatCard[], colors: HrPalette }
 * Output Type: ReactElement
 */
import StatsCard from "../../../Components/common/StatsCard.jsx";

export default function AptitudeHomeView({ statsData, colors }) {
  return (
    <>
      <section className="mb-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {statsData.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              count={stat.count}
              icon={stat.icon}
              bgColor={stat.bgColor}
              lightBg={stat.lightBg}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold" style={{ color: colors.stonewash }}>
          Aptitude Tracking
        </h3>
        <p className="text-sm text-gray-600">
          Every dispatched aptitude record is tagged with a custom Aptitude ID (format:
          APT-YYYYMMDD-XXXX) so you can audit and track ongoing aptitude runs quickly.
        </p>
      </section>
    </>
  );
}
