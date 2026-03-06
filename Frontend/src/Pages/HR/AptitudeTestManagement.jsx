/**
 * File Type: UI/UX Page
 * Business Logic File Used: ../../features/hr/aptitude/useAptitudeTestManagement.js
 * Logic Fields Used:
 * activeView, viewHeader, navItems, loading, error, drives, selectedDrive, selectedDriveId,
 * setSelectedDriveId, availableJobs, selectedJobRef, setSelectedJobRef, searchText, setSearchText,
 * aptitudeLink, setAptitudeLink, selectedCandidateIds, dispatchLog, targetCandidates, selectedCandidateSet,
 * allVisibleSelected, statsData, getJobKey, getCandidateKey, switchAptitudeView,
 * toggleCandidateSelection, toggleSelectAllVisible, handleSendAptitudeLink
 * Input Type: None
 * Output Type: ReactElement
 */
import HrShell from "../../Components/common/HrShell.jsx";
import SectionNavBar from "../../Components/common/SectionNavBar.jsx";
import HR_COLORS from "../../theme/hrPalette";
import AptitudeDispatchView from "../../features/hr/aptitude/AptitudeDispatchView.jsx";
import AptitudeHomeView from "../../features/hr/aptitude/AptitudeHomeView.jsx";
import AptitudeListView from "../../features/hr/aptitude/AptitudeListView.jsx";
import { APTITUDE_VIEWS } from "../../features/hr/aptitude/constants";
import useAptitudeTestManagement from "../../features/hr/aptitude/useAptitudeTestManagement";

export default function AptitudeTestManagement() {
  const colors = HR_COLORS;
  const aptitude = useAptitudeTestManagement({ colors });

  return (
    <HrShell
      title={aptitude.viewHeader.title}
      subtitle={aptitude.viewHeader.subtitle}
      topNav={
        <SectionNavBar
          items={aptitude.navItems}
          activeKey={aptitude.activeView}
          onChange={aptitude.switchAptitudeView}
        />
      }
    >
      {aptitude.error ? (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {aptitude.error}
        </div>
      ) : null}

      {aptitude.activeView === APTITUDE_VIEWS.HOME ? (
        <AptitudeHomeView statsData={aptitude.statsData} colors={colors} />
      ) : null}

      {aptitude.activeView === APTITUDE_VIEWS.DISPATCH ? (
        <AptitudeDispatchView
          drives={aptitude.drives}
          loading={aptitude.loading}
          selectedDrive={aptitude.selectedDrive}
          selectedDriveId={aptitude.selectedDriveId}
          setSelectedDriveId={aptitude.setSelectedDriveId}
          availableJobs={aptitude.availableJobs}
          selectedJobRef={aptitude.selectedJobRef}
          setSelectedJobRef={aptitude.setSelectedJobRef}
          aptitudeLink={aptitude.aptitudeLink}
          setAptitudeLink={aptitude.setAptitudeLink}
          searchText={aptitude.searchText}
          setSearchText={aptitude.setSearchText}
          targetCandidates={aptitude.targetCandidates}
          selectedCandidateIds={aptitude.selectedCandidateIds}
          selectedCandidateSet={aptitude.selectedCandidateSet}
          allVisibleSelected={aptitude.allVisibleSelected}
          getJobKey={aptitude.getJobKey}
          getCandidateKey={aptitude.getCandidateKey}
          toggleCandidateSelection={aptitude.toggleCandidateSelection}
          toggleSelectAllVisible={aptitude.toggleSelectAllVisible}
          handleSendAptitudeLink={aptitude.handleSendAptitudeLink}
          colors={colors}
        />
      ) : null}

      {aptitude.activeView === APTITUDE_VIEWS.LIST ? (
        <AptitudeListView dispatchLog={aptitude.dispatchLog} colors={colors} />
      ) : null}
    </HrShell>
  );
}
