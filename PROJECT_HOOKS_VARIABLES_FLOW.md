# Campus Recruitment App: Hooks, Variables, Navigation, and Data Flow Reference

This file is a practical map of how naming is organized and how data flows through this project.

Scope covered in this document:
- Frontend routes, page connections, and navigation methods
- All custom hooks and their variables/methods
- Page-level state variables for pages with direct business logic
- Frontend service to backend endpoint mapping
- Backend route -> controller -> service -> DB method chain
- Core business logic concepts and invariants

## 1) Architecture Snapshot

Current architecture is layered:
- Frontend:
  - `Pages` -> `Hooks` -> `services/*` -> REST API
- Backend:
  - `routes/*` -> `controllers/*` -> `services/*` -> `db/*` (MongoDB collections)

Main backend collections:
- `Candidate`
- `Drives`
- `Jobs`
- `Panelist`
- `Users`
- `counters` (sequence/counter support)

---

## 2) Frontend Route and Page Connection Map

| Route | Page Component | Auth Guard | Main Hook(s) | Main Data Source |
|---|---|---|---|---|
| `/login` | `LoginPage` | Public | None | `tempAuth.json` + localStorage |
| `/candidate-dashboard` | `CandidateDashboard` | `candidate_auth` | `useCandidateDashboard` | Candidate API + localStorage |
| `/candidate/application` | `Applicationform` | `candidate_auth` | `useCandidateApplicationForm` | Candidate API + localStorage |
| `/HR/dashboard` | `HRDashboard` | `hr_auth` | `useHrDashboard` | Candidates/Panelists/Drives APIs |
| `/HR/dashboard/Drives` | `DriveManagement` | `hr_auth` | `useDriveManagement` | Drives + Jobs APIs |
| `/HR/dashboard/Drives/:driveId` | `DrivePage` | `hr_auth` | `useDrivePage` | Drive by id + related APIs |
| `/HR/dashboard/Create-Job` | `CreateJob` | `hr_auth` | `useCreateJob`, `useKonamiConfetti` | Jobs + Candidates APIs |
| `/HR/dashboard/Create-Users` | `CreateUsers` | `hr_auth` | `useCreateUsers` | Candidates + Jobs + Drives APIs |
| `/HR/dashboard/Manage-Panelists` | `CreatePanelist` | `hr_auth` | `useCreatePanelist` | Panelists + Jobs + Candidates APIs |
| `/HR/dashboard/drive/:driveId/job/:jobId/candidates` | `DriveCandidatesPage` | `hr_auth` | `useDriveCandidates` | Candidates + Drives + Jobs APIs |
| `/HR/dashboard/Drive-Job-Scoreboard` | `DriveJobCandidateScoreboardPage` | `hr_auth` | `useDriveJobScoreboard` | Candidates + Drives + Jobs + Panelists APIs |
| `/HR/dashboard/drive/:driveId/job/:jobId/scoreboard` | `DriveJobCandidateScoreboardPage` | `hr_auth` | `useDriveJobScoreboard` | Same as above |
| `/HR/dashboard/Recruitment-Pipeline` | `RecruitmentPipeline` | `hr_auth` | None (page state) | Drives + Jobs APIs + localStorage templates |
| `/HR/dashboard/Aptitude-Test-Management` | `AptitudeTestManagement` | `hr_auth` | None (page state) | Drives + Jobs + Candidates APIs |
| `/HR/dashboard/Offer-Approvals` | `OfferApprovals` | `hr_auth` | None | UI-only mock data |

---

## 3) Navigation Methods Inventory

### 3.1 Router-level navigation (central)
- `AppRoutes.jsx` defines page routing and guarded route groups.
- `ProtectedRoute.jsx` checks localStorage (`candidate_auth` / `hr_auth`) and redirects to `/login`.

### 3.2 Global HR side navigation
- `HrSlideDrawer.jsx`
  - `MAIN_NAV_ITEMS`:
    - Dashboard -> `/HR/dashboard`
    - Drive Management -> `/HR/dashboard/Drives`
    - Create Jobs -> `/HR/dashboard/Create-Job`
    - Candidates -> `/HR/dashboard/Create-Users`
    - Panelists -> `/HR/dashboard/Manage-Panelists`
  - `FLOW_NAV_ITEMS`:
    - Recruitment Pipeline -> `/HR/dashboard/Recruitment-Pipeline`
    - Aptitude Tests -> `/HR/dashboard/Aptitude-Test-Management`
    - Offer Approvals -> `/HR/dashboard/Offer-Approvals`
    - Candidate Scoreboard -> `/HR/dashboard/Drive-Job-Scoreboard`
  - `handleNavigate(path)` performs navigation and closes drawer.
  - `handleLogout()` clears HR auth keys and routes to `/login`.

### 3.3 Drive Management top section navigation
- `SectionNavBar.jsx` (reusable top horizontal nav)
  - Used in `DriveManagement.jsx`
  - Items: `Home`, `Create Drive`, `Drives`
  - Implemented via URL query param `view` (`home`, `create-drive`, `drives`) using `useSearchParams`.

### 3.4 Flow-driven navigation inside drive details
- `DriveJobBreakdown.jsx`
  - Row click -> `/HR/dashboard/drive/:driveId/job/:jobName/candidates`
- `DriveRecruitmentFlow.jsx`
  - Stage actions navigate across:
    - Drive Management
    - Create Job
    - Drive candidates
    - Aptitude test management
    - Panelist management
    - Offer approvals

### 3.5 Candidate navigation
- `CandidateDashboard.jsx`
  - View application -> `/candidate/application`
- `useCandidateDashboard`
  - `handleLogout()` clears candidate auth keys and routes to `/login`
- `useCandidateApplicationForm`
  - `handleSubmit()` routes to `/candidate-dashboard`

---

## 4) Hooks Inventory (Variables, Purpose, Usage)

Note:
- This section lists exact state/ref variable names and major derived/method names from each custom hook.
- Purpose is included so naming patterns are clear.

### 4.1 `useDriveManagement`

State variables:
- `jobs`: all jobs loaded for drive creation/filtering.
- `jobCount`: total jobs count.
- `drives`: normalized drives list.
- `drivesLoading`: drive fetch loading flag.
- `drivesError`: drive fetch error message.
- `newDrive`: create-drive form model (`DriveID`, `CollegeName`, `StartDate`, `EndDate`, `JobsOpening`, `Status`).
- `selectedJob`: job filter value.
- `searchTerm`: text filter.
- `statusFilter`: status filter value.
- `collegeFilter`: college filter value.
- `isEditOpen`: edit modal visibility.
- `editingDrive`: current drive being edited.

Derived variables:
- `uniqueColleges`: distinct colleges from `drives`.
- `availableJobNames`: distinct job names from `jobs`.
- `filteredDrives`: filtered + sorted drives.
- `stats`: `{ totalCandidates, totalSelected, liveDrives, totalDrives }` from `filteredDrives`.

Methods:
- `loadJobs()`, `loadDrives()`
- `handleCreateDrive()`
- `handleDeleteDrive(driveToDelete)`
- `openEditDrive(drive)`
- `closeEditDrive()`
- `saveDriveEdits(driveId, payload)`

Normalization helpers in this hook:
- `normalizeDrive`, `normalizeStatus`, `normalizeJobsOpening`, `normalizeDateForInput`, `normalizeCandidateIds`

### 4.2 `useCreateJob`

State variables:
- `jobs`, `jobsLoading`, `jobsError`
- `candidates`
- `newJob`: create job form (`JobID`, `JobName`)
- `jobSearchTerm`

Derived variables:
- `filteredJobs`: search-filtered/sorted jobs.
- `candidateMap`: `Map(candidateId -> candidate object)`

Methods:
- `loadJobs()`
- `handleCreateJob()`
- `handleDeleteJob(jobToDelete)`
- `getCandidatesForJob(job)`
- `reloadJobs`

### 4.3 `useCreateUsers`

State/ref variables:
- `fileInputRef`: hidden CSV input reference.
- `candidates`, `jobs`, `drives`
- `importing`: CSV import in-progress flag.
- `newUser`: create candidate form (`name`, `email`, `college`, `AssignedJobs`).
- `searchTerm`, `collegeFilter`, `jobFilter`
- `isAssignOpen`
- `assignCtx`: assignment modal context (`candidateId`, `candidateName`, `candidateEmail`, `filterKeys`, `filterBy`)
- `isEditOpen`, `editingCandidate`

Derived variables:
- `uniqueColleges`
- `uniqueJobs`
- `drivesMap`: drive lookup map by id/code.
- `filteredCandidates`: filtered + sorted candidates.

Methods:
- `loadCandidates()`, `loadJobs()`, `loadDrives()`
- `handleCreateCandidate()`
- `handleDeleteCandidate(candidateId)`
- `onOpenAssign(candidate)`
- `handleAssigned({ jobs, candidateId, mode })`
- `getDriveName(driveId)`
- `exportCandidatesToCsv()`
- `onImportClick()`
- `onFileChange(event)` (CSV parse + bulk API insert)
- `openEditCandidate(candidate)`, `closeEditCandidate()`, `saveCandidateEdits(candidateId, payload)`

### 4.4 `useCreatePanelist`

State variables:
- Candidate/job fetch side:
  - `fetchedCandidates`, `candidatesLoading`
  - `fetchedJobs`, `jobsLoading`
  - `fetchError`
- Panelist side:
  - `panelists`, `panelistsLoading`, `panelistsError`
  - `newPanelist`
  - `searchTerm`, `expertiseFilter`, `assignmentFilter`
- Modal side:
  - `showAssignModal`, `showScheduleModal`
  - `selectedPanelist`
  - `selectedJobsForAssignment`
  - `scheduleData` (`candidateId`, `type`, `date`, `time`)

Derived variables:
- `uniqueExpertise`
- `filteredPanelists`

Methods:
- `loadCandidates()`, `loadJobs()`, `loadPanelists()`
- `handleCreatePanelist()`
- `handleDeletePanelist(panelistToDelete)`
- `handleUpdatePanelist(panelistId, updateData)`
- `openAssignModal(panelist)`, `toggleJobSelection(jobName)`, `saveAssignments()`
- `openScheduleModal(panelist)`, `scheduleRound()`
- `getCandidateName(id)`

### 4.5 `useDrivePage`

State variables:
- `drive`, `candidates`, `panelists`, `jobs`
- `loading`, `error`

Derived variables:
- `driveScopedCandidates`: only candidates mapped to current drive.
- `jobRows`: per job object containing:
  - `jobName`
  - `candidateCount`
  - `panelists` (mapped by assignment/expertise/schedule heuristics)

Methods:
- internal fetch effect (`fetchDrivePageData`)

### 4.6 `useDriveCandidates`

State variables:
- `loading`, `error`
- `candidates`, `drives`, `jobs`
- `refreshToken` (manual reload trigger)

Derived variables:
- `drivesMap`
- `filteredCandidates` (drive + job scoped)

Methods:
- `getDriveName(driveId)`
- `splitAssignedJobs(candidate)`
- `reload()` increments `refreshToken`

### 4.7 `useDriveJobScoreboard`

State variables:
- `loading`, `error`
- `candidates`, `drives`, `jobs`, `panelists`

Derived variables:
- `selectedDrive`, `selectedJob`
- `assignedCandidateIds`
- `rows`: scoreboard rows with:
  - candidate identity fields
  - mapped panelists
  - `aptitudeScore`, `gdScore`, `piScore`
  - status
- `driveLabel`, `jobLabel`

Methods:
- internal fetch effect + score derivation utilities.

### 4.8 `useHrDashboard`

State variables:
- `candidateCount`
- `panelistCount`
- `totalDriveCount`

Method:
- fetches counts using `fetchCandidates`, `fetchPanelists`, `fetchDrives`

### 4.9 `useCandidateApplicationForm`

State variables:
- `activeStep`
- `isLoading`
- `formData` (sections: `personal`, `academics`, `experience`, `resume`, `meta`)

Derived variable:
- `currentStepIsValid`

Methods:
- `updatePersonalField`, `updateAcademicsField`, `updateExperienceField`
- `addPgDegree`, `removePgDegree`, `updatePgDegree`
- `handleResumeInput`, `handleResumeDrop`
- `handleNext`, `handlePrevious`, `handleStepClick`
- `handleSubmit` (saves application to localStorage and navigates)

### 4.10 `useCandidateDashboard`

State/ref variables:
- `isLoading`, `loadError`
- `isNotificationsOpen`
- `notificationsRef`
- `dashboardData` (status card, interview card, progress, quick info, notifications)

Derived variables:
- `firstName`
- `gdProgress`
- `unreadNotificationsCount`

Methods:
- `handleLogout`
- `toggleNotifications`
- `openNotifications`
- `closeNotifications`
- `getNotificationAccent(type)`

### 4.11 `useKonamiConfetti`

Ref variable:
- `sequenceRef`: keypress buffer for Konami sequence matching.

Behavior:
- listens for keydown sequence and spawns confetti elements.

### 4.12 `useToast`

Variable:
- `context` from `ToastContext`.

Behavior:
- Returns context methods if provider exists.
- Fallback methods (`show`, `success`, `error`, `info`, `warning`) call `window.alert`.

---

## 5) Page-Level Variable Inventory (Data-heavy Pages)

These pages contain direct business/UI orchestration without a dedicated custom hook.

### 5.1 `RecruitmentPipeline`

State variables:
- `drives`, `jobs`
- `loading`, `loadError`
- `selectedDriveId`, `selectedJobName`
- `selectedFlowStages`
- `savedTemplates`

Derived variables:
- `selectedDrive`
- `availableJobs`

Methods:
- `toggleFlowStage(stageName)`
- `handleSaveFlowTemplate()`

Business usage:
- Saves drive-job flow templates to localStorage via `upsertRecruitmentFlowTemplate`.

### 5.2 `AptitudeTestManagement`

State variables:
- Data sets: `drives`, `jobs`, `candidates`
- Flags: `loading`, `error`
- Selection/filter: `selectedDriveId`, `selectedJobName`, `searchText`
- Dispatch workflow: `aptitudeLink`, `selectedCandidateIds`, `dispatchLog`

Derived variables:
- `selectedDrive`
- `availableJobs`
- `targetCandidates`
- `selectedCandidateSet`
- `allVisibleSelected`

Methods:
- `toggleCandidateSelection(candidateKey)`
- `toggleSelectAllVisible()`
- `handleSendAptitudeLink()`

Business usage:
- Queues aptitude link dispatch records in UI state (`dispatchLog`), no backend write yet.

### 5.3 `DriveCandidatesPage`

State/ref variables:
- `fileInputRef`
- `importing`
- URL/context values: `driveId`, `jobId`, `jobName`, `collegeName`

Derived variables:
- `flowTemplate`
- `flowStages`

Methods:
- `handleImportClick()`
- `handleFileChange(event)` uses CSV parser and `bulkInsertCandidates` with forced drive/job assignment.

### 5.4 `DriveJobCandidateScoreboardPage`

State variables:
- `drives`, `jobs`
- `selectorsLoading`, `selectorsError`
- `selectedDriveId`, `selectedJobName`

Derived variables:
- `selectedDrive`
- `availableJobs`
- `effectiveDriveId`
- `effectiveJobName`

Usage:
- Delegates row-level scoreboard assembly to `useDriveJobScoreboard`.

### 5.5 `LoginPage`

State variables:
- `activeTab`
- `email`
- `password`

Constants/vars:
- `ROLE_TABS`
- `hrAdmin` and `candidateAuth` from `tempAuth.json`

Business usage:
- Writes role auth flags to localStorage and routes accordingly.

---

## 6) Frontend Services to Backend Endpoints

| Frontend Service Function | HTTP | Endpoint |
|---|---|---|
| `fetchCandidates({ limit })` | GET | `/print-candidates?limit=...` |
| `createCandidate(payload)` | POST | `/candidate` |
| `deleteCandidate(candidateId)` | DELETE | `/candidate/:id` |
| `bulkInsertCandidates(candidates, options)` | POST | `/candidate/bulk` |
| `updateCandidate(candidateId, payload)` | PATCH | `/candidate/:id` |
| `fetchDrives({ limit })` | GET | `/print-drives?limit=...` |
| `createDrive(payload)` | POST | `/drive` |
| `deleteDrive(driveId)` | DELETE | `/drive/:id` |
| `fetchDriveById(driveId)` | GET | `/drive/:id` |
| `updateDrive(driveId, payload)` | PUT | `/drive/:id` |
| `fetchJobs({ limit })` | GET | `/print-jobs?limit=...` |
| `createJob(payload)` | POST | `/job` |
| `deleteJob(jobId)` | DELETE | `/job/:id` |
| `fetchPanelists({ limit })` | GET | `/print-panelists?limit=...` |
| `createPanelist(payload)` | POST | `/panelist` |
| `updatePanelist(panelistId, payload)` | PUT | `/panelist/:id` |
| `deletePanelist(panelistId)` | DELETE | `/panelist/:id` |

---

## 7) Backend API Chain Map (Route -> Controller -> Service -> DB)

### Candidate APIs
- `POST /candidate`
  - `insertCandidateHandler` -> `createCandidate` -> `insertCandidate`
  - Collections touched: `Candidate`, `Drives`, `Jobs`, `counters`
- `POST /candidate/bulk`
  - `insertManyCandidatesHandler` -> `createManyCandidates` -> `insertManyCandidates`
  - Collections touched: `Candidate`, `Drives`, `Jobs`, `counters`
- `GET /print-candidates`
  - `printCandidatesHandler` -> `listCandidates` -> `printCandidates`
  - Collection: `Candidate`
- `PATCH /candidate/:id`
  - `editcandidateHandler` -> `updateCandidate` -> `editcandidate`
  - Collections touched: `Candidate`, `Drives`, `Jobs`
- `DELETE /candidate/:id`
  - `deleteCandidateHandler` -> `removeCandidate` -> `deleteCandidate`
  - Collections touched (transaction): `Candidate`, `Jobs`, `Drives`, `Panelist`

### Drive APIs
- `POST /drive`
  - `insertDriveHandler` -> `createDrive` -> `insertDrive`
  - Collections: `Drives`, `Jobs`
- `GET /drive/:id`
  - `getDriveByIdHandler` -> `getDrive` -> `getDriveById`
  - Collections: `Drives`, `Candidate` (for derived candidate membership)
- `PUT /drive/:id`
  - `updateDriveHandler` -> `updateDrive` -> `editDrive`
  - Collections: `Drives`, `Jobs`, `Candidate`
- `DELETE /drive/:id`
  - `deleteDriveHandler` -> `removeDrive` -> `deleteDrive`
  - Collections (transaction): `Drives`, `Jobs`, `Candidate`
- `GET /print-drives`
  - `printDrivesHandler` -> `listDrives` -> `printDrives`
  - Collections: `Drives`, `Candidate` (derived stats sync)

### Job APIs
- `POST /job`
  - `insertJobHandler` -> `createJob` -> `insertJob`
  - Collection: `Jobs`
- `DELETE /job/:id`
  - `deleteJobHandler` -> `removeJob` -> `deleteJob`
  - Collection: `Jobs`
- `GET /print-jobs`
  - `printJobsHandler` -> `listJobs` -> `printJobs`
  - Collection: `Jobs`

### Panelist APIs
- `POST /panelist`
  - `insertPanelistHandler` -> `createPanelist` -> `insertPanelist`
  - Collection: `Panelist`
- `PUT /panelist/:id`
  - `updatePanelistHandler` -> `updatePanelistRecord` -> `updatePanelist`
  - Collection: `Panelist`
- `DELETE /panelist/:id`
  - `deletePanelistHandler` -> `removePanelist` -> `deletePanelist`
  - Collection: `Panelist`
- `GET /print-panelists`
  - `printPanelistsHandler` -> `listPanelists` -> `printPanelists`
  - Collection: `Panelist`

### User API
- `POST /Users`
  - `insertUsersHandler` -> `createUser` -> `insertUsers`
  - Collection: `Users`

---

## 8) Database Field Naming and Canonical Shapes

### Candidate (canonical in current code)
- `CandidateID` (generated sequence like `CND001`)
- `name`, `email`, `college`
- `AssignedJobs` (array)
- `driveId` (primary normalized drive reference; ObjectId string)
- `ApplicationStatus`
- `AssignedPanelist` (array)
- score/status-related fields as needed (`AptitudeScore`, `GDScore`, etc.)

Legacy fields recognized and normalized:
- `AssignedJob`
- `DriveID`, `AssignedDriveId`, `assignedDriveId`

### Drives
- `DriveID`
- `CollegeName`
- `StartDate`, `EndDate`
- `JobsOpening` (array)
- `Status`
- `CandidateIDs` (derived canonical candidate keys)
- `Selected`
- `NumberOfCandidates` is derived, not trusted as source-of-truth

Legacy recognized:
- `driveId`, `driveID`, `collegeName`, `jobsOpening`, `status`, `candidateIDs`, `candidateIds`, `selected`

### Jobs
- `JobID`, `JobName`
- `assignedCandidates` (candidate objectId strings)
- `Drive` object map (`Drive.<DriveID> = CollegeName`)
- `driveObjectIds` (list of linked drive objectId strings)
- `assignedPanelist` (array)

### Panelist
- `name`, `email`, `designation`, `expertise`
- `assignedJobs` (array)
- `scheduledRounds` (array of scheduling objects)

### Users
- `email`, `password` (if present in payload), plus custom fields
- `Role` forced to `"Candidate"` on insert

---

## 9) Core Business Logic Concepts Implemented

### 9.1 Candidate ID sequencing
- Maintained via `counters` collection (`candidateId` sequence).
- `getNextSequence` and `formatCandidateId` generate `CND###`.
- Includes cache and max-existing reconciliation to avoid collisions.

### 9.2 Legacy-to-canonical normalization
- Helper functions normalize mixed old/new field names.
- Output contracts always move toward canonical fields (for example `AssignedJobs`, `driveId`, `CandidateIDs`).
- Prevents UI/API breakage during schema evolution.

### 9.3 Cross-entity synchronization
- Candidate <-> Drive:
  - Candidate drive references update `Drives.CandidateIDs`.
  - Recalculation ensures drive candidate counts are derived from actual assignments.
- Candidate <-> Job:
  - Assigned job names update `Jobs.assignedCandidates`.
- Drive <-> Job:
  - `linkJobsToDrive` maintains `Jobs.Drive` mapping and `driveObjectIds`.

### 9.4 Transactional deletion safety
- Candidate deletion uses session transaction:
  - removes candidate
  - de-links jobs
  - de-links drives
  - removes panelist scheduled rounds for candidate
- Drive deletion uses session transaction:
  - deletes drive
  - cleans job drive mappings
  - clears candidate drive refs

### 9.5 Derived stats rather than trusting stale counters
- Drive candidate count is recalculated from candidate assignment queries.
- `NumberOfCandidates`/legacy count fields are unset when recalculation occurs.

### 9.6 Filtering and sorting conventions
- Most list views apply:
  - lowercase comparison for case-insensitive match
  - deterministic sort (`localeCompare`, numeric-aware when IDs include numbers)
- Candidate sorting uses `candidateSortKey` based on `CND` numeric suffix.

### 9.7 Recruitment flow templates
- Stored in localStorage (`recruitment_flow_templates_v1`).
- Keyed by `driveRef::jobName`.
- Used by:
  - `RecruitmentPipeline` (create/update)
  - `DriveCandidatesPage` and candidate dashboard logic (resolve flow)

---

## 10) Naming Organization Patterns

Patterns used consistently across project:
- Hook naming:
  - `use<Entity>` or `use<Feature>` for domain hooks.
- Loading/error flags:
  - `*Loading`, `*Error` (for example `drivesLoading`, `panelistsError`).
- Form models:
  - `new<Entity>` (for example `newDrive`, `newJob`, `newUser`, `newPanelist`).
- UI modal booleans:
  - `is*Open` or `show*Modal`.
- Handlers:
  - `handleCreate*`, `handleDelete*`, `handleUpdate*`, `open*`, `close*`.
- Derived collections:
  - `filtered*`, `unique*`, `available*`, `selected*`.
- Backend layering names:
  - Controller: `*Handler`
  - Service: semantic verbs (`create*`, `remove*`, `list*`, `update*`)
  - DB: persistence-centric names (`insert*`, `print*`, `delete*`, `edit*`)

---

## 11) End-to-End Data Flow Examples

### 11.1 Create Drive
1. UI (`DriveFormCard`) updates `newDrive` via `useDriveManagement`.
2. `handleCreateDrive` validates and calls frontend `createDrive`.
3. Backend `POST /drive` -> controller -> service -> `insertDrive`.
4. DB writes to `Drives`, then links listed jobs via `linkJobsToDrive`.
5. Hook reloads drives/jobs and UI re-renders.

### 11.2 Bulk Import Candidates for a Drive-Job
1. `DriveCandidatesPage` reads CSV via `parseCsvCandidates`.
2. Calls `bulkInsertCandidates(parsed, { forceDriveId, forceJobName })`.
3. Backend `POST /candidate/bulk` -> `insertManyCandidates`.
4. DB writes candidate rows with generated `CandidateID`.
5. Post-insert sync updates `Drives.CandidateIDs` and `Jobs.assignedCandidates`.
6. Page calls `reload()` from `useDriveCandidates`.

### 11.3 Update Candidate Assignment
1. `EditCandidateModal` saves through `saveCandidateEdits`.
2. Frontend calls `PATCH /candidate/:id`.
3. Backend `editcandidate` updates payload, normalizes jobs/drives.
4. Sync operations update `Jobs` and `Drives` memberships.

### 11.4 Drive Scoreboard Read Flow
1. `DriveJobCandidateScoreboardPage` chooses drive/job.
2. `useDriveJobScoreboard` fetches candidates, drives, jobs, panelists.
3. Hook filters by drive and job match, builds row objects.
4. UI table renders scores, panelist mappings, and status.

---

## 12) Important Current Boundaries

- Auth is localStorage-based (demo-level), not secure production auth.
- Recruitment flow templates are localStorage-based, not server persisted.
- Some pages are intentionally UI-only (`OfferApprovals`) and contain placeholder metrics.
- Legacy field support exists in DB logic; canonical field usage should be preferred for new code.

