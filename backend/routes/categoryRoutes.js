const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');

router.get('/', auth, getCategories);
router.post('/', auth, createCategory);
router.delete('/:id', auth, deleteCategory);

module.exports = router;
