const z = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

const transactionSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, { message: 'Category is required' }),
  date: z.string().optional(),
  note: z.string().optional(),
});

const budgetSchema = z.object({
  amount: z.number().positive(),
  type: z.enum(['overall', 'category']),
  category: z.string().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  transactionSchema,
  budgetSchema,
};
