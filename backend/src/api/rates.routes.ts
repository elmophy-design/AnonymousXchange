import { Router } from 'express';
import { ratesController } from '../controllers/rates.controller';

const router = Router();

router.get('/', ratesController.getAll);
router.get('/:asset', ratesController.getOne);

export default router;
