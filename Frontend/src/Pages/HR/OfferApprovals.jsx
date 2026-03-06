import { Award, Briefcase, UserCheck, Users } from "lucide-react";

import HrShell from "../../Components/common/HrShell.jsx";
import HR_COLORS from "../../theme/hrPalette";

const OFFER_ITEMS = [
  {
    candidate: "Sneha Rao",
    role: "Frontend Developer",
    package: "6.5 LPA",
    status: "Pending Approval",
  },
  {
    candidate: "Rahul Arora",
    role: "Data Analyst",
    package: "7.2 LPA",
    status: "Ready to Release",
  },
  {
    candidate: "Nisha Das",
    role: "QA Engineer",
    package: "5.8 LPA",
    status: "Compensation Review",
  },
];

export default function OfferApprovals() {
  const colors = HR_COLORS;

  return (
    <HrShell
      title="Offer Approvals"
      subtitle=""
    >
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <UserCheck size={18} style={{ color: colors.stonewash }} />
            <p className="text-sm text-gray-500">Offers In Review</p>
          </div>
          <p className="text-2xl font-bold mt-3" style={{ color: colors.stonewash }}>
            12
          </p>
        </article>
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <Briefcase size={18} style={{ color: colors.stonewash }} />
            <p className="text-sm text-gray-500">Budget Reserved</p>
          </div>
          <p className="text-2xl font-bold mt-3" style={{ color: colors.stonewash }}>
            48.6 LPA
          </p>
        </article>
        <article className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <Users size={18} style={{ color: colors.stonewash }} />
            <p className="text-sm text-gray-500">Approved This Week</p>
          </div>
          <p className="text-2xl font-bold mt-3" style={{ color: colors.stonewash }}>
            7
          </p>
        </article>
      </section>

      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="min-w-full">
          <thead style={{ backgroundColor: `${colors.softFlow}20` }}>
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                Candidate
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Package</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {OFFER_ITEMS.map((item) => (
              <tr key={`${item.candidate}-${item.role}`} className="border-b border-gray-100 last:border-0">
                <td className="px-6 py-4 text-sm text-gray-800">{item.candidate}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{item.role}</td>
                <td className="px-6 py-4 text-sm text-gray-800">{item.package}</td>
                <td className="px-6 py-4 text-sm text-gray-800">
                  <span
                    className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${colors.goldenHour}30`,
                      color: colors.stonewash,
                    }}
                  >
                    <Award size={14} />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </HrShell>
  );
}
