# Campus Recruitment App Learning Roadmap (Teacher Version)

This file is your guided learning path for this project.

Goal:
- Learn the project in the correct order
- Know exactly what to open in code
- Move from beginner to confident contributor

How to use this file:
1. Follow phases in order.
2. Complete the practice task at the end of each phase.
3. Do not jump to advanced topics too early.

---

## Phase 0: First-Day Orientation (30 to 60 min)

### What to understand
- This is a full-stack app.
- Frontend and backend are separate apps.
- Data is stored in MongoDB.

### Open these files first
- `Frontend/src/Routes/AppRoutes.jsx`
- `Frontend/src/Components/common/HrSlideDrawer.jsx`
- `Backend/src/routes/index.js`

### Outcome
You should be able to answer:
- What pages exist?
- Which URL opens each page?
- Which backend route files exist?

### Practice
- Write a simple map in your notebook: `Route -> Page` for 5 HR screens.

---

## Phase 1: Run the Project Locally

### Backend
```powershell
cd Backend
npm install
npm run dev
```

### Frontend
```powershell
cd Frontend
npm install
npm run dev
```

### Scripts you should know
- Frontend: `dev`, `build`, `lint`, `preview`
- Backend: `dev`, `start`

### Outcome
You can run both sides and log in as Candidate and HR.

### Practice
- Open DevTools Network tab and observe one API call when loading Candidate List.

---

## Phase 2: Frontend Fundamentals in This Project

### Learn these concepts
- Page components
- Reusable components
- Custom hooks
- Service layer

### Open these folders
- `Frontend/src/Pages`
- `Frontend/src/Components`
- `Frontend/src/hooks`
- `Frontend/src/services`

### Golden rule
A page should not directly call API URLs. It should call a hook, and the hook should call a service.

### Practice
- Trace this exact chain:
  - `CreateUsers.jsx` -> `useCreateUsers.js` -> `candidatesService.js`

---

## Phase 3: Routing and Auth Flow

### Learn these concepts
- Protected routes
- Role-based guard via localStorage
- Redirect behavior

### Open these files
- `Frontend/src/Routes/ProtectedRoute.jsx`
- `Frontend/src/Pages/Common/LoginPage.jsx`

### Important note
Current auth is demo-level localStorage auth. It is useful for development, not production.

### Practice
- Temporarily remove `hr_auth` in browser localStorage and observe route redirect behavior.

---

## Phase 4: Backend Fundamentals in This Project

### Learn these concepts
- Express routing
- Controller responsibility
- Service responsibility
- DB layer responsibility

### Open these files
- `Backend/src/routes/*.js`
- `Backend/src/controllers/*.js`
- `Backend/src/services/*.js`
- `Backend/src/db/*.js`

### Mental model
- Route: URL mapping
- Controller: HTTP in/out
- Service: business use case
- DB: data persistence

### Practice
- Trace `POST /candidate` from route to DB implementation.

---

## Phase 5: MongoDB Data and Domain Logic

### Collections used
- `Candidate`
- `Drives`
- `Jobs`
- `Panelist`
- `Users`
- `counters`

### Must-read files
- `Backend/src/db/helpers.js`
- `Backend/src/db/candidate/create.js`
- `Backend/src/db/candidate/update.js`
- `Backend/src/db/candidate/delete.js`
- `Backend/src/db/drive.js`

### Why this matters
This project has cross-entity sync logic. Changing one entity can update others.

### Practice
- Read candidate delete flow and list every related entity that gets updated.

---

## Phase 6: High-Value Features to Master

### 1) Candidate Management
Focus files:
- `Frontend/src/Pages/HR/CreateUsers.jsx`
- `Frontend/src/hooks/useCreateUsers.js`
- `Frontend/src/Components/users/*`

What to understand:
- Candidate CRUD
- Bulk selection
- Bulk job assignment
- Bulk delete
- CSV import/export

### 2) Drive Management
Focus files:
- `Frontend/src/Pages/HR/DriveManagement.jsx`
- `Frontend/src/hooks/useDriveManagement.js`
- `Frontend/src/Components/drivemanagement/*`

What to understand:
- Drive creation/update/delete
- Filtering and stats
- Clicking drive row opens drive details

### 3) Drive Job Candidate Flow
Focus files:
- `Frontend/src/Pages/HR/DrivePage.jsx`
- `Frontend/src/Pages/HR/DriveCandidatesPage.jsx`
- `Frontend/src/hooks/useDrivePage.js`
- `Frontend/src/hooks/useDriveCandidates.js`

What to understand:
- Drive -> Job -> Candidates navigation
- Clickable candidate rows
- Candidate details card modal

### 4) Leaderboard
Focus files:
- `Frontend/src/Pages/HR/DriveJobCandidateScoreboardPage.jsx`
- `Frontend/src/hooks/useDriveJobScoreboard.js`

What to understand:
- Selector mode and context mode
- Row-building logic
- Score/status rendering

### 5) Recruitment Pipeline Templates
Focus files:
- `Frontend/src/Pages/HR/RecruitmentPipeline.jsx`
- `Frontend/src/utils/recruitmentFlowTemplates.js`

What to understand:
- LocalStorage-based flow templates
- Save/list/delete behavior
- Key normalization and cleanup

---

## Phase 7: API Contracts You Should Memorize

### Candidate APIs
- `POST /candidate`
- `POST /candidate/bulk`
- `GET /print-candidates`
- `PATCH /candidate/:id`
- `DELETE /candidate/:id`

### Drive APIs
- `POST /drive`
- `GET /drive/:id`
- `PUT /drive/:id`
- `DELETE /drive/:id`
- `GET /print-drives`

### Job APIs
- `POST /job`
- `DELETE /job/:id`
- `GET /print-jobs`

### Panelist APIs
- `POST /panelist`
- `PUT /panelist/:id`
- `DELETE /panelist/:id`
- `GET /print-panelists`

### Users API
- `POST /Users`

### Practice
- Pick one endpoint and verify:
  - frontend service function
  - route handler
  - controller
  - service
  - db function

---

## Phase 8: Debugging and Reading Strategy

Use this debugging ladder:
1. UI event is firing?
2. Hook method called?
3. Service method called?
4. HTTP request sent?
5. Correct backend route hit?
6. Controller response status/body correct?
7. DB changes actually persisted?
8. Frontend state refreshed after mutation?

Quick tools:
- Frontend console
- Browser network tab
- Backend terminal logs

---

## Phase 9: Beginner Safe Contribution Plan

Do these tasks in order:
1. Rename one UI label in a page and run lint.
2. Add one filter input in a list page using existing hook pattern.
3. Add one small display field in a modal card.
4. Add one backend validation message in controller.
5. Add one helper function test target (if test setup is introduced).

---

## Common Mistakes to Avoid

1. Calling API directly from page instead of service.
2. Mutating state directly instead of immutable updates.
3. Ignoring normalization rules for legacy field names.
4. Forgetting side-effects when deleting entities.
5. Hardcoding strings in many places instead of centralizing.

---

## Official References (Use these while learning)

Frontend:
- React: https://react.dev/
- React Router: https://reactrouter.com/
- Vite: https://vite.dev/
- Tailwind: https://tailwindcss.com/docs
- Axios: https://axios-http.com/docs/intro

Backend:
- Node.js: https://nodejs.org/en/docs
- Express: https://expressjs.com/
- MongoDB Node Driver: https://www.mongodb.com/docs/drivers/node/current/

Quality and security:
- ESLint: https://eslint.org/docs/latest/
- OWASP: https://cheatsheetseries.owasp.org/

---

## 7-Day Beginner Study Plan (Suggested)

Day 1:
- Run project
- Understand route map
- Understand auth guard

Day 2:
- Study `CreateUsers` end-to-end
- Observe API calls

Day 3:
- Study `DriveManagement` and `DrivePage`
- Follow row-click navigation flow

Day 4:
- Study backend candidate and drive modules
- Focus on `helpers.js`

Day 5:
- Study recruitment pipeline templates and leaderboard flow

Day 6:
- Make one small frontend improvement and lint it

Day 7:
- Make one small backend improvement and verify manually

---

## Final Advice

If you are confused, do not read random files.
Trace one complete user action from button click to DB write and back to UI refresh.
That single habit will make you productive quickly in this codebase.
