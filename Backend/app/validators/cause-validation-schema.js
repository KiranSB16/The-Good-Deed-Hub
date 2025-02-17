import Joi from "joi";

export const createCauseValidation = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    'string.empty': 'Title is required',
    'string.min': 'Title must be at least 5 characters',
    'string.max': 'Title must not exceed 100 characters',
  }),
  description: Joi.string().min(20).required().messages({
    'string.empty': 'Description is required',
    'string.min': 'Description must be at least 20 characters',
  }),
  goalAmount: Joi.number().positive().required().messages({
    'number.base': 'Goal amount must be a positive number',
    'number.positive': 'Goal amount must be greater than 0',
    'number.empty': 'Goal amount is required',
  }),
  startDate: Joi.date().optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional().messages({
    'date.greater': 'End date must be after the start date',
  }),
  category: Joi.string().required().messages({
    'string.empty': 'Category is required',
  }),
  fundraiserId: Joi.string().optional(),

  // ✅ Allow images and documents as an array of strings (URLs)
  images: Joi.array().items(Joi.string()).optional(),
  documents: Joi.array().items(Joi.string()).optional()
});

export const updateCauseValidation = Joi.object({
  title: Joi.string().min(5).max(100).optional(),
  description: Joi.string().min(20).optional(),
  goalAmount: Joi.number().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  category: Joi.string().optional(),

  // ✅ Allow updating images and documents
  images: Joi.array().items(Joi.string()).optional(),
  documents: Joi.array().items(Joi.string()).optional()
});
