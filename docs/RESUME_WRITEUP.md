# Nexora — Resume & Interview Write-Up

Use the sections below to present **Nexora** on your resume, LinkedIn, and technical interviews.

---

## 1. Resume Project Entry (Copy-Paste Ready)

**Nexora — Enterprise Project & Resource Management Platform** | *React, Material UI, Python, PostgreSQL, AWS Lambda, Terraform, Docker*  
*GitHub: `https://github.com/hayth31/Nexora`*

* **Full-Stack Serverless Architecture:** Engineered a responsive React (Material UI) and modular Python AWS Lambda platform backed by PostgreSQL, containerized with Docker Compose for local development and provisioned for AWS Serverless (CloudFront, S3, Lambda, Aurora) via Terraform.
* **Automated Risk, Resource & Budget Engines:** Built server-side analytics calculating project health (`On track`, `At risk`, `Overdue`) from schedule-elapsed vs. deliverable progress variance, resource over-allocation (>100% active capacity), budget burn-rate variance, and deliverable dependency DAG cycle validation.
* **Security & Role-Based Access Control (RBAC):** Implemented stateless JWT authentication (30-min access + 7-day silent refresh), bcrypt password hashing, and 4-tier RBAC (`Admin`, `Manager`, `Contributor`, `Viewer`) with per-request database role verification and privilege-escalation protections.
* **Testing, Accessibility & Static Security:** Achieved **99% backend test coverage** (949 pytest unit/integration tests against PostgreSQL), **676 frontend tests** (Vitest + React Testing Library), **72 Cypress E2E tests** with zero serious/critical WCAG 2.1 AA violations (`axe-core`), and **0 issues** in Bandit static security analysis.

---

## 2. Tailored Variants (Pick Based on the Role)

### If Applying for Backend / Cloud / Platform Roles
* Designed a modular-monolith Python AWS Lambda API (`pm-service`) with `psycopg3` connection pooling, per-request transactional isolation, and automatic idle-connection recovery for Aurora Serverless v2.
* Built graph-based cycle detection for cross-project deliverable dependencies and SQL-aggregated utilization/budget engines.
* Automated cloud infrastructure with Terraform (CloudFront, S3, Lambda Function URLs, Aurora PostgreSQL) and local parity via Docker Compose and a custom Lambda HTTP dev wrapper.

### If Applying for Frontend / Full-Stack Roles
* Built a responsive React 19 + Material UI application featuring URL-synced filtering (`useUrlFilters`), sortable data tables that adapt to mobile cards, an interactive Project Timeline view, and a People × Projects Allocation Heat Map.
* Implemented silent JWT token refresh, role-aware UI controls driven by `/auth/me`, and what-if allocation previews before saving.
* Validated UI behavior and accessibility with 676 Vitest/RTL tests, 72 Cypress E2E flows, and `axe-core` WCAG 2.1 AA audits.

---

## 3. Interview Talking Points (Technical Deep-Dive)

1. **Why one modular Lambda (`pm-service`) instead of 7 separate Lambdas?**  
   Each Lambda folder is packaged separately by Terraform. Splitting into 7 Lambdas would duplicate database connection logic, auth middleware, and error handling, while multiplying cold starts. Organizing `pm-service` into isolated domain modules (`routes -> service -> repository -> schemas`) shares core infrastructure cleanly while keeping each domain easy to extract later.
2. **How did you handle local development without cloud lock-in?**  
   Wrapped the Lambda `handler(event, context)` in a lightweight Python HTTP server (`dev_server.py`) with a handler lock (mirroring AWS Lambda's single-request-per-container concurrency model for the shared `psycopg` connection) and paired it with Docker Compose (`postgres:16-alpine`, backend, and Nginx-proxied React).
3. **How do you guarantee RBAC cannot be bypassed?**  
   The UI hides restricted buttons using permissions returned by `/auth/me`, while the backend re-reads the user's active status and role from PostgreSQL on every request inside the transaction—so demoting or deactivating a user takes effect immediately without waiting for JWT expiry.
4. **How did you optimize AWS cold starts and Aurora Serverless pauses?**  
   Added a public `GET /health/db` pre-warm ping triggered on the login page, single-retry connection recovery in `app/main.py` for dropped idle connections, and increased Lambda memory from 128 MB to 512 MB (cutting warm login latency from ~1.2s to 0.33–0.45s).
