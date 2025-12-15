import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import Project from '../models/Project.js';

const router = express.Router();

// Validation middleware
const validateProject = [
  body('clientId')
    .isInt({ min: 1 })
    .withMessage('Valid client ID is required'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Status must be one of: active, completed, on-hold, cancelled'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
];

const validateProjectUpdate = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('status')
    .optional()
    .isIn(['active', 'completed', 'on-hold', 'cancelled'])
    .withMessage('Status must be one of: active, completed, on-hold, cancelled'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
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

// GET /api/projects - List all projects (with filters)
router.get('/', (req, res) => {
  try {
    const { client_id, status, search } = req.query;
    const filters = {
      clientId: client_id ? parseInt(client_id) : undefined,
      status,
      search
    };
    const projects = Project.getAll(filters);
    res.json({
      success: true,
      data: projects,
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

// GET /api/projects/stats - Get project statistics
router.get('/stats', (req, res) => {
  try {
    const stats = Project.getStats();
    res.json({
      success: true,
      data: stats,
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

// GET /api/projects/recent - Get recent projects
router.get('/recent', (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : 5;
    const projects = Project.getRecent(limit);
    res.json({
      success: true,
      data: projects,
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

// GET /api/projects/:id - Get single project
router.get('/:id', param('id').isInt(), handleValidationErrors, (req, res) => {
  try {
    const project = Project.getById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        data: null,
        error: { message: 'Project not found' }
      });
    }
    res.json({
      success: true,
      data: project,
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

// POST /api/projects - Create new project
router.post('/', validateProject, handleValidationErrors, (req, res) => {
  try {
    const { clientId, title, description, status, startDate, dueDate } = req.body;
    const project = Project.create({
      clientId,
      title,
      description,
      status,
      startDate,
      dueDate
    });
    res.status(201).json({
      success: true,
      data: project,
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
});

// PUT /api/projects/:id - Update project
router.put(
  '/:id',
  param('id').isInt(),
  validateProjectUpdate,
  handleValidationErrors,
  (req, res) => {
    try {
      const { title, description, status, startDate, dueDate } = req.body;
      const project = Project.update(req.params.id, {
        title,
        description,
        status,
        startDate,
        dueDate
      });
      res.json({
        success: true,
        data: project,
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

// DELETE /api/projects/:id - Delete project
router.delete('/:id', param('id').isInt(), handleValidationErrors, (req, res) => {
  try {
    const result = Project.delete(req.params.id);
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
});

export default router;
