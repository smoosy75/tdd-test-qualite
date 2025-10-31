# 🧪 **Tests & Quality – Project Overview**

This mini-project is set up to **guard code quality end-to-end**: secret leaks, dependency vulnerabilities, static analysis (SAST), lint/format, unit tests (front & back), Lighthouse (web quality), SonarQube, and Docker builds.  
Below you’ll find **how to run everything locally** and a **plain-English tour of the GitLab CI pipeline** so you know exactly what each job does and how it helps.

---

## 🗂️ **1) Repo at a glance**

```
.
├─ backend/        # Express + TypeScript
│  └─ package.json # scripts: test:ci, lint, format
├─ frontend/       # Vite + React + TypeScript
│  └─ package.json # scripts: test:ci, lint, format, build
├─ docker-compose.yml
├─ .gitlab-ci.yml
└─ ... (config files: ESLint, Prettier, etc.)

```

## 💻 **2) How to run things (summary)**

### Requirements

- **Docker & Docker Compose**
- (Optional) **Node.js 20+** (only if you want to run local commands without Docker)

### Run the app (Docker, full stack)

```bash
docker-compose up --build

```

- Backend → [http://localhost:3000](http://localhost:3000)
- Frontend → [http://localhost:5173](http://localhost:5173) (or your Nginx port)
- PocketBase → [http://localhost:8090](http://localhost:8090)
- PostgreSQL → port 5432 (via `db` service)

> 💡 If you change code, restart the affected container(s) or re-run `docker-compose up --build`.

### Run checks locally (quick commands)

**Backend**

```bash
cd backend
npm ci
npm run lint
npm run format:check
npm run test:ci
```

**Frontend**

```bash
cd frontend
npm ci
npm run lint
npm run format:check
npm run test:ci
npm run build
```

**Lighthouse (frontend)**

```bash
cd frontend
npm ci && npm run build
npm i -g @lhci/cli
export CHROME_PATH=/usr/bin/chromium
lhci autorun
```

Outputs are written under `frontend/.lighthouseci/`. The report link is printed in the console.

**Security (optional)**

```bash
# secrets
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest \
  detect --no-git -v --redact --source /repo

# deps vulns
docker run --rm -v "$PWD:/project" aquasec/trivy:latest \
  fs --exit-code 1 --severity HIGH,CRITICAL --ignore-unfixed /project

# SAST
docker run --rm -v "$PWD:/src" returntocorp/semgrep:latest \
  semgrep ci --config p/ci --metrics=off --cwd /src
```

## 🧰 **3) NPM scripts reference**

### Backend `package.json`

```json
{
  "scripts": {
    "dev": "nodemon src/server.ts",
    "test": "jest --watchAll --verbose",
    "test:ci": "jest --ci --verbose --coverage",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "format:write": "prettier --write ."
  }
}
```

### Frontend `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "lint": "eslint .",
    "format:check": "prettier --check .",
    "format:write": "prettier --write .",
    "test:ci": "vitest run --coverage.enabled --coverage.reporter=lcov"
  }
}
```

## 🚦 **3) What the CI pipeline does (plain-English)**

The GitLab pipeline has **five stages**: `security` → `lint` → `test` → `quality` → `build`.  
Each job runs in a clean container and fails the pipeline if an issue is found.

### 🔐 Stage: SECURITY

**Goal:** catch risky stuff ASAP.

- **`secrets_scan` (Gitleaks)**  
  Finds accidentally-committed **secrets** (API keys, tokens, passwords).  
  👉 Fails if something that looks like a secret is found.

- **`deps_vuln_scan` (Trivy)**  
  Scans dependencies for **known vulnerabilities** (HIGH/CRITICAL).  
  👉 Fails if vulnerable packages are detected.

- **`sast_semgrep` (Semgrep)**  
  Runs **static analysis** for common security pitfalls in JS/TS.  
  👉 Fails if risky code patterns are detected.

### 🧹 Stage: LINT

**Goal:** maintain code style and readability.

- **`backend_lint_format`** → checks backend code with **ESLint** & **Prettier**.
- **`frontend_lint_format`** → checks frontend code for lint errors & formatting drift.

👉 Both fail if the code doesn’t respect rules or formatting.

### 🧪 Stage: TEST

**Goal:** ensure code behaves correctly.

- **`backend_tests`** → runs `jest` in CI mode, collects coverage (`lcov.info`).
- **`frontend_tests`** → runs `vitest` in CI mode, collects coverage (`lcov.info`).

👉 Both fail if tests fail. Coverage reports feed SonarQube.

### 💡 Stage: QUALITY

**Goal:** measure performance, accessibility, and deeper code quality.

- **`lighthouse_ci`** → builds frontend and runs **Lighthouse** 3×.  
  Checks **Performance**, **Accessibility**, **Best Practices**, and **SEO**.

- **`sonarqube_backend`** → analyzes backend (bugs, smells, coverage, duplications).
- **`sonarqube_frontend`** → same for frontend.

👉 Results appear in SonarCloud/SonarQube dashboards.

### 🏗️ Stage: BUILD

**Goal:** confirm both apps build into Docker images.

- **`backend_build`** → builds Docker image from `./backend`.
- **`frontend_build`** → builds Docker image from `./frontend`.

👉 Ensures your code is deployable.

---

## 🚀 **4) When the CI runs**

- **On push to `main` or `dev`** → full pipeline runs.
- **On Merge Requests** → same checks run to validate incoming changes.
- **Artifacts** (Lighthouse reports, coverage) are attached to jobs.

---

## 🧭 **5) Troubleshooting tips**

| Issue                       | Likely Cause / Fix                                                             |
| --------------------------- | ------------------------------------------------------------------------------ |
| Lighthouse shows NaN scores | Ensure frontend `dist/index.html` renders content; confirm Chrome path.        |
| Sonar coverage = 0          | Make sure test jobs run **before** Sonar and paths to `lcov.info` are correct. |
| Many Semgrep/Trivy alerts   | Start by fixing HIGH/CRITICAL ones; tune rules later.                          |

---

## 🧩 **6) Why these checks matter**

| Check               | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| 🔐 Secrets Scan     | Prevents leaking tokens/API keys in commits      |
| 🧱 Dependency Vulns | Detects known security flaws in libraries        |
| 🕵️‍♂️ SAST (Semgrep)   | Finds insecure code patterns                     |
| 🧹 Lint/Format      | Keeps code readable, avoids small bugs           |
| 🧪 Unit Tests       | Ensures logic works as expected                  |
| ⚡ Lighthouse       | Measures performance, a11y, SEO & best practices |
| 📊 SonarQube        | Tracks bugs, smells, duplications, coverage      |
| 🐳 Docker Builds    | Confirms your app actually builds & runs         |

---

<p align="center">
  <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/GitLab_logo.svg" height="50" alt="GitLab" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://upload.wikimedia.org/wikipedia/commons/9/94/Node.js_logo.svg" height="50" alt="Node.js" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://vitejs.dev/logo.svg" height="50" alt="Vite" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://sonarcloud.io/images/sonarcloud-logo.svg" height="50" alt="SonarCloud" />
  &nbsp;&nbsp;&nbsp;
  <img src="https://grafana.com/static/assets/img/logos/logo-lighthouse.svg" height="50" alt="Lighthouse" />
</p>

---

> 📘 **Summary:** This setup ensures that every commit is scanned, tested, analyzed, and proven buildable before it’s merged — protecting both **code quality** and **project security**.
