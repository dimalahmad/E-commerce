const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.put('/:id', orderController.update);
router.put('/:id/status', orderController.updateStatus);
router.delete('/:id', orderController.remove);

module.exports = router; 