import express from 'express';
import isAuthenticated from '../midllewares/checkAuth';
import subController from '../controllers/subredditContoller';
const router = express.Router();


router.post('/create', subController.post_create_subreddit);
router.post('/join', isAuthenticated, subController.user_join_subreddit)
router.get('/:name', subController.get_subbreddit_detail);

export default router;