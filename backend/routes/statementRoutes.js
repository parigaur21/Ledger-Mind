const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadStatement } = require('../controllers/statementController');
const { requireAuth } = require('../middleware/auth');

const upload = multer({ 
  dest: 'uploads/', 
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype === 'text/plain' || file.mimetype === 'text/csv') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, TXT, or CSV files are allowed.'));
    }
  }
});

router.post('/upload', requireAuth, upload.single('statement'), uploadStatement);

module.exports = router;
