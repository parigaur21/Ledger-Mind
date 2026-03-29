const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.route('/')
  .get(groupController.getGroups)
  .post(groupController.createGroup);

router.post('/join', groupController.joinGroup);

router.route('/:id')
  .get(groupController.getGroupDetails);

router.post('/:id/expenses', groupController.addSharedExpense);

module.exports = router;
