/**
 * File Type: UI/UX Page
 * Business Logic File Used: ../../features/hr/recruitmentPipeline/useRecruitmentPipeline.js
 * Logic Fields Used:
 * activeView, loading, loadError, drives, selectedDrive, selectedDriveId, setSelectedDriveId,
 * availableJobs, selectedJobRef, setSelectedJobRef, selectedFlowStages, savedTemplates, statsData,
 * navItems, viewHeader, switchPipelineView, toggleFlowStage, handleSaveFlowTemplate,
 * handleDeleteFlowTemplate, getJobKey, getDriveKey
 * Input Type: None
 * Output Type: ReactElement
 */
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import HR_COLORS from "../../theme/hrPalette";
import RecruitmentPipelineBuilderView from "../../features/hr/recruitmentPipeline/RecruitmentPipelineBuilderView.jsx";
import RecruitmentPipelineHomeView from "../../features/hr/recruitmentPipeline/RecruitmentPipelineHomeView.jsx";
import RecruitmentPipelineListView from "../../features/hr/recruitmentPipeline/RecruitmentPipelineListView.jsx";
import { PIPELINE_VIEWS } from "../../features/hr/recruitmentPipeline/constants";
import useRecruitmentPipeline from "../../features/hr/recruitmentPipeline/useRecruitmentPipeline";

export default function RecruitmentPipeline() {
  const colors = HR_COLORS;
  const pipeline = useRecruitmentPipeline({ colors });

  return (
    <HrShell
      title={pipeline.viewHeader.title}
      subtitle={pipeline.viewHeader.subtitle}
      topNav={
        <SectionNavBar
          items={pipeline.navItems}
          activeKey={pipeline.activeView}
          onChange={pipeline.switchPipelineView}
        />
      }
    >
      {pipeline.loadError ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {pipeline.loadError}
        </div>
      ) : null}

      {pipeline.activeView === PIPELINE_VIEWS.HOME ? (
        <RecruitmentPipelineHomeView statsData={pipeline.statsData} colors={colors} />
      ) : null}

      {pipeline.activeView === PIPELINE_VIEWS.BUILDER ? (
        <RecruitmentPipelineBuilderView
          drives={pipeline.drives}
          loading={pipeline.loading}
          selectedDrive={pipeline.selectedDrive}
          selectedDriveId={pipeline.selectedDriveId}
          setSelectedDriveId={pipeline.setSelectedDriveId}
          availableJobs={pipeline.availableJobs}
          selectedJobRef={pipeline.selectedJobRef}
          setSelectedJobRef={pipeline.setSelectedJobRef}
          selectedFlowStages={pipeline.selectedFlowStages}
          toggleFlowStage={pipeline.toggleFlowStage}
          handleSaveFlowTemplate={pipeline.handleSaveFlowTemplate}
          colors={colors}
          getDriveKey={pipeline.getDriveKey}
          getJobKey={pipeline.getJobKey}
        />
      ) : null}

      {pipeline.activeView === PIPELINE_VIEWS.LIST ? (
        <RecruitmentPipelineListView
          savedTemplates={pipeline.savedTemplates}
          handleDeleteFlowTemplate={pipeline.handleDeleteFlowTemplate}
          colors={colors}
        />
      ) : null}
    </HrShell>
  );
}
