from typing import List, Dict, Any

class ScoreCalculator:
    @staticmethod
    def calculate(
        is_feasible: bool,
        slots: List[Dict[str, Any]],
        teachers: List[Dict[str, Any]],
        rooms: List[Dict[str, Any]],
        soft_penalties: int
    ) -> Dict[str, Any]:
        
        if not is_feasible:
            return {
                "hardScore": 0.0,
                "softScore": 0.0,
                "teacherSatisfaction": 0.0,
                "roomUtilization": 0.0,
                "overallScore": 0.0
            }

        # 1. Hard Score
        hard_score = 100.0

        # 2. Soft Score (derived from solver minimize objective)
        # Scaled dynamically: assume standard acceptable penalty ceiling is 1000
        max_penalty_ceiling = 1000.0
        soft_score = max(0.0, 100.0 * (1.0 - (soft_penalties / max_penalty_ceiling)))

        # 3. Teacher Satisfaction Rate
        # Calculate ratio of slots that match teachers' preferred Slots
        preferred_match = 0
        total_teacher_slots = len(slots)
        
        teacher_prefs: Dict[str, List[tuple]] = {}
        for teacher in teachers:
            t_id = str(teacher.get('_id', ''))
            prefs = teacher.get('preferences', {}).get('preferredPeriods', [])
            teacher_prefs[t_id] = [(p.get('dayOfWeek'), p.get('periodIndex')) for p in prefs]

        for slot in slots:
            t_id = str(slot.get('teacherId', ''))
            day = slot.get('dayOfWeek')
            period = slot.get('periodIndex')
            
            if t_id in teacher_prefs and (day, period) in teacher_prefs[t_id]:
                preferred_match += 1

        teacher_satisfaction = 100.0
        if total_teacher_slots > 0:
            # If no preferences are declared, default to 100% satisfaction
            has_preferences = any(len(p) > 0 for p in teacher_prefs.values())
            if has_preferences:
                teacher_satisfaction = (preferred_match / total_teacher_slots) * 100.0
                teacher_satisfaction = min(100.0, max(50.0, teacher_satisfaction + 50.0)) # Scale it reasonably

        # 4. Room Utilization Rate
        # Ratio of scheduled slots to total available room capacity
        total_rooms = len(rooms)
        # Assume 5 days * 8 periods = 40 active slots per room
        total_room_slots = total_rooms * 40
        room_utilization = 0.0
        if total_room_slots > 0:
            room_utilization = (len(slots) / total_room_slots) * 100.0
            room_utilization = min(100.0, room_utilization)

        # 5. Overall Optimization Score
        overall_score = (hard_score * 0.4) + (soft_score * 0.3) + (teacher_satisfaction * 0.2) + (room_utilization * 0.1)

        return {
            "hardScore": round(hard_score, 1),
            "softScore": round(soft_score, 1),
            "teacherSatisfaction": round(teacher_satisfaction, 1),
            "roomUtilization": round(room_utilization, 1),
            "overallScore": round(overall_score, 1)
        }
