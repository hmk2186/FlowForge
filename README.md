# FlowForge – Visual Workflow Automation Platform

FlowForge is a full-stack SaaS visual workflow automation platform built on the MERN stack (MongoDB, Express, React, Node.js). It enables users to visually create, connect, configure, save, validate, and execute complex automated workflows through a modern drag-and-drop node-based canvas powered by `@xyflow/react`.

---

## 🌟 Key Highlights & USP

- **Public SaaS Landing Page:** Modern homepage featuring interactive hero previews, feature breakdowns, How It Works, node showcases, and pre-built templates.
- **Guest Builder (No Login Required):** Visitors can explore the visual canvas at `/builder`, arrange nodes, configure parameters, test templates, and save their work locally in the browser (`localStorage`).
- **Safe Client-Side Demo Simulation:** Guests can run realistic workflow simulations with mock data directly in browser memory — no authentication bypass and no server abuse.
- **1-Click Workflow Import:** Preserves any workflow designed during a guest session and offers a 1-click import into MongoDB upon signing in or creating an account.
- **Real Backend Workflow Execution Engine:** Authenticated workflows are executed by a topological graph traversal engine on the backend, supporting dynamic payload passing, branch evaluation, timeouts, and user cancellation.
- **5 Working Node Types:**
  1. **Trigger Node:** Initiates workflow execution with customizable JSON payload context.
  2. **Action Node:**
     - *Log Message:* Dynamic string template interpolation (e.g., `{{data.userName}}`).
     - *Create Task / Record:* **Persists actual documents in MongoDB** via the `TaskRecord` collection.
     - *HTTP Request:* Connects to external services.
     - *Data Transformation:* String manipulation, arrays, counts, and mathematical operations.
  3. **Condition Node:** Evaluates expressions (`equals`, `not_equals`, `greater_than`, `less_than`, `contains`) and splits execution across **True** and **False** branches.
  4. **Delay Node:** Pauses execution for a specified duration in seconds or minutes with cancellation support.
  5. **Webhook Node:** Executes external HTTP calls with strict SSRF protection (blocking localhost and private IP addresses).
- **Execution Progress via Simple Polling:** The frontend checks active runs every 1.5 seconds via standard HTTP polling, displaying live step results without WebSocket overhead.
- **Demo Account & Realistic Demo Data System:** Pre-seeded demo account (`demo@flowforge.com` / `Demo@123`) with 5 configured demo workflows, 16+ execution histories, and persistent task records.
- **Modern SaaS Design:** Responsive layout with dark navy/charcoal sidebar, indigo/violet accents, collapsible menus, and comprehensive light/dark mode support.

---

## 🛠 Technology Stack

### Frontend
- **Framework:** React.js (v18) + Vite
- **Styling:** Tailwind CSS (Class-based Dark Mode)
- **Routing:** React Router DOM (v6) with Public Landing Page, Guest Builder, and Protected Workspace routes
- **Canvas:** `@xyflow/react` (React Flow v12)
- **State Management:** React Context API + `useReducer`
- **Data Fetching:** Axios with JWT request & response interceptors
- **Forms & Validation:** `react-hook-form` + `zod`
- **Charts:** `recharts` (Area trends & Donut breakdown)
- **Icons:** `lucide-react`
- **Date Utilities:** `date-fns`

### Backend
- **Runtime:** Node.js (ES6+)
- **Framework:** Express.js (Modular MVC Pattern)
- **Database:** MongoDB via Mongoose ODM
- **Authentication:** JWT (`jsonwebtoken`) + Salted password hashing (`bcryptjs`)
- **Security:** `cors`, `helmet`, `express-rate-limit`, `urlValidator` (SSRF protection)

---

## 📂 Project Structure

```
FlowForge/
├── client/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── .env.example
│   └── src/
│       ├── components/
│       │   └── public/           # LandingNavbar.jsx, LandingFooter.jsx
│       ├── context/
│       │   ├── AuthContext.jsx
│       │   ├── ThemeContext.jsx
│       │   ├── ToastContext.jsx
│       │   └── WorkflowBuilderContext.jsx
│       ├── features/
│       │   └── builder/
│       │       ├── components/   # BuilderToolbar, NodeSidebar, NodeConfigDrawer, ExecutionModal, AuthConversionModal
│       │       ├── nodes/        # TriggerNode, ActionNode, ConditionNode, DelayNode, WebhookNode
│       │       └── utils/        # starterTemplates.js, guestSimulator.js
│       ├── layouts/
│       │   └── AppLayout.jsx     # Dark navy sidebar, topbar, theme toggle
│       ├── pages/
│       │   ├── public/           # LandingPage.jsx (Public SaaS Homepage)
│       │   ├── auth/             # LoginPage (with 1-click Demo helper), RegisterPage
│       │   ├── dashboard/        # DashboardPage (KPI metrics, Recharts trends)
│       │   ├── workflows/        # WorkflowsListPage (with Guest Import banner), WorkflowDetailPage
│       │   ├── builder/          # WorkflowBuilderPage (Dual Mode: Guest / Authenticated)
│       │   ├── executions/       # ExecutionsListPage, ExecutionDetailPage (Inspector & logs)
│       │   ├── settings/         # SettingsPage (Profile, Password, Theme)
│       │   └── NotFoundPage.jsx
│       ├── services/             # api.js, authService, workflowService, executionService, dashboardService
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   ├── package.json
│   ├── .env.example
│   ├── tests/
│   │   └── engine.test.js        # Unit and integration test suite
│   └── src/
│       ├── config/
│       │   ├── db.js             # Mongoose connection
│       │   └── seed.js           # Demo Account & Data Seeder
│       ├── controllers/          # auth, user, workflow, execution, dashboard controllers
│       ├── models/               # User, Workflow, Execution, TaskRecord
│       ├── routes/               # Express REST API routes
│       ├── middleware/           # authMiddleware, errorMiddleware, rateLimiter
│       ├── engine/
│       │   ├── executor/         # workflowExecutor.js (Graph traversal engine)
│       │   ├── nodes/            # trigger, action, condition, delay, webhook handlers
│       │   └── validators/       # workflowValidator.js (Cycle & topology validation)
│       ├── utils/                # urlValidator.js (SSRF protection), responseHelper.js
│       ├── app.js
│       └── server.js
│
└── README.md
```

---

## 🚀 Quick Setup & Installation

### 1. Prerequisites
- **Node.js** v18+ (tested on v20+)
- **MongoDB** running locally (`mongodb://localhost:27017/flowforge`) or a **MongoDB Atlas URI**

### 2. Backend Setup
1. Open a terminal and navigate to `server/`:
   ```bash
   cd server
   npm install
   ```
2. Configure environment variables in `server/.env`:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/flowforge
   JWT_SECRET=flowforge_super_secret_jwt_key_2026_secure
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```
3. Run the database seed script to generate the Demo User, Workflows, and Executions:
   ```bash
   npm run seed
   ```
4. Start the backend API server:
   ```bash
   npm start
   # or with live reloading:
   npm run dev
   ```

### 3. Frontend Setup
1. In a new terminal, navigate to `client/`:
   ```bash
   cd client
   npm install
   ```
2. Configure environment variables in `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Account Credentials

A preconfigured demo user is available out of the box when you run `npm run seed`:

- **Email:** `demo@flowforge.com`
- **Password:** `Demo@123`
- **One-Click Auto-Fill:** The Login page includes a **"Demo Account Credentials"** box with an **"Auto-Fill"** button for instant evaluation during technical reviews.

---

## 📋 5 Seeded Realistic Demo Workflows

1. **Welcome Email Automation (`Active`):**
   - *Topology:* `Trigger` → `Condition` (`isVerified == true`) → `Action` (Send Welcome Email).
   - Demonstrates: Variable comparison and dynamic string template interpolation.
2. **Task Management Workflow (`Active`):**
   - *Topology:* `Trigger` → `Action` (Create Task Record) → `Delay` (3 seconds) → `Action` (Log Task Finalized).
   - Demonstrates: **Persistent MongoDB TaskRecord creation** and async delay handling.
3. **API Data Processing (`Active`):**
   - *Topology:* `Trigger` → `Webhook` (HTTP GET from endpoint) → `Action` (Uppercase Transformation) → `Action` (Log Output).
   - Demonstrates: Ingesting external API responses and chained transformations.
4. **Conditional Approval Workflow (`Draft`):**
   - *Topology:* `Trigger` → `Condition` (`amount > 1000`) →
     - *True Branch:* `Action` (Route to VP Approval & Flag High Value).
     - *False Branch:* `Action` (Auto-Approve Standard Claim).
   - Demonstrates: True two-branch IF/ELSE routing to separate downstream actions.
5. **Webhook Integration (`Inactive`):**
   - *Topology:* `Trigger` → `Webhook` (External POST Request) → `Condition` (`statusCode == 200`) → `Action` (Save Audit Record).
   - Demonstrates: Single trigger constraint satisfaction with full external HTTP round-trips.

---

## 🌐 Application Routing

| Route | View | Description | Access |
|---|---|---|---|
| `/` | `LandingPage` | SaaS Homepage with Hero, Features, How It Works, Nodes & Templates | Public |
| `/builder` | `WorkflowBuilderPage` | Guest Canvas Editor (Local storage & demo simulation) | Public |
| `/login` | `LoginPage` | Authentication with 1-Click Demo helper | Public |
| `/register` | `RegisterPage` | Account registration | Public |
| `/dashboard` | `DashboardPage` | Real-time MongoDB metrics, KPI cards, Recharts trends | Protected |
| `/workflows` | `WorkflowsListPage` | Workflow management, search, status filters & Guest Import banner | Protected |
| `/workflows/:id` | `WorkflowDetailPage` | Node composition stats & workflow execution log | Protected |
| `/workflows/:id/builder` | `WorkflowBuilderPage` | Dedicated Full Canvas Editor with cloud saving & real execution | Protected |
| `/executions` | `ExecutionsListPage` | Paginated execution history table | Protected |
| `/executions/:id` | `ExecutionDetailPage` | Step inspector (inputs/outputs) and timestamped logs | Protected |
| `/settings` | `SettingsPage` | Profile details, password security, theme switcher | Protected |
