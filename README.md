# AI School Timetable Management System

Production-ready monorepo workspace managing school ERP registries and generating conflict-free timetables using Google OR-Tools CP-SAT satisfaction algorithms.

---

## Workspace Directory Tree
- `apps/web`: React client Vite SPA layout.
- `apps/api`: Express gateway server routing requests and managing database operations.
- `apps/scheduler`: Python constraint programming solver worker process.
- `packages/types`: Shared typings and interfaces.
- `packages/validation`: Shared Zod validation schemas.
- `docker-compose.yml`: Local orchestrator.

---

## 1. Quick Local Setup

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB (running locally)

### Installation
1. Install monorepo Node dependencies:
   ```bash
   npm install
   ```
2. Build shared packages:
   ```bash
   npm run build -w packages/types
   ```
3. Install Python solver packages:
   ```bash
   pip install -r apps/scheduler/requirements.txt
   ```

### Running Applications
- **Start Node API server**: `npm run dev -w apps/api`
- **Start React web client**: `npm run dev -w apps/web`
- **Run Python Solver direct command**:
  ```bash
  python apps/scheduler/src/main.py --draft [MongoDB draftObjectId] --mode balanced
  ```

---

## 2. Docker Production Deployment

Start the unified system (Database, REST Server, static React client proxy, and Python daemon) in one command:
```bash
docker-compose up --build
```
The client portal will be available at `http://localhost/`.
All API commands will route automatically through the Nginx reverse-proxy on `http://localhost/api/v1/`.
