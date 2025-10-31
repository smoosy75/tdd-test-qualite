import { Router } from 'express';
import { UserService } from '../services/userService';
import pb from '../services/pb';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', (res, req) => {
  const userService = new UserService(pb);
  const authController = new AuthController(userService);
  return authController.signup(res, req);
});

router.post('/login', (res, req) => {
  const userService = new UserService(pb);
  const authController = new AuthController(userService);
  return authController.login(res, req);
});

router.post('/debug-routes', (req, res) => {
  res.json({ alive: true });
});

export default router;
