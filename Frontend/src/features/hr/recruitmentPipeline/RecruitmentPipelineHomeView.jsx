/**
 * File Type: UI/UX Component
 * Business Logic File Used: ./useRecruitmentPipeline.js
 * Fields Used: statsData, colors
 * Input Type: { statsData: StatCard[], colors: HrPalette }
 * Output Type: ReactElement
 */
import StatsCard from "../../../Components/common/StatsCard.jsx";

export default function RecruitmentPipelineHomeView({ statsData, colors }) {
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

      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 className="mb-2 text-lg font-semibold" style={{ color: colors.stonewash }}>
          Pipeline Overview
        </h3>
        <p className="text-sm text-gray-600">
          Custom flow templates are drive-job specific. Use the builder to define stages and
          track assignments in the list view with Job ID references.
        </p>
      </section>
    </>
  );
}
