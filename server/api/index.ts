import { Router } from 'express';
import records from './records';

const router = Router();

router.use(records);

export default router;
