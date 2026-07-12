import sys
import argparse
from pymongo import MongoClient
from bson.objectid import ObjectId
from config import Config
from validation import PreSolveValidator
from solver import TimetableSolver

def run_scheduler(draft_id_str: str, mode: str):
    print(f"Starting AI Scheduling Engine for Draft: {draft_id_str} [Mode: {mode}]")
    
    # 1. Connect to MongoDB
    client = MongoClient(Config.MONGODB_URI)
    db = client.get_default_database()
    if db is None:
        # Fallback to direct db name if URI doesn't include it
        db = client['school-timetable-system']
        
    draft_id = ObjectId(draft_id_str)
    
    # Update draft status
    db.timetabledrafts.update_one(
        {"_id": draft_id},
        {"$set": {"status": "GENERATING"}}
    )

    # 2. Fetch draft to retrieve schoolId
    draft = db.timetabledrafts.find_one({"_id": draft_id})
    if not draft:
        print(f"Error: TimetableDraft '{draft_id_str}' not found.")
        sys.exit(1)
        
    school_id = draft.get('schoolId')
    print(f"School ID: {school_id}")

    # 3. Retrieve all academic registry documents for this school
    query = {"schoolId": school_id, "isDeleted": {"$ne": True}}
    
    sections = list(db.sections.find(query))
    teachers = list(db.teachers.find(query))
    rooms = list(db.rooms.find(query))
    subjects = list(db.subjects.find(query))
    
    # Resolve Lesson Requirements: we can fetch them based on section IDs
    sec_ids = [s['_id'] for s in sections]
    lesson_requirements = list(db.lessonrequirements.find({
        "sectionId": {"$in": sec_ids},
        "schoolId": school_id
    }))

    print(f"Registry Roster: {len(sections)} Sections, {len(teachers)} Teachers, {len(rooms)} Rooms, {len(lesson_requirements)} Lesson Requirements.")

    # 4. Run Pre-Solve Validation checks
    val_result = PreSolveValidator.validate(sections, teachers, rooms, lesson_requirements)
    if not val_result["isValid"]:
        print("Pre-Solve Validation Failed! Constraints are mathematically infeasible.")
        for err in val_result["errors"]:
            print(f" - [Error] {err}")
            
        db.timetabledrafts.update_one(
            {"_id": draft_id},
            {
                "$set": {
                    "status": "FAILED",
                    "solverStats": {
                        "conflictsScore": 100,
                        "solvingDurationMs": 0,
                        "errorLog": "; ".join(val_result["errors"])
                    }
                }
            }
        )
        sys.exit(1)

    # 5. Run OR-Tools CP-SAT Solver
    print("Pre-Solve checks passed. Starting satisfiability optimization search...")
    solve_result = TimetableSolver.solve(sections, teachers, rooms, lesson_requirements, mode)

    if solve_result["success"]:
        print("Feasible schedule compiled successfully!")
        
        # Clear any existing slots for this draft
        db.timeslots.delete_many({"draftId": draft_id})
        
        # Inject new slots
        new_slots = []
        for slot in solve_result["slots"]:
            new_slots.append({
                "draftId": draft_id,
                "dayOfWeek": slot["dayOfWeek"],
                "periodIndex": slot["periodIndex"],
                "sectionId": ObjectId(slot["sectionId"]),
                "teacherId": ObjectId(slot["teacherId"]),
                "subjectId": ObjectId(slot["subjectId"]),
                "classroomId": ObjectId(slot["classroomId"])
            })
            
        if new_slots:
            db.timeslots.insert_many(new_slots)
            
        # Update draft status
        db.timetabledrafts.update_one(
            {"_id": draft_id},
            {
                "$set": {
                    "status": "SUCCESS",
                    "solverStats": {
                        "conflictsScore": solve_result["scores"]["softScore"],
                        "solvingDurationMs": 1500, # Mock duration
                    }
                }
            }
        )
        print("Database updated. Timetable draft generated.")
    else:
        print("Solver failed to find a feasible solution.")
        print(f"Conflicts identified: {solve_result['conflicts']}")
        
        db.timetabledrafts.update_one(
            {"_id": draft_id},
            {
                "$set": {
                    "status": "FAILED",
                    "solverStats": {
                        "conflictsScore": 0,
                        "solvingDurationMs": 1000,
                        "errorLog": "; ".join(solve_result["conflicts"])
                    }
                }
            }
        )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Timetable CP-SAT background runner.")
    parser.add_argument("--draft", required=True, help="MongoDB ObjectId of TimetableDraft to solve.")
    parser.add_argument("--mode", default="balanced", choices=["fast", "balanced", "optimal"], help="Solver optimization search intensity.")
    
    args = parser.parse_args()
    run_scheduler(args.draft, args.mode)
