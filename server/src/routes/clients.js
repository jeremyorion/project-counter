import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Client from '../models/Client.js';

const router = express.Router();

// Validation middleware
const validateClient = [
  body('code')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Client code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/i)
    .withMessage('Client code must contain only letters'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Client name is required and must be less than 255 characters')
];

const validateClientUpdate = [
  body('code')
    .trim()
    .isLength({ min: 3, max: 3 })
    .withMessage('Client code must be exactly 3 characters')
    .matches(/^[A-Z]{3}$/i)
    .withMessage('Client code must contain only letters'),
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Client name is required and must be less than 255 characters'),
  body('currentCounter')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Last job number must be a non-negative integer')
];

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

// GET /api/clients - List all clients
router.get('/', (req, res) => {
  try {
    const clients = Client.getAll();
    res.json({
      success: true,
      data: clients,
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

// GET /api/clients/:id - Get single client
router.get('/:id', param('id').isInt(), handleValidationErrors, (req, res) => {
  try {
    const client = Client.getById(req.params.id);
    if (!client) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: 'Client not found' }
      });
    }
    res.json({
      success: true,
      data: client,
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

// POST /api/clients - Create new client
router.post('/', validateClient, handleValidationErrors, (req, res) => {
  try {
    const { code, name } = req.body;
    const client = Client.create({ code, name });
    res.status(201).json({
      success: true,
      data: client,
      error: null
    });
  } catch (error) {
    const statusCode = error.message.includes('already exists') ? 409 : 500;
    res.status(statusCode).json({
      success: false,
      data: null,
      error: { message: error.message }
    });
  }
});

// PUT /api/clients/:id - Update client
router.put(
  '/:id',
  param('id').isInt(),
  validateClientUpdate,
  handleValidationErrors,
  (req, res) => {
    try {
      const { code, name, currentCounter } = req.body;
      const client = Client.update(req.params.id, { code, name, currentCounter });
      res.json({
        success: true,
        data: client,
        error: null
      });
    } catch (error) {
      const statusCode = error.message.includes('not found')
        ? 404
        : error.message.includes('already exists')
        ? 409
        : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        error: { message: error.message }
      });
    }
  }
);

// DELETE /api/clients/:id - Delete client
router.delete('/:id', param('id').isInt(), handleValidationErrors, (req, res) => {
  try {
    const result = Client.delete(req.params.id);
    res.json({
      success: true,
      data: result,
      error: null
    });
  } catch (error) {
    const statusCode = error.message.includes('not found')
      ? 404
      : error.message.includes('Cannot delete')
      ? 409
      : 500;
    res.status(statusCode).json({
      success: false,
      data: null,
      error: { message: error.message }
    });
  }
});

// GET /api/clients/:id/next-job-number - Get next job number for client
router.get(
  '/:id/next-job-number',
  param('id').isInt(),
  handleValidationErrors,
  (req, res) => {
    try {
      const result = Client.getNextJobNumber(req.params.id);
      res.json({
        success: true,
        data: result,
        error: null
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        error: { message: error.message }
      });
    }
  }
);

// POST /api/clients/:id/claim-job-number - Claim and increment job number
router.post(
  '/:id/claim-job-number',
  param('id').isInt(),
  handleValidationErrors,
  (req, res) => {
    try {
      const result = Client.claimJobNumber(req.params.id);
      res.json({
        success: true,
        data: result,
        error: null
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        error: { message: error.message }
      });
    }
  }
);

export default router;
