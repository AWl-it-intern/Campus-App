import { Loader2, AlertTriangle } from "lucide-react";
import { useParams } from "react-router-dom";

import {
  DriveOverviewCard,
  DriveKpiStrip,
  DriveJobBreakdown,
} from "../../Components/drivemanagement/drivecomponents";
import HrShell from "../../Components/common/HrShell.jsx";
import HR_COLORS from "../../theme/hrPalette";
import useDrivePage from "../../hooks/useDrivePage";

export default function DrivePage() {
  const { driveId } = useParams();

  const colors = HR_COLORS;

  const { drive, jobRows, loading, error } = useDrivePage({ driveId });

  if (loading) {
    return (
      <HrShell
        title="Drive Details"
        subtitle="Job-wise candidate and panelist performance for this drive."
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-gray-500" size={36} />
          <p className="text-gray-600 font-medium">Loading drive details...</p>
        </div>
      </HrShell>
    );
  }

  if (error || !drive) {
    return (
      <HrShell
        title="Drive Details"
        subtitle="Job-wise candidate and panelist performance for this drive."
      >
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={36} />
          <h2 className="text-xl font-bold text-red-600 mb-2">Unable to open drive</h2>
          <p className="text-gray-600">{error || "Drive not found"}</p>
        </div>
      </HrShell>
    );
  }

  return (
    <HrShell
      title="Drive Details"
      subtitle="Job-wise candidate count and assigned panelists for this campus drive."
    >
      <DriveOverviewCard drive={drive} colors={colors} />
      <DriveKpiStrip drive={drive} jobRows={jobRows} colors={colors} />
      <DriveJobBreakdown drive={drive} jobRows={jobRows} colors={colors} />
    </HrShell>
  );
}

