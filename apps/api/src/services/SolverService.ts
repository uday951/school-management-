import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../config/logger';
import { TimetableDraft } from '../models/TimetableDraft';

const SOLVER_TIMEOUT_MS = 30_000; // 30 seconds max

export class SolverService {
  async triggerSolver(draftId: string, mode: string): Promise<void> {
    const scriptPath = path.resolve(__dirname, '../../../scheduler/src/main.py');
    logger.info(`Spawning Timetable Solver for draft: ${draftId} [Mode: ${mode}]`);

    await TimetableDraft.findByIdAndUpdate(draftId, { status: 'GENERATING' });

    const pythonProcess = spawn('python', [scriptPath, '--draft', draftId, '--mode', mode], {
      cwd: path.resolve(__dirname, '../../../scheduler'),
      env: { ...process.env },
    });

    // Kill process and reset status if it exceeds timeout
    const timer = setTimeout(async () => {
      logger.warn(`Solver timed out after ${SOLVER_TIMEOUT_MS / 1000}s — killing process and resetting draft.`);
      pythonProcess.kill('SIGTERM');
      await TimetableDraft.findByIdAndUpdate(draftId, {
        status: 'DRAFT',
        'solverStats.errorLog': 'Solver process timed out. Check Python environment and OR-Tools installation.',
      });
    }, SOLVER_TIMEOUT_MS);

    pythonProcess.stdout.on('data', (data) => {
      logger.info(`[Solver]: ${data.toString().trim()}`);
    });

    pythonProcess.stderr.on('data', (data) => {
      logger.error(`[Solver Error]: ${data.toString().trim()}`);
    });

    pythonProcess.on('close', async (code) => {
      clearTimeout(timer); // cancel timeout if process finished naturally
      logger.info(`Solver process exited with code ${code}`);
      if (code !== 0) {
        // Reset stuck GENERATING status on crash
        const draft = await TimetableDraft.findById(draftId);
        if (draft?.status === 'GENERATING') {
          await TimetableDraft.findByIdAndUpdate(draftId, { status: 'DRAFT' });
          logger.warn(`Solver crashed — draft ${draftId} reset to DRAFT.`);
        }
      }
    });
  }
}
export default SolverService;

