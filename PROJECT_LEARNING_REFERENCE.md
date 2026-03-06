# Campus Recruitment App Learning Reference (Basic to Advanced)

This file is a complete learning roadmap for this project.  
Follow the phases in order. Each phase includes:
- What to learn
- Where it appears in this codebase
- Official references

---

## 0) Project Snapshot (What You Are Building)

### Current stack in this repo
- Frontend: React 19, React Router, Axios, Tailwind CSS v4, DaisyUI, Vite
- Backend: Node.js (ESM), Express 5, MongoDB Node Driver, dotenv, cors
- Data: MongoDB collections for Candidate, Drives, Jobs, Panelist, Users
- Architecture style: Route -> Controller -> Service -> DB module

### Key folders
- `Frontend/src` - UI pages, components, hooks, services
- `Backend/src` - server app, routes, controllers, services, db layer
- `Backend/src/db` - database connection, helpers, and domain DB methods

---

## 1) Web and Programming Fundamentals (Start Here)

### Topics
1. How the web works: browser, server, request/response, HTTP basics
2. HTML document structure and forms
3. CSS fundamentals: box model, flexbox, grid, responsive design
4. JavaScript basics: variables, functions, arrays, objects, loops
5. JavaScript runtime basics: call stack, event loop, async behavior

### Where used in this project
- Form handling and UI pages: `Frontend/src/Pages`
- HTTP flow to backend: `Frontend/src/services` and `Backend/src/routes`

### References
- https://developer.mozilla.org/en-US/docs/Learn
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview
- https://developer.mozilla.org/en-US/docs/Web/JavaScript

---

## 2) Modern JavaScript for Real Projects

### Topics
1. ES Modules (`import`/`export`)
2. Destructuring, spread, optional chaining
3. Array methods (`map`, `filter`, `reduce`, `find`, `some`)
4. `async`/`await`, `try/catch`, promise error handling
5. Object immutability patterns for UI state
6. Date parsing/formatting and edge cases

### Where used
- ESM backend entry: `Backend/server.js`, `Backend/src/app.js`
- Async data fetch and updates: `Frontend/src/hooks`, `Frontend/src/services`
- Data normalization logic: `Backend/src/db/helpers.js`, `Frontend/src/hooks/useDriveManagement.js`

### References
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide
- https://javascript.info/

---

## 3) Git, Repository Workflow, and Code Discipline

### Topics
1. Git basics: clone, branch, commit, pull, merge
2. Reading diffs and reviewing changes safely
3. Keeping commits focused (one concern per commit)
4. Avoiding accidental secrets in commits

### Where used
- Entire repo workflow

### References
- https://git-scm.com/doc
- https://www.atlassian.com/git/tutorials

---

## 4) Node.js and npm Basics

### Topics
1. Node.js runtime, process lifecycle, environment variables
2. npm scripts and dependency management
3. ESM in Node (`"type": "module"`)
4. Dev vs prod dependencies
5. `nodemon` for backend development loop

### Where used
- `Backend/package.json`
- `Backend/server.js`

### References
- https://nodejs.org/en/learn
- https://docs.npmjs.com/

---

## 5) React Core (Frontend Foundation)

### Topics
1. Functional components and JSX
2. Props, local state, controlled forms
3. Hooks: `useState`, `useEffect`, `useMemo`, `useRef`
4. Component composition and reusable UI blocks
5. Render performance basics and memoization use cases

### Where used
- `Frontend/src/Pages`
- `Frontend/src/Components`
- `Frontend/src/hooks`

### References
- https://react.dev/learn
- https://react.dev/reference/react

---

## 6) Routing and Client-Side Access Control

### Topics
1. SPA routing concepts
2. React Router route trees, nested routes, redirects
3. Guarded routes with wrapper components
4. Local storage based auth state (current implementation)

### Where used
- `Frontend/src/Routes/AppRoutes.jsx`
- `Frontend/src/Routes/ProtectedRoute.jsx`
- `Frontend/src/Pages/Common/LoginPage.jsx`
- `Frontend/src/data/tempAuth.json`

### References
- https://reactrouter.com/home
- https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage

---

## 7) UI Styling System (Tailwind + DaisyUI + Custom CSS)

### Topics
1. Utility-first CSS with Tailwind
2. Component-level styling patterns
3. Design consistency with tokens/palette
4. Responsive layout and spacing scale
5. Accessibility basics in forms and interactive controls

### Where used
- `Frontend/src/index.css`
- `Frontend/src/theme/hrPalette.js`
- `Frontend/src/Components/**/*`

### References
- https://tailwindcss.com/docs
- https://daisyui.com/docs/intro/
- https://www.w3.org/WAI/fundamentals/accessibility-intro/

---

## 8) Frontend Data Layer and State Architecture

### Topics
1. Service layer pattern for API calls
2. Axios instance configuration and base URL strategy
3. Feature hooks pattern (`useCreateUsers`, `useDriveManagement`, etc.)
4. Local UI state vs derived state (`useMemo`)
5. Context API for cross-app concerns (toasts)
6. Error/loading handling patterns

### Where used
- API client: `Frontend/src/services/apiClient.js`
- Domain services: `Frontend/src/services/*.js`
- Hooks: `Frontend/src/hooks/*.js`
- Toast context/provider: `Frontend/src/context/toastContext.js`, `Frontend/src/Components/common/ToastProvider.jsx`

### References
- https://axios-http.com/docs/intro
- https://react.dev/learn/scaling-up-with-reducer-and-context
- https://react.dev/learn/reusing-logic-with-custom-hooks

---

## 9) Express Backend Fundamentals

### Topics
1. Express app initialization and middleware chain
2. JSON body parsing and CORS
3. Route registration strategy
4. Health endpoints and startup lifecycle
5. Graceful shutdown

### Where used
- `Backend/src/app.js`
- `Backend/src/routes/index.js`
- `Backend/server.js`

### References
- https://expressjs.com/en/guide/routing.html
- https://expressjs.com/en/guide/using-middleware.html
- https://www.npmjs.com/package/cors

---

## 10) Backend Layering and Separation of Concerns

### Topics
1. Route -> Controller -> Service -> DB flow
2. Controller responsibilities: request parsing + HTTP response shaping
3. Service responsibilities: use-case orchestration
4. DB layer responsibilities: persistence and collection logic
5. Keeping business rules close to data consistency operations

### Where used
- Routes: `Backend/src/routes/*.js`
- Controllers: `Backend/src/controllers/*.js`
- Services: `Backend/src/services/*.js`
- DB modules: `Backend/src/db/*.js`

### References
- https://martinfowler.com/eaaCatalog/serviceLayer.html
- https://expressjs.com/en/advanced/best-practice-security.html

---

## 11) MongoDB and Data Modeling

### Topics
1. MongoDB collections, documents, ObjectId
2. CRUD with MongoDB Node Driver
3. Query filters, regex usage, sorting, projection
4. Updating arrays (`$addToSet`, `$pull`, `$each`)
5. Transaction basics and sessions
6. Data modeling tradeoffs: embedded vs referenced data

### Where used
- Connection/session: `Backend/src/db/core.js`
- Helper utilities and cross-collection logic: `Backend/src/db/helpers.js`
- Domain DB files: `Backend/src/db/Candidate.js`, `drive.js`, `job.js`, `panelist.js`, `users.js`

### References
- https://www.mongodb.com/docs/drivers/node/current/
- https://www.mongodb.com/docs/manual/crud/
- https://www.mongodb.com/docs/manual/core/write-operations-atomicity/

---

## 12) Core Domain Logic in This Project (Must Learn Deeply)

### Candidate logic topics
1. Candidate ID sequence generation (`CND###`)
2. Single insert vs bulk insert flows
3. CSV import payload normalization
4. Assigning jobs and drives during create/update
5. Syncing candidate membership in drives
6. Deletion cleanup across jobs, drives, panelist schedules

### Drive logic topics
1. Drive creation with unique `DriveID`
2. Drive to jobs linking
3. Candidate count derivation and maintenance
4. Drive update side-effects (jobs/candidates sync)
5. Drive deletion cascading cleanup

### Job logic topics
1. Job creation and drive mapping
2. Candidate assignment synchronization

### Panelist logic topics
1. CRUD lifecycle
2. Scheduled rounds data cleanup on candidate delete

### Where used
- `Backend/src/db/Candidate.js`
- `Backend/src/db/drive.js`
- `Backend/src/db/job.js`
- `Backend/src/db/panelist.js`
- `Backend/src/db/helpers.js`

---

## 13) API Design and Contract Management

### Topics
1. REST endpoint naming consistency
2. HTTP status codes and structured response body format
3. Pagination/filter query patterns
4. Validation strategy for body/query/params
5. Backward-compatible API changes

### Current endpoints to understand
- `POST /candidate`
- `POST /candidate/bulk`
- `GET /print-candidates`
- `PATCH /candidate/:id`
- `DELETE /candidate/:id`
- `POST /drive`
- `GET /drive/:id`
- `PUT /drive/:id`
- `DELETE /drive/:id`
- `GET /print-drives`
- `POST /job`
- `DELETE /job/:id`
- `GET /print-jobs`
- `POST /panelist`
- `PUT /panelist/:id`
- `DELETE /panelist/:id`
- `GET /print-panelists`
- `POST /Users`

### Where used
- `Backend/src/routes/*.js`
- `Frontend/src/services/*.js`

### References
- https://restfulapi.net/
- https://developer.mozilla.org/en-US/docs/Web/HTTP/Status

---

## 14) Local Development Setup and Local Hosting

### Topics
1. Environment variable management
2. Running frontend and backend concurrently
3. Vite proxy in development
4. LAN access for testing on other devices
5. Debugging runtime errors and network calls

### Standard local setup (Windows PowerShell)
1. Backend setup
```powershell
cd Backend
npm install
Copy-Item .env.example .env -Force
# Then edit .env with real values
npm run dev
```
2. Frontend setup
```powershell
cd Frontend
npm install
npm run dev
```

### LAN hosting (optional)
1. Backend `.env`:
```env
HOST=0.0.0.0
PORT=5000
NODE_ENV=development
```
2. Start frontend with host binding:
```powershell
cd Frontend
npm run dev -- --host
```
3. Access from another device:
- `http://<your-machine-ip>:5173`

### Where used
- Backend env: `Backend/.env`, `Backend/.env.example`
- Frontend env/proxy: `Frontend/.env`, `Frontend/vite.config.js`

### References
- https://vite.dev/config/server-options.html
- https://vite.dev/guide/env-and-mode
- https://www.freecodecamp.org/news/how-to-use-node-environment-variables-with-a-dotenv-file-for-node-js-and-npm/

---

## 15) Build, Production, and Deployment Topics

### Topics
1. Frontend production build process
2. Serving static frontend with backend or separate hosting
3. Production environment configuration
4. CORS tightening for production domains
5. Reverse proxy (Nginx/Caddy) basics
6. Process management (PM2/systemd/container)
7. HTTPS/TLS setup and secure headers

### Basic production flow for this stack
1. Build frontend:
```powershell
cd Frontend
npm run build
```
2. Serve frontend:
- Option A: static host (Netlify/Vercel/S3) and point API to backend URL
- Option B: serve `Frontend/dist` through Express (the scaffold comments exist in `Backend/src/app.js`)
3. Set backend `NODE_ENV=production` and strict CORS allowlist
4. Set frontend `VITE_API_BASE=https://your-api-domain`

### References
- https://vite.dev/guide/build
- https://expressjs.com/en/starter/static-files.html
- https://expressjs.com/en/advanced/best-practice-performance.html
- https://pm2.keymetrics.io/docs/usage/quick-start/
- https://nginx.org/en/docs/

---

## 16) Testing and Quality Engineering

### Topics
1. Linting and static analysis
2. Unit testing for helper logic
3. Integration testing for API endpoints
4. End-to-end testing for key user flows
5. Test data strategy and isolated test DB

### Where used
- Lint config in frontend scripts: `Frontend/package.json`
- High-value test targets:
  - `Backend/src/db/helpers.js`
  - `Backend/src/db/Candidate.js`
  - `Frontend/src/hooks/useCreateUsers.js`
  - `Frontend/src/hooks/useDriveManagement.js`

### References
- https://eslint.org/docs/latest/
- https://jestjs.io/docs/getting-started
- https://www.cypress.io/
- https://playwright.dev/docs/intro

---

## 17) Security Hardening (Critical Before Real Production)

### Topics
1. Proper authentication and authorization (replace temp/localStorage auth)
2. Password hashing (bcrypt/argon2) and secure login flow
3. JWT/session management and token expiration
4. Input validation and sanitization
5. Rate limiting and brute-force protection
6. CORS policy hardening and CSRF considerations
7. Secrets management and credential rotation
8. Security headers (`helmet`)

### Current security realities in this repo
1. Login is client-side demo (`tempAuth.json`) and not production-safe
2. No robust server auth middleware yet
3. Backend currently trusts many payload fields

### References
- https://cheatsheetseries.owasp.org/
- https://expressjs.com/en/advanced/best-practice-security.html
- https://www.npmjs.com/package/helmet
- https://www.npmjs.com/package/express-rate-limit

---

## 18) Performance and Scalability

### Topics
1. MongoDB indexing strategy for frequent filters and joins
2. Query optimization and projection
3. Pagination strategy (offset vs cursor)
4. Backend response time profiling
5. Caching strategies (in-memory/Redis)
6. Horizontal scaling considerations

### Where it matters most
- Candidate listing/filtering: `printCandidates`
- Drive listing with derived counts: `printDrives`
- Bulk candidate import and post-insert sync: `insertManyCandidates`

### References
- https://www.mongodb.com/docs/manual/indexes/
- https://www.mongodb.com/docs/manual/core/query-optimization/
- https://web.dev/fast/

---

## 19) Observability, Operations, and Reliability

### Topics
1. Structured logging and log levels
2. Request tracing and correlation IDs
3. Error monitoring and alerting
4. Health checks and readiness checks
5. Backup and restore strategy for MongoDB
6. Incident response basics

### References
- https://opentelemetry.io/docs/
- https://sre.google/sre-book/table-of-contents/
- https://www.mongodb.com/docs/atlas/backup/

---

## 20) Advanced Engineering Track (After Production Basics)

### Topics
1. CI/CD pipeline (lint, test, build, deploy)
2. Dockerizing frontend/backend
3. IaC basics (Terraform or similar)
4. Feature flags and gradual rollouts
5. Event-driven workflows (queue/background jobs)
6. Multi-environment config governance

### References
- https://docs.github.com/en/actions
- https://docs.docker.com/get-started/
- https://martinfowler.com/articles/feature-toggles.html

---

## Project-Specific Learning Checklist (Fast Track)

Do these in order:
1. Understand route flow by tracing one endpoint end-to-end (`/candidate`).
2. Understand frontend call flow from hook -> service -> backend route.
3. Master `Backend/src/db/helpers.js` utilities and why they exist.
4. Deep dive `insertManyCandidates` and deletion side effects.
5. Run full local setup and verify create/read/update/delete for each entity.
6. Add one validation layer (Joi/Zod/express-validator) and test it.
7. Add real auth (backend token/session) and replace `tempAuth`.
8. Add automated tests for candidate and drive critical paths.
9. Prepare production build and deploy to one staging environment.
10. Add monitoring and backup before real user usage.

---

## Recommended Official References by Area

1. React: https://react.dev/
2. React Router: https://reactrouter.com/
3. Vite: https://vite.dev/
4. Tailwind CSS: https://tailwindcss.com/docs
5. Axios: https://axios-http.com/docs/intro
6. Node.js: https://nodejs.org/en/docs
7. Express: https://expressjs.com/
8. MongoDB Node Driver: https://www.mongodb.com/docs/drivers/node/current/
9. ESLint: https://eslint.org/docs/latest/
10. OWASP: https://cheatsheetseries.owasp.org/

