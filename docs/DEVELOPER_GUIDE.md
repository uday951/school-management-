# Developer Guide

Documentation for extending the AI School Timetable Management System.

---

## 1. Codebase Architecture

The project uses a monorepo workspace split into decoupled layers:
- **`packages/types`**: TypeScript schemas defining data structures for users, roles, classrooms, sections, time slots, and drafts. Keep imports dry by utilizing this package across both client and server code.
- **`apps/api/src/repositories/BaseRepository.ts`**: Implements generic database handlers with MongoDB filters, soft deletes, and archive toggling.
- **`apps/api/src/controllers/BaseController.ts`**: Enforces tenant mapping using the user's validated JWT payload (`schoolId`).

---

## 2. Solver Engine & Constraint Formulations

The optimization worker uses Google OR-Tools CP-SAT:
- **Variables**: $x_{c, r, d, p}$ indicates whether lesson requirement $c$ is scheduled in room $r$ on day $d$ at period $p$.
- **Hard Constraints**: Expressed inside `apps/scheduler/src/solver.py` via `model.Add(...)`.
- **Soft Constraints**: Penalty weights added to `model.Minimize(...)` to reduce teacher gaps and reward preferred periods.

---

## 3. Testing Suite

### Running Python Unit Tests
Verify CP-SAT solver variables mappings and pre-solve checks:
```bash
python -m unittest tests/test_scheduler.py
```

### Running Frontend Tests
Compile bundlers:
```bash
npm run build -w apps/web
```
Verify there are no TypeScript compiler warnings.
