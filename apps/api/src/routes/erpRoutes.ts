import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import { requirePermission } from '../middleware/rbacMiddleware';
import { RoomController } from '../controllers/RoomController';
import { GradeController } from '../controllers/GradeController';
import { SectionController } from '../controllers/SectionController';
import { SubjectController } from '../controllers/SubjectController';
import { TeacherController } from '../controllers/TeacherController';
import { StudentController } from '../controllers/StudentController';
import { ActivityController } from '../controllers/ActivityController';
import { getDashboardStats } from '../controllers/dashboardController';
import { SolverController } from '../controllers/SolverController';
import { OperationalController } from '../controllers/OperationalController';
import { TimetableWorkflowController } from '../controllers/TimetableWorkflowController';
import { Branch, Building, Floor, SubjectGroup, ClassBatch, Holiday, SchoolEvent, TeacherAbsence, Homework, Attendance, ExamTimetable, ResourceBooking, Notification } from '../models/OperationalModels';

const router = Router();

const roomCtrl = new RoomController();
const gradeCtrl = new GradeController();
const sectionCtrl = new SectionController();
const subjectCtrl = new SubjectController();
const teacherCtrl = new TeacherController();
const studentCtrl = new StudentController();
const activityCtrl = new ActivityController();
const solverCtrl = new SolverController();
const workflowCtrl = new TimetableWorkflowController();

// All ERP routes require authenticated sessions
router.use(requireAuth);

// Live Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

// Helper function to bind generic CRUD routes to controllers
function bindCrudRoutes(path: string, controller: any, permissionPrefix: string) {
  router.get(path, controller.find.bind(controller));
  router.get(`${path}/:id`, controller.findById.bind(controller));
  router.post(path, requirePermission(`EDIT_${permissionPrefix}`), controller.create.bind(controller));
  router.put(`${path}/:id`, requirePermission(`EDIT_${permissionPrefix}`), controller.update.bind(controller));
  router.delete(`${path}/:id`, requirePermission(`EDIT_${permissionPrefix}`), controller.delete.bind(controller));
  router.post(`${path}/:id/archive`, requirePermission(`EDIT_${permissionPrefix}`), controller.archive.bind(controller));
  router.post(`${path}/:id/restore`, requirePermission(`EDIT_${permissionPrefix}`), controller.restore.bind(controller));
  router.post(`${path}/bulk-delete`, requirePermission(`EDIT_${permissionPrefix}`), controller.bulkDelete.bind(controller));
  router.post(`${path}/import`, requirePermission(`EDIT_${permissionPrefix}`), controller.import.bind(controller));
}

// Bind CRUD endpoints for each collection
bindCrudRoutes('/rooms', roomCtrl, 'ACADEMIC');
bindCrudRoutes('/grades', gradeCtrl, 'ACADEMIC');
bindCrudRoutes('/sections', sectionCtrl, 'ACADEMIC');
bindCrudRoutes('/subjects', subjectCtrl, 'ACADEMIC');
bindCrudRoutes('/teachers', teacherCtrl, 'USERS');
bindCrudRoutes('/students', studentCtrl, 'USERS');
bindCrudRoutes('/activities', activityCtrl, 'ACADEMIC');

function bindOperationalRoutes(path: string, entity: any, permission = 'EDIT_ACADEMIC') {
  const ctrl = new OperationalController(entity);
  router.get(path, ctrl.list.bind(ctrl));
  router.post(path, requirePermission(permission), ctrl.create.bind(ctrl));
  router.put(`${path}/:id`, requirePermission(permission), ctrl.update.bind(ctrl));
  router.delete(`${path}/:id`, requirePermission(permission), ctrl.remove.bind(ctrl));
  router.post(`${path}/:id/archive`, requirePermission(permission), ctrl.archive.bind(ctrl));
  router.post(`${path}/:id/restore`, requirePermission(permission), ctrl.restore.bind(ctrl));
  router.post(`${path}/import`, requirePermission(permission), ctrl.import.bind(ctrl));
}

bindOperationalRoutes('/branches', Branch, 'EDIT_USERS');
bindOperationalRoutes('/buildings', Building);
bindOperationalRoutes('/floors', Floor);
bindOperationalRoutes('/subject-groups', SubjectGroup);
bindOperationalRoutes('/batches', ClassBatch);
bindOperationalRoutes('/holidays', Holiday);
bindOperationalRoutes('/events', SchoolEvent);
bindOperationalRoutes('/teacher-absences', TeacherAbsence, 'EDIT_USERS');
bindOperationalRoutes('/homework', Homework, 'EDIT_TIMETABLE');
bindOperationalRoutes('/attendance', Attendance, 'EDIT_TIMETABLE');
bindOperationalRoutes('/exam-timetables', ExamTimetable, 'EDIT_TIMETABLE');
bindOperationalRoutes('/resource-bookings', ResourceBooking);
bindOperationalRoutes('/notifications', Notification, 'EDIT_USERS');

// AI Timetable Solver Routes
router.post('/schedules/generate', requirePermission('EDIT_TIMETABLE'), solverCtrl.triggerGenerate.bind(solverCtrl));
router.get('/schedules/drafts/:id/status', solverCtrl.getDraftStatus.bind(solverCtrl));
router.get('/schedules/drafts/:id/slots', solverCtrl.getDraftSlots.bind(solverCtrl));
router.patch('/schedules/drafts/:id/reset', requirePermission('EDIT_TIMETABLE'), solverCtrl.resetDraft.bind(solverCtrl));
router.post('/schedules/drafts/:id/submit-review', requirePermission('EDIT_TIMETABLE'), workflowCtrl.submitReview.bind(workflowCtrl));
router.post('/schedules/drafts/:id/approve', requirePermission('APPROVE_SWAP'), workflowCtrl.approve.bind(workflowCtrl));
router.post('/schedules/drafts/:id/publish', requirePermission('APPROVE_SWAP'), workflowCtrl.publish.bind(workflowCtrl));
router.post('/schedules/slots/swap', requirePermission('EDIT_TIMETABLE'), solverCtrl.swapSlots.bind(solverCtrl));
router.post('/schedules/slots/lock', requirePermission('EDIT_TIMETABLE'), solverCtrl.lockSlots.bind(solverCtrl));
router.put('/schedules/slots', requirePermission('EDIT_TIMETABLE'), solverCtrl.upsertSlot.bind(solverCtrl));
router.delete('/schedules/slots/:id', requirePermission('EDIT_TIMETABLE'), solverCtrl.deleteSlot.bind(solverCtrl));
router.post('/schedules/nlp-command', requirePermission('EDIT_TIMETABLE'), solverCtrl.executeNlpCommand.bind(solverCtrl));

export default router;
