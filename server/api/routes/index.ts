import { Router } from 'express';
import records from './records';
import tracks from './tracks';

const router = Router();

router.use(records);
router.use(tracks);

export default router;
