const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getEvents, createEvent, getEvent, deleteEvent } = require('../controllers/eventController');

router.use(auth);
router.get('/', getEvents);
router.post('/', createEvent);
router.get('/:id', getEvent);
router.delete('/:id', deleteEvent);

module.exports = router;