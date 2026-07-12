from ortools.sat.python import cp_model
from typing import List, Dict, Any
from score import ScoreCalculator
from conflict import ConflictAnalyzer

class TimetableSolver:
    @staticmethod
    def solve(
        sections: List[Dict[str, Any]],
        teachers: List[Dict[str, Any]],
        rooms: List[Dict[str, Any]],
        lesson_requirements: List[Dict[str, Any]],
        mode: str = 'balanced'
    ) -> Dict[str, Any]:
        
        model = cp_model.CpModel()
        
        # 1. Variables Definition
        # x[(c_idx, room_id, day, period)] = bool
        x = {}
        
        # Pre-filter rooms by type to shrink search grid
        for c_idx, req in enumerate(lesson_requirements):
            req_tag = req.get('preferredRoomTag', 'CLASSROOM')
            allowed_rooms = [r for r in rooms if r.get('type') == req_tag]
            if not allowed_rooms:
                allowed_rooms = rooms # Fallback
                
            for room in allowed_rooms:
                r_id = str(room['_id'])
                for d in range(1, 6): # Mon to Fri
                    for p in range(8): # 8 periods/day
                        x[(c_idx, r_id, d, p)] = model.NewBoolVar(f'x_{c_idx}_{r_id}_{d}_{p}')

        # 2. Hard Constraint: Weekly subject counts coverage
        for c_idx, req in enumerate(lesson_requirements):
            required_periods = req.get('periodsPerWeek', 4)
            c_vars = [var for (c, r, d, p), var in x.items() if c == c_idx]
            model.Add(sum(c_vars) == required_periods)

        # 3. Hard Constraint: Teacher No-Overlap
        for teacher in teachers:
            t_id = str(teacher['_id'])
            teacher_courses = [idx for idx, req in enumerate(lesson_requirements) if str(req.get('teacherId')) == t_id]
            
            for d in range(1, 6):
                for p in range(8):
                    cell_vars = [var for (c, r, day, per), var in x.items()
                                 if c in teacher_courses and day == d and per == p]
                    model.Add(sum(cell_vars) <= 1)

        # 4. Hard Constraint: Room No-Overlap
        for room in rooms:
            r_id = str(room['_id'])
            for d in range(1, 6):
                for p in range(8):
                    cell_vars = [var for (c, r, day, per), var in x.items()
                                 if r == r_id and day == d and per == p]
                    model.Add(sum(cell_vars) <= 1)

        # 5. Hard Constraint: Section No-Overlap
        for section in sections:
            s_id = str(section['_id'])
            section_courses = [idx for idx, req in enumerate(lesson_requirements) if str(req.get('sectionId')) == s_id]
            
            for d in range(1, 6):
                for p in range(8):
                    cell_vars = [var for (c, r, day, per), var in x.items()
                                 if c in section_courses and day == d and per == p]
                    model.Add(sum(cell_vars) <= 1)

        # 6. Hard Constraint: Teacher Unavailabilities
        for teacher in teachers:
            t_id = str(teacher['_id'])
            unavail = teacher.get('preferences', {}).get('unavailablePeriods', [])
            unavail_set = {(p.get('dayOfWeek'), p.get('periodIndex')) for p in unavail}
            
            teacher_courses = [idx for idx, req in enumerate(lesson_requirements) if str(req.get('teacherId')) == t_id]
            for (c, r, d, p), var in x.items():
                if c in teacher_courses and (d, p) in unavail_set:
                    model.Add(var == 0)

        # 7. Hard Constraint: Teacher Daily Load Limits
        for teacher in teachers:
            t_id = str(teacher['_id'])
            max_daily = teacher.get('maxDailyLoad', 6)
            teacher_courses = [idx for idx, req in enumerate(lesson_requirements) if str(req.get('teacherId')) == t_id]
            for d in range(1, 6):
                day_vars = [var for (c, r, day, per), var in x.items() if c in teacher_courses and day == d]
                model.Add(sum(day_vars) <= max_daily)

        # 8. Soft Constraints: Minimize Teacher Gap periods (Window hours)
        # busy[t, d, p] = sum(x[c, r, d, p])
        penalties = []
        for teacher in teachers:
            t_id = str(teacher['_id'])
            teacher_courses = [idx for idx, req in enumerate(lesson_requirements) if str(req.get('teacherId')) == t_id]
            
            for d in range(1, 6):
                # Create busy status vars for each period
                busy = {}
                for p in range(8):
                    p_vars = [var for (c, r, day, per), var in x.items() if c in teacher_courses and day == d and per == p]
                    if p_vars:
                        busy[p] = sum(p_vars)
                    else:
                        busy[p] = 0
                
                # Check intermediate gaps: busy at p-1 and p+1, but free at p
                for p in range(1, 7):
                    # Define gap boolean variable
                    gap_var = model.NewBoolVar(f'gap_{t_id}_{d}_{p}')
                    model.Add(gap_var >= busy[p-1] + busy[p+1] - busy[p] - 1)
                    # Add to penalties (weight 10)
                    penalties.append(gap_var * 10)

        # 9. Soft Constraints: Teacher preferred slots
        for teacher in teachers:
            t_id = str(teacher['_id'])
            prefs = teacher.get('preferences', {}).get('preferredPeriods', [])
            pref_set = {(p.get('dayOfWeek'), p.get('periodIndex')) for p in prefs}
            
            if not pref_set:
                continue
                
            teacher_courses = [idx for idx, req in enumerate(lesson_requirements) if str(req.get('teacherId')) == t_id]
            for (c, r, d, p), var in x.items():
                if c in teacher_courses and (d, p) not in pref_set:
                    # Incur small penalty of 2 for teaching outside preferred hours
                    penalties.append(var * 2)

        # Set minimization objective
        model.Minimize(sum(penalties))

        # 10. Solver Configuration based on Generation Mode
        solver = cp_model.CpSolver()
        
        if mode == 'fast':
            solver.parameters.max_time_in_seconds = 5.0
            solver.parameters.num_search_workers = 1
        elif mode == 'optimal':
            solver.parameters.max_time_in_seconds = 30.0
            solver.parameters.num_search_workers = 8
        else: # balanced
            solver.parameters.max_time_in_seconds = 15.0
            solver.parameters.num_search_workers = 4

        status = solver.Solve(model)
        
        is_feasible = (status == cp_model.FEASIBLE or status == cp_model.OPTIMAL)
        
        slots_output = []
        if is_feasible:
            for (c, r, d, p), var in x.items():
                if solver.Value(var) == 1:
                    req = lesson_requirements[c]
                    slots_output.append({
                        "dayOfWeek": d,
                        "periodIndex": p,
                        "sectionId": str(req['sectionId']),
                        "teacherId": str(req['teacherId']),
                        "subjectId": str(req['subjectId']),
                        "classroomId": r
                    })
                    
            scores = ScoreCalculator.calculate(
                is_feasible=True,
                slots=slots_output,
                teachers=teachers,
                rooms=rooms,
                soft_penalties=int(solver.ObjectiveValue())
            )
            return {
                "success": True,
                "status": "SUCCESS",
                "slots": slots_output,
                "scores": scores
            }
        else:
            # Diagnose core infeasibility constraints
            conflicts = ConflictAnalyzer.analyze(sections, teachers, rooms, lesson_requirements)
            return {
                "success": False,
                "status": "FAILED",
                "error": "The timetable constraints are infeasible.",
                "conflicts": conflicts
            }
export_solver = TimetableSolver
