# Campus Recruitment App: Hooks, Variables, and Data Flow Guide (Beginner Friendly)

This document helps you understand how data moves in this project and where each feature lives.

If you are new, start with these sections in order:
1. Quick Mental Model
2. Route to Hook Map
3. Hook Cheat Sheet
4. API Flow (Frontend to Backend)
5. Beginner Practice Tasks

---

## 1) Quick Mental Model

Think of the app in two halves.

Frontend flow:
`Page -> Hook -> Service -> API`

Backend flow:
`Route -> Controller -> Service -> DB`

When a button does not work, debug by following this chain in order.

---

## 2) Project Structure Map

### Frontend (UI + State)
- `Frontend/src/Pages`:
  - Screen-level components (Drive page, Candidate page, etc.)
- `Frontend/src/hooks`:
  - Reusable business logic per feature (`useCreateUsers`, `useDriveManagement`)
- `Frontend/src/services`:
  - API call functions (`fetchCandidates`, `createDrive`)
- `Frontend/src/Routes`:
  - Route definitions and auth guard
- `Frontend/src/Components`:
  - Reusable UI building blocks

### Backend (API + Data)
- `Backend/src/routes`:
  - URL endpoint registration
- `Backend/src/controllers`:
  - HTTP request/response handling
- `Backend/src/services`:
  - Use-case orchestration
- `Backend/src/db`:
  - MongoDB read/write logic
- `Backend/src/db/helpers.js`:
  - Core normalization and sync helpers

---

## 3) Route -> Page -> Hook Map

| Route | Page | Main Hook(s) | Why it exists |
|---|---|---|---|
| `/login` | `LoginPage` | None | Sets local auth flags for demo login |
| `/candidate-dashboard` | `CandidateDashboard` | `useCandidateDashboard` | Candidate summary + notifications |
| `/candidate/application` | `Applicationform` | `useCandidateApplicationForm` | Multi-step candidate application form |
| `/HR/dashboard` | `HRDashboard` | `useHrDashboard` | Top-level HR metrics |
| `/HR/dashboard/Drives` | `DriveManagement` | `useDriveManagement` | Drive CRUD + filtering |
| `/HR/dashboard/Drives/:driveId` | `DrivePage` | `useDrivePage` | Drive details + job breakdown |
| `/HR/dashboard/Create-Job` | `CreateJob` | `useCreateJob` | Job CRUD and assigned candidates |
| `/HR/dashboard/Create-Users` | `CreateUsers` | `useCreateUsers` | Candidate CRUD, import, bulk actions |
| `/HR/dashboard/Manage-Panelists` | `CreatePanelist` | `useCreatePanelist` | Panelist CRUD + scheduling |
| `/HR/dashboard/drive/:driveId/job/:jobId/candidates` | `DriveCandidatesPage` | `useDriveCandidates` | Candidates for one drive-job pair |
| `/HR/dashboard/Drive-Job-Scoreboard` | `DriveJobCandidateScoreboardPage` | `useDriveJobScoreboard` | Leaderboard view |
| `/HR/dashboard/drive/:driveId/job/:jobId/scoreboard` | `DriveJobCandidateScoreboardPage` | `useDriveJobScoreboard` | Context mode leaderboard |
| `/HR/dashboard/Recruitment-Pipeline` | `RecruitmentPipeline` | Page state + utils | Save/list/delete flow templates |
| `/HR/dashboard/Aptitude-Test-Management` | `AptitudeTestManagement` | Page state | Aptitude dispatch flow |
| `/HR/dashboard/Offer-Approvals` | `OfferApprovals` | None | UI-only approvals table |

---

## 4) Navigation Inventory

### Auth Guard
- `ProtectedRoute.jsx`
- Uses localStorage key check:
  - Candidate: `candidate_auth`
  - HR: `hr_auth`

### Main HR Drawer
- `Components/common/HrSlideDrawer.jsx`
- Navigation groups:
  - Core: Dashboard, Drives, Jobs, Candidates, Panelists
  - Process: Pipeline, Aptitude, Offer Approvals, Candidate Scoreboard

### In-page Navigation Pattern
- Many pages use query param `view` with `useSearchParams`.
- Example: `CreateUsers`, `CreateJob`, `DriveManagement`, `RecruitmentPipeline`.

---

## 5) Hook Cheat Sheet (What each hook controls)

Use this section like a quick glossary.

### `useDriveManagement`
Purpose:
- Create/edit/delete drives, filter drives, calculate drive stats.

Important state:
- `drives`, `jobs`, `newDrive`
- `searchTerm`, `statusFilter`, `collegeFilter`
- `isEditOpen`, `editingDrive`

Important actions:
- `handleCreateDrive`
- `handleDeleteDrive`
- `saveDriveEdits`

### `useCreateJob`
Purpose:
- Manage jobs and inspect assigned candidates per job.

Important state:
- `jobs`, `newJob`, `jobSearchTerm`

Important actions:
- `handleCreateJob`
- `handleDeleteJob`
- `getCandidatesForJob`

### `useCreateUsers`
Purpose:
- Manage candidates, CSV import/export, drive/job assignment logic, candidate edits.

Important state:
- `candidates`, `jobs`, `drives`
- `newUser`
- `searchTerm`, `collegeFilter`, `jobFilter`
- `isAssignOpen`, `isEditOpen`

Important actions:
- `handleCreateCandidate`
- `handleDeleteCandidate`
- `handleDeleteCandidatesBulk`
- `handleAssigned`
- `saveCandidateEdits`
- `onFileChange` (CSV import)

### `useCreatePanelist`
Purpose:
- Panelist CRUD, assign panelist jobs, schedule interview rounds.

Important state:
- `panelists`, `fetchedJobs`, `fetchedCandidates`
- `selectedPanelist`
- `selectedJobsForAssignment`
- `scheduleData`

Important actions:
- `handleCreatePanelist`
- `handleDeletePanelist`
- `saveAssignments`
- `scheduleRound`

### `useDrivePage`
Purpose:
- Build drive detail page data.

Important output:
- `drive`
- `jobRows` (candidate and panelist summary per job)
- `loading`, `error`

### `useDriveCandidates`
Purpose:
- Build candidate list for one drive+job context.

Important output:
- `filteredCandidates`
- `splitAssignedJobs`
- `reload`

### `useDriveJobScoreboard`
Purpose:
- Build leaderboard rows for selected drive and job.

Important output:
- `rows`
- `driveLabel`
- `loading`, `error`

### `useHrDashboard`
Purpose:
- Fetch high-level counts for HR dashboard.

### `useCandidateApplicationForm`
Purpose:
- Multi-step form control, validation, and submit behavior.

### `useCandidateDashboard`
Purpose:
- Candidate dashboard card data and notification controls.

### `useKonamiConfetti`
Purpose:
- Hidden keyboard sequence effect.

### `useToast`
Purpose:
- Access toast context with alert fallback.

---

## 6) Pages with heavy local state (No dedicated custom hook)

### `RecruitmentPipeline`
Handles:
- Drive/job selectors
- Flow stage selection
- Save/delete/list recruitment flow templates

Uses utility:
- `utils/recruitmentFlowTemplates.js`

### `AptitudeTestManagement`
Handles:
- Candidate target filtering
- Aptitude link dispatch queue
- Selection and local log state

### `DriveCandidatesPage`
Handles:
- CSV import for a specific drive-job
- Clickable candidate rows
- Candidate detail modal card

### `DriveJobCandidateScoreboardPage`
Handles:
- Drive/job selector UI
- Passes selected context into `useDriveJobScoreboard`

---

## 7) Frontend Service -> Backend Endpoint Map

| Frontend service function | HTTP | Endpoint |
|---|---|---|
| `fetchCandidates` | GET | `/print-candidates` |
| `createCandidate` | POST | `/candidate` |
| `bulkInsertCandidates` | POST | `/candidate/bulk` |
| `updateCandidate` | PATCH | `/candidate/:id` |
| `deleteCandidate` | DELETE | `/candidate/:id` |
| `fetchDrives` | GET | `/print-drives` |
| `fetchDriveById` | GET | `/drive/:id` |
| `createDrive` | POST | `/drive` |
| `updateDrive` | PUT | `/drive/:id` |
| `deleteDrive` | DELETE | `/drive/:id` |
| `fetchJobs` | GET | `/print-jobs` |
| `createJob` | POST | `/job` |
| `deleteJob` | DELETE | `/job/:id` |
| `fetchPanelists` | GET | `/print-panelists` |
| `createPanelist` | POST | `/panelist` |
| `updatePanelist` | PUT | `/panelist/:id` |
| `deletePanelist` | DELETE | `/panelist/:id` |

---

## 8) Backend Chain Map (Route -> Controller -> Service -> DB)

### Candidates
- `/candidate` -> `insertCandidateHandler` -> `createCandidate` -> `db/candidate/create.js`
- `/candidate/bulk` -> `insertManyCandidatesHandler` -> `createManyCandidates` -> `db/candidate/create.js`
- `/print-candidates` -> `printCandidatesHandler` -> `listCandidates` -> `db/candidate/read.js`
- `/candidate/:id` PATCH -> `editcandidateHandler` -> `updateCandidate` -> `db/candidate/update.js`
- `/candidate/:id` DELETE -> `deleteCandidateHandler` -> `removeCandidate` -> `db/candidate/delete.js`

### Drives
- `/drive` POST -> `insertDriveHandler` -> `createDrive` -> `db/drive.js`
- `/drive/:id` GET -> `getDriveByIdHandler` -> `getDrive` -> `db/drive.js`
- `/drive/:id` PUT -> `updateDriveHandler` -> `updateDrive` -> `db/drive.js`
- `/drive/:id` DELETE -> `deleteDriveHandler` -> `removeDrive` -> `db/drive.js`
- `/print-drives` GET -> `printDrivesHandler` -> `listDrives` -> `db/drive.js`

### Jobs
- `/job` POST -> `insertJobHandler` -> `createJob` -> `db/job.js`
- `/job/:id` DELETE -> `deleteJobHandler` -> `removeJob` -> `db/job.js`
- `/print-jobs` GET -> `printJobsHandler` -> `listJobs` -> `db/job.js`

### Panelists
- `/panelist` POST -> `insertPanelistHandler` -> `createPanelist` -> `db/panelist.js`
- `/panelist/:id` PUT -> `updatePanelistHandler` -> `updatePanelistRecord` -> `db/panelist.js`
- `/panelist/:id` DELETE -> `deletePanelistHandler` -> `removePanelist` -> `db/panelist.js`
- `/print-panelists` GET -> `printPanelistsHandler` -> `listPanelists` -> `db/panelist.js`

### Users
- `/Users` POST -> `insertUsersHandler` -> `createUser` -> `db/users.js`

---

## 9) Important Business Rules (Beginner must know)

1. Candidate IDs are generated (`CND###`) using counter logic.
2. Legacy fields are normalized to canonical names.
3. Candidate, drive, and job mappings are synchronized after changes.
4. Deletions clean cross-entity references.
5. Some features are localStorage-driven (for example recruitment flow templates).
6. Login/auth in this project is demo-level localStorage auth.

---

## 10) Canonical Data Field Names

### Candidate
- `CandidateID`, `name`, `email`, `college`
- `AssignedJobs` (array)
- `driveId`

### Drive
- `DriveID`, `CollegeName`, `StartDate`, `EndDate`
- `JobsOpening` (array)
- `Status`
- `CandidateIDs`

### Job
- `JobID`, `JobName`
- `assignedCandidates` (array)
- `Drive` (map)

### Panelist
- `name`, `email`, `designation`, `expertise`
- `assignedJobs` (array)
- `scheduledRounds` (array)

---

## 11) LocalStorage Keys Used

Auth keys:
- `candidate_auth`
- `candidate_name`
- `candidate_email`
- `hr_auth`
- `hr_email`

Feature keys:
- `recruitment_flow_templates_v1`
- `aptitude_dispatch_log_v1`
- `aptitude_dispatch_counter_v1`

---

## 12) Naming Patterns You Should Follow

State naming:
- loading flags: `*Loading`
- error messages: `*Error`
- selected item: `selected*`
- filtered lists: `filtered*`

Function naming:
- mutate/create: `handleCreate*`
- update: `handleUpdate*`, `save*`
- delete: `handleDelete*`
- open/close UI: `open*`, `close*`

---

## 13) How to Debug a Feature Quickly

Use this checklist:
1. Confirm route and page are correct.
2. Check page calls correct hook method.
3. Check hook calls correct service function.
4. Check service endpoint and HTTP method.
5. Check backend route/controller/service/db chain.
6. Check DB helper side-effects and field normalization.

---

## 14) Beginner Practice Tasks

1. Trace candidate creation end-to-end from UI to DB.
2. Trace drive deletion and list all affected collections.
3. Add one new field in candidate edit flow (frontend + backend).
4. Add one filter in a list page and follow it through hook derived state.

---

## 15) One-line Summary

If you understand `Page -> Hook -> Service -> Route -> Controller -> Service -> DB`, you can understand and safely change this project.
