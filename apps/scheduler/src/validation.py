from typing import List, Dict, Any

class PreSolveValidator:
  @staticmethod
  def validate(
      sections: List[Dict[str, Any]],
      teachers: List[Dict[str, Any]],
      rooms: List[Dict[str, Any]],
      lesson_requirements: List[Dict[str, Any]]
  ) -> Dict[str, Any]:
    errors = []
    warnings = []

    # 1. Validate Teacher Overloads
    teacher_loads: Dict[str, int] = {}
    for req in lesson_requirements:
      teacher_id = str(req.get('teacherId', ''))
      if teacher_id:
        teacher_loads[teacher_id] = teacher_loads.get(teacher_id, 0) + req.get('periodsPerWeek', 0)

    for teacher in teachers:
      t_id = str(teacher.get('_id', ''))
      name = teacher.get('employeeId', t_id)
      max_weekly = teacher.get('maxWeeklyLoad', 30)
      actual_weekly = teacher_loads.get(t_id, 0)
      
      if actual_weekly > max_weekly:
        errors.append(
            f"Teacher {name} is overloaded. Requires {actual_weekly} weekly periods, but has max capacity of {max_weekly}."
        )

    # 2. Validate Room Availability vs Subject Demands
    room_types: Dict[str, int] = {}
    for room in rooms:
      r_type = room.get('type', 'CLASSROOM')
      room_types[r_type] = room_types.get(r_type, 0) + 1

    subject_room_demands: Dict[str, int] = {}
    for req in lesson_requirements:
      room_tag = req.get('preferredRoomTag', 'CLASSROOM')
      subject_room_demands[room_tag] = subject_room_demands.get(room_tag, 0) + req.get('periodsPerWeek', 0)

    # Calculate total standard school periods available in a week (e.g. 5 days * 8 periods = 40)
    # For validation, assume a conservative default of 40 periods
    total_weekly_periods = 40

    for r_type, demand in subject_room_demands.items():
      count = room_types.get(r_type, 0)
      total_avail_room_periods = count * total_weekly_periods
      if demand > total_avail_room_periods:
        errors.append(
            f"Room type {r_type} is undersaturated. Subject lessons demand {demand} weekly periods, but total capacity is {total_avail_room_periods} (Rooms: {count})."
        )

    # 3. Validate Section Timings Bounds
    for section in sections:
      sec_id = str(section.get('_id', ''))
      sec_name = section.get('name', sec_id)
      timings = section.get('schoolTimings', {})
      working_days = len(timings.get('workingDays', [1,2,3,4,5]))
      periods = len(timings.get('periods', []))
      total_avail = working_days * periods

      # Total lessons demanded by this section
      sec_demand = sum(req.get('periodsPerWeek', 0) for req in lesson_requirements if str(req.get('sectionId')) == sec_id)
      
      if sec_demand > total_avail:
        errors.append(
            f"Section {sec_name} demands {sec_demand} weekly periods, but school timings calendar only provides {total_avail} slots."
        )

    return {
        "isValid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings
    }
