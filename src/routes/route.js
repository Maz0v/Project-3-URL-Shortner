const express = require('express');

const router = express.Router();

const bookController = require('../controllers/bookController');




router.post('/books', bookController.createBooks);
router.get('/books/:bookId', bookController.getBooks);










module.exports = router;