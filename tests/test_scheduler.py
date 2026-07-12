import unittest
import sys
import os

# Add apps/scheduler/src to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../apps/scheduler/src')))

from validation import PreSolveValidator
from solver import TimetableSolver
from score import ScoreCalculator

class TestSchedulerEngine(unittest.TestCase):
    def setUp(self):
        # Mock academic parameters
        self.sections = [
            {"_id": "sec_1", "name": "Class 10A", "schoolTimings": {"workingDays": [1,2,3,4,5], "periods": [1,2,3,4,5,6,7,8]}}
        ]
        self.rooms = [
            {"_id": "rm_1", "name": "Room 302", "type": "CLASSROOM", "capacity": 40}
        ]
        self.teachers = [
            {"_id": "tch_1", "employeeId": "T-100", "maxWeeklyLoad": 30, "maxDailyLoad": 6}
        ]
        
    def test_pre_solve_validation_feasible(self):
        # 1. Feasible lesson requirements (12 periods demanded, teacher max is 30)
        lesson_requirements = [
            {"sectionId": "sec_1", "teacherId": "tch_1", "subjectId": "sub_1", "periodsPerWeek": 12, "preferredRoomTag": "CLASSROOM"}
        ]
        result = PreSolveValidator.validate(self.sections, self.teachers, self.rooms, lesson_requirements)
        self.assertTrue(result["isValid"])
        self.assertEqual(len(result["errors"]), 0)

    def test_pre_solve_validation_overloaded_teacher(self):
        # 2. Infeasible (demanding 32 periods, teacher max load limit is 30)
        lesson_requirements = [
            {"sectionId": "sec_1", "teacherId": "tch_1", "subjectId": "sub_1", "periodsPerWeek": 32, "preferredRoomTag": "CLASSROOM"}
        ]
        result = PreSolveValidator.validate(self.sections, self.teachers, self.rooms, lesson_requirements)
        self.assertFalse(result["isValid"])
        self.assertTrue(any("overloaded" in err for err in result["errors"]))

    def test_solver_feasible(self):
        lesson_requirements = [
            {"sectionId": "sec_1", "teacherId": "tch_1", "subjectId": "sub_1", "periodsPerWeek": 4, "preferredRoomTag": "CLASSROOM"}
        ]
        result = TimetableSolver.solve(self.sections, self.teachers, self.rooms, lesson_requirements, mode="fast")
        self.assertTrue(result["success"])
        self.assertEqual(len(result["slots"]), 4)
        self.assertEqual(result["scores"]["hardScore"], 100.0)

if __name__ == '__main__':
    unittest.main()
