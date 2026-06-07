import express from 'express';
import {
  createDoubt,
  getAllDoubts,
  getDoubtById,
  updateDoubt,
  clarifyDoubt,
  resolveDoubt,
  deleteDoubt
} from '../controllers/doubtController.js';

const router = express.Router();

router.post('/', createDoubt);
router.get('/', getAllDoubts);
router.get('/:id', getDoubtById);
router.put('/:id', updateDoubt);
router.post('/:id/clarify', clarifyDoubt);
router.patch('/:id/resolve', resolveDoubt);
router.delete('/:id', deleteDoubt);

export default router;