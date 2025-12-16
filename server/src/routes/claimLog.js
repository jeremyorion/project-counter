import express from 'express';
import { param, validationResult } from 'express-validator';
import ClaimLog from '../models/ClaimLog.js';

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      data: null,
      error: {
        message: 'Validation failed',
        details: errors.array()
      }
    });
  }
  next();
};

// GET /api/claim-log - Get all claim log entries
router.get('/', (req, res) => {
  try {
    const { client_id } = req.query;

    const logs = client_id
      ? ClaimLog.getByClient(parseInt(client_id))
      : ClaimLog.getAll();

    res.json({
      success: true,
      data: logs,
      error: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      error: { message: error.message }
    });
  }
});

export default router;
