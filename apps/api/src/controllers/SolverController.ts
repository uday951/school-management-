import { Response, NextFunction } from 'express';
import https from 'https';
import { AuthRequest } from '../middleware/authMiddleware';
import { SolverService } from '../services/SolverService';
import { TimetableDraft } from '../models/TimetableDraft';
import { TimeSlot } from '../models/TimeSlot';
import { Subject } from '../models/Subject';

const solverService = new SolverService();

export class SolverController {
  async triggerGenerate(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { draftId, mode = 'balanced' } = req.body;
      if (!draftId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Parameter draftId is required.' },
        });
      }

      const draft = await TimetableDraft.findById(draftId);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'TimetableDraft not found.' },
        });
      }

      if (req.user?.role !== 'SUPER_ADMIN' && draft.schoolId.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      await solverService.triggerSolver(draftId, mode);

      res.status(202).json({
        success: true,
        message: 'Timetable generation triggered in background worker.',
        status: 'GENERATING',
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Reset a draft that is stuck in GENERATING back to SUCCESS (or DRAFT if no slots exist)
  async resetDraft(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const draftId = req.params.id;
      const draft = await TimetableDraft.findById(draftId);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'TimetableDraft not found.' },
        });
      }

      const slotCount = await TimeSlot.countDocuments({ draftId });
      const newStatus = slotCount > 0 ? 'SUCCESS' : 'DRAFT';

      await TimetableDraft.findByIdAndUpdate(draftId, {
        status: newStatus,
        'solverStats.errorLog': 'Solver was manually cancelled and reset by coordinator.',
      });

      res.status(200).json({
        success: true,
        message: `Draft reset to ${newStatus}. ${slotCount} existing slots preserved.`,
        data: { status: newStatus, slotCount },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getDraftStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const draft = await TimetableDraft.findById(req.params.id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'TimetableDraft not found.' },
        });
      }

      if (req.user?.role !== 'SUPER_ADMIN' && draft.schoolId.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      res.status(200).json({
        success: true,
        data: {
          status: draft.status,
          solverStats: draft.solverStats,
        },
      });
    } catch (error: any) {
      next(error);
    }
  }

  async getDraftSlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const draft = await TimetableDraft.findById(req.params.id);
      if (!draft) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'TimetableDraft not found.' },
        });
      }

      if (req.user?.role !== 'SUPER_ADMIN' && draft.schoolId.toString() !== req.user?.schoolId) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access Denied: Tenant mismatch.' },
        });
      }

      const slots = await TimeSlot.find({ draftId: req.params.id })
        .populate('sectionId', 'name')
        .populate('teacherId', 'profile email')
        .populate('subjectId', 'name code type')
        .populate('classroomId', 'name capacity')
        .exec();

      res.status(200).json({
        success: true,
        data: slots,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async swapSlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { draftId, slotAId, slotBId } = req.body;
      if (!slotAId || !slotBId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Both slotAId and slotBId are required.' },
        });
      }

      const [slotA, slotB] = await Promise.all([
        TimeSlot.findOne({ _id: slotAId, draftId }),
        TimeSlot.findOne({ _id: slotBId, draftId }),
      ]);

      if (!slotA || !slotB) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'One or both TimeSlots not found in this draft.' },
        });
      }

      // Snapshot the coordinates we want to swap
      const aCoords = { dayOfWeek: slotA.dayOfWeek, periodIndex: slotA.periodIndex };
      const bCoords = { dayOfWeek: slotB.dayOfWeek, periodIndex: slotB.periodIndex };

      // Snapshot full data for re-insertion (exclude _id so Mongo generates new ones)
      const aData = slotA.toObject();
      const bData = slotB.toObject();
      delete (aData as any)._id;
      delete (bData as any)._id;

      // Step 1: Delete both to release the unique-index constraints
      await Promise.all([
        TimeSlot.deleteOne({ _id: slotAId }),
        TimeSlot.deleteOne({ _id: slotBId }),
      ]);

      // Step 2: Re-insert with swapped day+period coordinates
      await TimeSlot.insertMany([
        { ...aData, dayOfWeek: bCoords.dayOfWeek, periodIndex: bCoords.periodIndex },
        { ...bData, dayOfWeek: aCoords.dayOfWeek, periodIndex: aCoords.periodIndex },
      ]);

      res.status(200).json({
        success: true,
        message: 'Slots swapped successfully.',
      });
    } catch (error: any) {
      next(error);

    }
  }

  async lockSlots(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { draftId, lockedSlots } = req.body;
      if (!Array.isArray(lockedSlots)) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'lockedSlots array is required.' },
        });
      }

      const draft = await TimetableDraft.findOneAndUpdate(
        { _id: draftId, schoolId: req.user?.schoolId },
        { lockedSlots },
        { new: true }
      );

      if (!draft) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'TimetableDraft not found.' },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Grid locks persisted successfully.',
        data: draft.lockedSlots,
      });
    } catch (error: any) {
      next(error);
    }
  }

  async executeNlpCommand(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { draftId, prompt } = req.body;
      const geminiKey = process.env.GEMINI_API_KEY;

      if (!geminiKey) {
        return res.status(500).json({
          success: false,
          error: { code: 'UNCONFIGURED', message: 'Gemini NLP engine is not set up on this server.' },
        });
      }

      // 1. Structure NLP prompt to request JSON from Gemini
      const systemInstruction = `You are a schedule adjustments parser. Interpret the user request.
Output ONLY JSON matching:
{
  "action": "MOVE" | "SWAP",
  "subjectCode": "string matching subject code (e.g. MATH, SCI)",
  "targetDay": 1-5,
  "targetPeriod": 0-7
}`;

      const payload = JSON.stringify({
        contents: [{ parts: [{ text: `${systemInstruction}\n\nUser request: ${prompt}` }] }],
        generationConfig: { responseMimeType: 'application/json' },
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const geminiRequest = () =>
        new Promise<string>((resolve, reject) => {
          const req = https.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => (body += chunk));
            res.on('end', () => resolve(body));
          });
          req.on('error', reject);
          req.write(payload);
          req.end();
        });

      const rawRes = await geminiRequest();
      const resJson = JSON.parse(rawRes);
      const outputText = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!outputText) {
        return res.status(400).json({
          success: false,
          error: { code: 'AI_FAIL', message: 'AI failed to parse command.' },
        });
      }

      const parsedCmd = JSON.parse(outputText.trim());
      const { subjectCode, targetDay, targetPeriod } = parsedCmd;

      // 2. Query matching subject in DB
      const subject = await Subject.findOne({ schoolId: req.user?.schoolId, code: subjectCode });
      if (!subject) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `Subject code '${subjectCode}' was not found in school records.` },
        });
      }

      // 3. Find matching TimeSlot and move it
      const slot = await TimeSlot.findOne({ draftId, subjectId: subject._id });
      if (!slot) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: `No active period found for subject ${subjectCode} in draft.` },
        });
      }

      slot.dayOfWeek = targetDay;
      slot.periodIndex = targetPeriod;
      await slot.save();

      res.status(200).json({
        success: true,
        message: `Successfully executed AI Action: Moved ${subjectCode} to Day ${targetDay}, Period ${targetPeriod + 1}.`,
        command: parsedCmd,
      });
    } catch (error: any) {
      next(error);
    }
  }

  // Create or overwrite a single time slot (manual editor)
  async upsertSlot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { draftId, dayOfWeek, periodIndex, sectionId, teacherId, subjectId, classroomId } = req.body;
      if (!draftId || dayOfWeek == null || periodIndex == null || !sectionId || !teacherId || !subjectId || !classroomId) {
        return res.status(400).json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'All slot fields are required.' },
        });
      }

      // Remove any existing slot that would conflict on same section+day+period
      await TimeSlot.deleteMany({
        draftId,
        $or: [
          { dayOfWeek, periodIndex, sectionId },
          { dayOfWeek, periodIndex, teacherId },
          { dayOfWeek, periodIndex, classroomId },
        ],
      });

      const slot = await TimeSlot.create({ draftId, dayOfWeek, periodIndex, sectionId, teacherId, subjectId, classroomId, isLocked: false });
      const populated = await slot.populate(['sectionId', 'teacherId', 'subjectId', 'classroomId']);

      res.status(201).json({ success: true, data: populated });
    } catch (error: any) {
      next(error);
    }
  }

  // Delete a single time slot (clear a cell)
  async deleteSlot(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await TimeSlot.deleteOne({ _id: id });
      res.status(200).json({ success: true, message: 'Slot removed.' });
    } catch (error: any) {
      next(error);
    }
  }
}
export default SolverController;
