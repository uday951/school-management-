from typing import List, Dict, Any

class ConflictAnalyzer:
    @staticmethod
    def analyze(
        sections: List[Dict[str, Any]],
        teachers: List[Dict[str, Any]],
        rooms: List[Dict[str, Any]],
        lesson_requirements: List[Dict[str, Any]]
    ) -> List[str] :
        conflicts = []

        # 1. Check for basic overloaded resources (Fast Audit)
        teacher_periods = {}
        for req in lesson_requirements:
            t_id = str(req.get('teacherId', ''))
            if t_id:
                teacher_periods[t_id] = teacher_periods.get(t_id, 0) + req.get('periodsPerWeek', 0)

        for teacher in teachers:
            t_id = str(teacher.get('_id', ''))
            emp_id = teacher.get('employeeId', t_id)
            unavail_count = len(teacher.get('preferences', {}).get('unavailablePeriods', []))
            
            # Simple conflict heuristic: total periods + unavailable slots > total calendar spaces
            total_slots = 40 # 5 days * 8 periods
            actual_load = teacher_periods.get(t_id, 0)
            if actual_load + unavail_count > total_slots:
                conflicts.append(
                    f"Over-constrained Teacher ({emp_id}): Required teaching periods ({actual_load}) + declared unavailable slots ({unavail_count}) exceeds total weekly slots ({total_slots})."
                )

        # 2. Check for over-demanded Room Tags
        room_counts: Dict[str, int] = {}
        for room in rooms:
            r_type = room.get('type', 'CLASSROOM')
            room_counts[r_type] = room_counts.get(r_type, 0) + 1

        room_demands: Dict[str, int] = {}
        for req in lesson_requirements:
            tag = req.get('preferredRoomTag', 'CLASSROOM')
            room_demands[tag] = room_demands.get(tag, 0) + req.get('periodsPerWeek', 0)

        for tag, demand in room_demands.items():
            count = room_counts.get(tag, 0)
            avail = count * 40
            if demand > avail:
                conflicts.append(
                    f"Room Depletion conflict: Subjects require {demand} periods in '{tag}' locations, but only {avail} slots are available across all {count} rooms."
                )

        if not conflicts:
            conflicts.append(
                "Generalized Feasibility Failure: CP-SAT solver search exhausted. Multiple constraints overlap. Try increasing teacher availability bounds or adding rooms."
            )

        return conflicts
