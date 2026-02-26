import { ArrowLeft, Loader2, AlertTriangle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DriveOverviewCard,
  DriveKpiStrip,
  DriveJobBreakdown,
} from "../../Components/drivemanagement/drivecomponents";
import HR_COLORS from "../../theme/hrPalette";
import useDrivePage from "../../hooks/useDrivePage";

export default function DrivePage() {
  const navigate = useNavigate();
  const { driveId } = useParams();

  const colors = HR_COLORS;

  const { drive, jobRows, loading, error } = useDrivePage({ driveId });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto mb-3 text-gray-500" size={36} />
          <p className="text-gray-600 font-medium">Loading drive details...</p>
        </div>
      </div>
    );
  }

  if (error || !drive) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button
          onClick={() => navigate("/HR/dashboard/Drives")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg inline-flex items-center gap-2"
          style={{ backgroundColor: colors.stonewash }}
        >
          <ArrowLeft size={18} />
          Back to Drive Management
        </button>

        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-red-100 p-8 text-center">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={36} />
          <h2 className="text-xl font-bold text-red-600 mb-2">Unable to open drive</h2>
          <p className="text-gray-600">{error || "Drive not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate("/HR/dashboard/Drives")}
          className="mb-6 px-6 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition-all shadow-lg inline-flex items-center gap-2"
          style={{ backgroundColor: colors.stonewash }}
        >
          <ArrowLeft size={18} />
          Back to Drive Management
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.stonewash }}>
            Drive Details
          </h1>
          <p className="text-gray-600">
            Job-wise candidate count and assigned panelists for this campus drive
          </p>
        </div>

        <DriveOverviewCard drive={drive} colors={colors} />
        <DriveKpiStrip drive={drive} jobRows={jobRows} colors={colors} />
        <DriveJobBreakdown jobRows={jobRows} colors={colors} />
      </div>
    </div>
  );
}
